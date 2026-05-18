/* ═══════════════════════════════════════════════════════════════
   FIRESTORE DATA LAYER  (compat SDK, classic script)

   Loaded after js/firebase-init.js, before js/login.js. Exposes
   `window.fbData` — an in-memory cache fronting three Firestore
   collections so that the existing *synchronous* read call sites in
   js/login.js (getQuotes/getBills/getProjects) keep working unchanged.

   Model:
   - upsert and delete ops update the in-memory cache SYNCHRONOUSLY and write
     one document to Firestore (fire-and-forget). The synchronous cache
     update is what lets callers read back their own write immediately
     (e.g. convertToBill → showBillDetail in the same tick).
   - start() attaches onSnapshot to all three collections. Each snapshot
     replaces the corresponding cache with the authoritative server
     state and invokes onChange(which) so the UI re-renders reactively
     (covers cross-device sync and the one-time local→cloud import).

   Firestore doc IDs: quotes = quote.id (e.g. HI-2026-0001),
   bills = bill.billNo (e.g. HI-BILL-2026-0001),
   projects = String(project.id).
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (!window.fb || !window.fb.db) {
    console.error('[fbData] Firestore unavailable — window.fb.db missing.');
    window.fbData = null;
    return;
  }

  var db = window.fb.db;

  var LS_QUOTES   = 'hethvik_quotes';
  var LS_BILLS    = 'hethvik_bills';
  var LS_PROJECTS = 'hethvik_projects';
  var LS_IMPORTED = 'hethvik_cloud_imported';  // persistent one-time-import guard

  /* In-memory caches (always the live arrays the getters read). */
  var _quotes   = [];
  var _bills    = [];
  var _projects = [];

  var _onChange     = null;   // (which) => void, set by start()
  var _startPromise = null;   // resolves after first snapshot of all 3
  var _importDone   = false;  // guard so the import prompt shows once
  var _unsub        = {};     // active onSnapshot unsubscribe fns, by collection
  var _denyRetry    = {};     // permission-denied retry counts, by collection
  var MAX_DENY_RETRIES = 5;
  var DENY_RETRY_MS    = 1500;

  /* ── Error surfacing ─────────────────────────────────────────── */
  function _err(msg) {
    console.error('[fbData] ' + msg);
    if (window.fbData && typeof window.fbData.onError === 'function') {
      try { window.fbData.onError(msg); } catch (e) { /* noop */ }
    }
  }

  function _writeFailed(label) {
    return function (e) {
      _err(label + ' failed: ' + ((e && e.message) || e));
      // Swallow — callers ignore the returned promise. The next
      // snapshot reconciles the cache with the server.
    };
  }

  /* ── Synchronous reads (cache) ───────────────────────────────── */
  function getQuotes()   { return _quotes.slice(); }
  function getBills()    { return _bills.slice(); }
  function getProjects() { return _projects.slice(); }

  /* ── Per-document writes ─────────────────────────────────────── */
  function _upsert(arr, idField, obj) {
    var id = String(obj[idField]);
    var i  = arr.findIndex(function (x) { return String(x[idField]) === id; });
    if (i >= 0) arr[i] = obj; else arr.push(obj);
    return id;
  }

  function _removeFrom(arr, idField, idVal) {
    var id = String(idVal);
    for (var i = arr.length - 1; i >= 0; i--) {
      if (String(arr[i][idField]) === id) arr.splice(i, 1);
    }
    return id;
  }

  function upsertQuote(q) {
    var id = _upsert(_quotes, 'id', q);
    return db.collection('quotes').doc(id).set(q).catch(_writeFailed('Save quotation'));
  }
  function deleteQuote(id) {
    id = _removeFrom(_quotes, 'id', id);
    return db.collection('quotes').doc(id).delete().catch(_writeFailed('Delete quotation'));
  }

  function upsertBill(b) {
    var id = _upsert(_bills, 'billNo', b);
    return db.collection('bills').doc(id).set(b).catch(_writeFailed('Save bill'));
  }
  function deleteBill(billNo) {
    var id = _removeFrom(_bills, 'billNo', billNo);
    return db.collection('bills').doc(id).delete().catch(_writeFailed('Delete bill'));
  }

  function upsertProject(p) {
    var id = _upsert(_projects, 'id', p);
    return db.collection('projects').doc(id).set(p).catch(_writeFailed('Save project'));
  }
  function deleteProject(id) {
    id = _removeFrom(_projects, 'id', id);
    return db.collection('projects').doc(id).delete().catch(_writeFailed('Delete project'));
  }

  /* ── Snapshot subscriptions ──────────────────────────────────── */
  function _emit(which) {
    if (typeof _onChange === 'function') {
      try { _onChange(which); } catch (e) { console.error('[fbData] onChange', e); }
    }
  }

  function _subscribe(coll, targetSetter, which, onFirst) {
    var first = true;
    if (_unsub[coll]) { try { _unsub[coll](); } catch (e) { /* noop */ } }
    _unsub[coll] = db.collection(coll).onSnapshot(
      function (qs) {
        _denyRetry[coll] = 0;
        targetSetter(qs.docs.map(function (d) { return d.data(); }));
        if (first) { first = false; onFirst(); }
        _emit(which);
      },
      function (e) {
        // Never hang start(): let the dashboard show even on error.
        if (first) { first = false; onFirst(); }

        // Expected right after logout: signOut() leaves the listeners
        // attached for an instant and Firestore re-runs them with no
        // auth. Not an error — drop the listener quietly, no toast, no
        // retry. stop() also tears these down on the logout path.
        if (!(window.fb.auth && window.fb.auth.currentUser)) {
          if (_unsub[coll]) {
            try { _unsub[coll](); } catch (x) { /* noop */ }
            _unsub[coll] = null;
          }
          return;
        }

        // A listen rejected with permission-denied is TERMINAL — the SDK
        // will not retry it. On a restored session the first listen can
        // race ahead of the auth token reaching Firestore (and freshly
        // published rules take a moment to propagate). Re-subscribe a few
        // times with backoff before surfacing the error.
        var n = _denyRetry[coll] || 0;
        if (e && e.code === 'permission-denied' && n < MAX_DENY_RETRIES) {
          _denyRetry[coll] = n + 1;
          setTimeout(function () {
            _subscribe(coll, targetSetter, which, onFirst);
          }, DENY_RETRY_MS);
          return;
        }

        console.error('[fbData] ' + coll + ' snapshot error', e);
        _err('Cloud sync error (' + coll + ').');
      }
    );
  }

  // Resolve the signed-in user's ID token BEFORE the first listen so
  // Firestore sends authenticated requests (avoids the startup race
  // where listeners attach before the token reaches the SDK).
  function _awaitAuthReady() {
    return new Promise(function (resolve) {
      var auth = window.fb.auth;
      function ready(u) {
        if (!u) { resolve(); return; }
        u.getIdToken().then(function () { resolve(); },
                            function () { resolve(); });
      }
      if (auth && auth.currentUser) { ready(auth.currentUser); return; }
      if (!auth) { resolve(); return; }
      var off = auth.onAuthStateChanged(function (u) { off(); ready(u); });
    });
  }

  function start(onChange) {
    if (onChange) _onChange = onChange;
    if (_startPromise) return _startPromise;

    _startPromise = _awaitAuthReady().then(function () {
      var rq, rb, rp;
      var pQuotes   = new Promise(function (r) { rq = r; });
      var pBills    = new Promise(function (r) { rb = r; });
      var pProjects = new Promise(function (r) { rp = r; });

      _subscribe('quotes',   function (a) { _quotes   = a; }, 'quotes',   rq);
      _subscribe('bills',    function (a) { _bills    = a; }, 'bills',    rb);
      _subscribe('projects', function (a) { _projects = a; }, 'projects', rp);

      return Promise.all([pQuotes, pBills, pProjects]);
    }).then(function () {});
    return _startPromise;
  }

  // Tear everything down on logout. Detaches the listeners (so they
  // don't fire permission-denied with no auth), clears the caches, and
  // resets _startPromise so the next login re-subscribes from scratch.
  function stop() {
    Object.keys(_unsub).forEach(function (k) {
      if (_unsub[k]) { try { _unsub[k](); } catch (e) { /* noop */ } }
    });
    _unsub        = {};
    _denyRetry    = {};
    _quotes       = [];
    _bills        = [];
    _projects     = [];
    _startPromise = null;
  }

  /* ── One-time localStorage → Firestore migration ─────────────── */
  function _readLS(key) {
    try {
      var v = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }

  // Returns a Promise<boolean> — true only if records were imported now.
  // Idempotent and safe: a persistent localStorage flag means it can run
  // at most once per browser, and it checks Firestore authoritatively
  // (not the maybe-stale in-memory cache) before deciding the cloud is
  // empty — so a startup timing window can never resurrect deleted docs.
  function importLocalData() {
    if (_importDone) return Promise.resolve(false);
    _importDone = true;

    if (localStorage.getItem(LS_IMPORTED) === '1') return Promise.resolve(false);

    var lq = _readLS(LS_QUOTES);
    var lb = _readLS(LS_BILLS);
    var lp = _readLS(LS_PROJECTS);
    var total = lq.length + lb.length + lp.length;
    if (!total) return Promise.resolve(false);

    function markDone() {
      try { localStorage.setItem(LS_IMPORTED, '1'); } catch (e) { /* noop */ }
    }

    return Promise.all([
      db.collection('quotes').limit(1).get(),
      db.collection('bills').limit(1).get(),
      db.collection('projects').limit(1).get()
    ]).then(function (snaps) {
      var cloudEmpty = snaps[0].empty && snaps[1].empty && snaps[2].empty;
      if (!cloudEmpty) {
        // Cloud already has data — importing would duplicate records and
        // resurrect ones deleted elsewhere. Never ask again.
        markDone();
        return false;
      }

      var ok = window.confirm(
        'Found ' + total + ' record(s) saved only in this browser ' +
        '(quotations / bills / projects).\n\n' +
        'Import them to the cloud now? This is a one-time migration; ' +
        'your local copy is kept as a backup.'
      );
      if (!ok) { markDone(); return false; }

      var batch = db.batch();
      lq.forEach(function (q) {
        if (q && q.id != null) batch.set(db.collection('quotes').doc(String(q.id)), q);
      });
      lb.forEach(function (b) {
        if (b && b.billNo != null) batch.set(db.collection('bills').doc(String(b.billNo)), b);
      });
      lp.forEach(function (p) {
        if (p && p.id != null) batch.set(db.collection('projects').doc(String(p.id)), p);
      });

      return batch.commit().then(function () {
        markDone();
        return true;
      }).catch(function (e) {
        _err('Import failed: ' + ((e && e.message) || e));
        return false; // not marked done — safe to retry next login
      });
    }).catch(function (e) {
      // Couldn't verify the cloud is empty — skip import (safer than
      // risking duplicates). Will re-check on the next login.
      console.error('[fbData] import check failed', e);
      return false;
    });
  }

  /* ── Public surface ──────────────────────────────────────────── */
  window.fbData = {
    getQuotes:     getQuotes,
    getBills:      getBills,
    getProjects:   getProjects,
    upsertQuote:   upsertQuote,
    deleteQuote:   deleteQuote,
    upsertBill:    upsertBill,
    deleteBill:    deleteBill,
    upsertProject: upsertProject,
    deleteProject: deleteProject,
    start:         start,
    stop:          stop,
    importLocalData: importLocalData,
    onError:       null,   // login.js sets this to a toast fn
  };
})();
