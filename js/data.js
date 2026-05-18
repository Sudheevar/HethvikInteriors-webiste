/* ═══════════════════════════════════════════════════════════════
   FIRESTORE DATA LAYER  (compat SDK, classic script)

   Loaded after js/firebase-init.js, before js/login.js. Exposes
   `window.fbData` — an in-memory cache fronting three Firestore
   collections so that the existing *synchronous* read call sites in
   js/login.js (getQuotes/getBills/getProjects) keep working unchanged.

   Model:
   - upsert*/delete* update the in-memory cache SYNCHRONOUSLY and write
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

  /* In-memory caches (always the live arrays the getters read). */
  var _quotes   = [];
  var _bills    = [];
  var _projects = [];

  var _onChange     = null;   // (which) => void, set by start()
  var _startPromise = null;   // resolves after first snapshot of all 3
  var _importDone   = false;  // guard so the import prompt shows once

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
    db.collection(coll).onSnapshot(
      function (qs) {
        targetSetter(qs.docs.map(function (d) { return d.data(); }));
        if (first) { first = false; onFirst(); }
        _emit(which);
      },
      function (e) {
        console.error('[fbData] ' + coll + ' snapshot error', e);
        _err('Cloud sync error (' + coll + ').');
        if (first) { first = false; onFirst(); } // don't hang start()
      }
    );
  }

  function start(onChange) {
    if (onChange) _onChange = onChange;
    if (_startPromise) return _startPromise;

    var rq, rb, rp;
    var pQuotes   = new Promise(function (r) { rq = r; });
    var pBills    = new Promise(function (r) { rb = r; });
    var pProjects = new Promise(function (r) { rp = r; });

    _subscribe('quotes',   function (a) { _quotes   = a; }, 'quotes',   rq);
    _subscribe('bills',    function (a) { _bills    = a; }, 'bills',    rb);
    _subscribe('projects', function (a) { _projects = a; }, 'projects', rp);

    _startPromise = Promise.all([pQuotes, pBills, pProjects]).then(function () {});
    return _startPromise;
  }

  /* ── One-time localStorage → Firestore migration ─────────────── */
  function _readLS(key) {
    try {
      var v = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }

  // Returns a Promise<boolean> — true only if records were imported.
  function importLocalData() {
    if (_importDone) return Promise.resolve(false);
    _importDone = true;

    // Only offer import when the cloud is empty (fresh project).
    if (_quotes.length || _bills.length || _projects.length) {
      return Promise.resolve(false);
    }

    var lq = _readLS(LS_QUOTES);
    var lb = _readLS(LS_BILLS);
    var lp = _readLS(LS_PROJECTS);
    var total = lq.length + lb.length + lp.length;
    if (!total) return Promise.resolve(false);

    var ok = window.confirm(
      'Found ' + total + ' existing record(s) saved in this browser ' +
      '(quotations / bills / projects).\n\n' +
      'Import them to the cloud now? Your local copy is kept as a backup.'
    );
    if (!ok) return Promise.resolve(false);

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

    return batch.commit()
      .then(function () { return true; })
      .catch(function (e) {
        _err('Import failed: ' + ((e && e.message) || e));
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
    importLocalData: importLocalData,
    onError:       null,   // login.js sets this to a toast fn
  };
})();
