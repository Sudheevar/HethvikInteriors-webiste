# PROGRESS / HANDOFF — Firebase cloud-images project

Resume doc for a fresh session. Plan: `2026-05-19-firebase-cloud-images.md`
(same folder). Work branch: **`feature/firebase-cloud-images`** (pushed to
`origin`; GitHub Pages may be served from it for testing).

## Status snapshot (as of 2026-05-19)

| Phase | State |
|-------|-------|
| 0 — Firebase console setup | ✅ Done by user |
| 1 — Firebase wiring + Auth | ✅ Done, committed, **login verified working** |
| 2 — Async data layer (Firestore) | ✅ **DONE — user-verified working on live site** (incl. cross-device sync, logout, re-login, no re-import) |
| 3 — Image upload | ⬜ **NOT STARTED — start here.** Blocked only on the Storage decision (see below) |
| 4 — Embed images in PDF | ⬜ pending |
| 5 — Verification | ⬜ pending |

Commits on `feature/firebase-cloud-images` (all pushed):
- plan doc → `6bb0f88`
- Phase 1 (auth) → `afd2b34`
- progress doc → `d659200`
- Phase 2 (Firestore data layer) → `69a7518`
- progress doc (Phase 2 done) → `cb2e13d`
- **Phase 2 post-verification fixes** (found during user testing):
  - `71fd51f` — `*/` inside a block comment closed it early → whole
    script dead (Sign In / password toggle did nothing). Rule learned:
    never write `*/` in a comment; grep `\*/` after editing JS.
  - `379d3f0` — intermittent all-collections `permission-denied`:
    listeners attached before the auth token reached Firestore (a
    permission-denied listen is TERMINAL). Fix: `_awaitAuthReady()`
    before subscribing + bounded auto-resubscribe on permission-denied.
  - `6fe82f7` — stray error toast on logout: listeners not torn down.
    Fix: `fbData.stop()` (called from login.js `!user` branch) detaches
    listeners, clears caches, resets `_startPromise` so re-login
    re-subscribes; error handler treats logged-out denial as expected.
  - `0cac3fa` — **data-integrity bug**: re-login re-ran the localStorage
    import and resurrected records deleted on other devices. Fix:
    persistent `localStorage['hethvik_cloud_imported']` guard (import
    runs at most once per browser) + authoritative `limit(1).get()`
    Firestore-empty check instead of trusting the in-memory cache.
  - (also: user had to manually **Publish** `firestore.rules` in the
    Firebase console — no CLI deploy in this static-site setup. Rules
    are correct; this was a one-time console action.)

> **Phase 2 is complete and verified.** Proceed to Phase 3 (summary
> below; full detail in the plan doc). Phase 3 is blocked ONLY on the
> user's Storage decision: **Firebase Storage (Blaze plan + $1 budget
> alert)** vs **Cloudinary free tier**. Ask this first, then add
> `firebase-storage-compat.js` + `storage` to `window.fb` and publish
> `storage.rules` in the console.

## Firebase facts (already created, do not recreate)

- Project: `hethvik-interiors`
- Admin email: `sudheevarreddy171002@gmail.com`
- **Admin UID: `gyeOa3JKe1cyFosW5zGEIx6IqKl2`** (hardcoded in rules)
- Config lives in `js/firebase-init.js` (compat SDK; exposes `window.fb.auth`
  and `window.fb.db`; storage intentionally NOT yet added).
- Plan: **Firebase compat SDK via CDN** (NOT modular) so `js/login.js` stays a
  classic IIFE script — keep this approach.
- Firestore created in production mode; `firestore.rules` (repo root) published
  by user. `storage.rules` exists in repo, applied later in Phase 3.
- Spark (free) plan, no billing. Storage needs Blaze OR Cloudinary fallback —
  **decision deferred to Phase 3** (do not prompt for it during Phase 2).

## Outstanding user-side items (not blocking Phase 2 code)

- GitHub Pages source may be set to `feature/firebase-cloud-images`.
  Live URL: `https://sudheevar.github.io/HethvikInteriors-webiste/login.html`
- Add `sudheevar.github.io` to Firebase Auth → authorized domains (recommended).
- GitHub flagged the Firebase apiKey as a "secret": it is a **false positive**
  (Firebase web keys are public by design; data is protected by Auth + rules).
  Resolution given to user: close the alert + restrict the key by HTTP referrer
  in Google Cloud Console. No code/history change needed.

## Phase 1 — what was done (context for Phase 2)

- `login.html`: added Firebase compat SDK scripts (`app`, `auth`, `firestore`)
  + `js/firebase-init.js` before `js/login.js`. Login field changed to Email
  (`type="email"`, id still `loginUser`).
- `js/login.js`:
  - Removed `CREDENTIALS` and `SS_AUTH` consts (kept `LS_QUOTES`/`LS_BILLS`/
    `LS_PROJECTS`).
  - Login submit → `window.fb.auth.signInWithEmailAndPassword`; added
    `friendlyAuthError()` + `shakeLoginCard()`.
  - Logout → `window.fb.auth.signOut()`.
  - INIT block → `window.fb.auth.onAuthStateChanged(user => user ?
    showDashboard() : showLogin())` (replaced the old `sessionStorage` check).
- Data is STILL in `localStorage` after Phase 1 — intentional.

## Phase 2 — what was done (context for Phase 3)

- New `js/data.js` (classic IIFE) exposes `window.fbData`:
  - in-memory caches `_quotes/_bills/_projects`; `getQuotes/getBills/
    getProjects()` return `.slice()` (synchronous — read sites unchanged).
  - `upsertQuote/Bill/Project` + `deleteQuote/Bill/Project`: update the
    cache **synchronously** then `db.collection(...).doc(id).set/delete`.
    The sync cache update is why `convertToBill → showBillDetail` (same
    tick) still works without making callers async.
  - `start(onChange)`: `onSnapshot` on all 3 collections; replaces cache
    with server state + calls `onChange(which)` → reactive re-render.
    Returns a promise that resolves after the first snapshot of each.
  - `importLocalData()`: if cloud empty AND localStorage has data →
    `window.confirm` → batch-write to Firestore. `_importDone` guard so
    the prompt shows once. localStorage left intact as backup.
  - Doc IDs: quotes `q.id`, bills `b.billNo`, projects `String(p.id)`.
  - `onError` hook → login.js wires it to `showToast(..,'error')`.
- `login.html`: `<script src="js/data.js">` added between
  `firebase-init.js` and `login.js`.
- `js/login.js`:
  - Removed `LS_*` consts + localStorage get/save helpers. `getQuotes/
    Bills/Projects` now delegate to `window.fbData`. Added wrappers
    `upsertQuote/Bill/Project`, `deleteQuoteDoc/BillDoc/ProjectDoc`.
  - All mutation sites converted to per-doc ops with **cloned** objects
    (`Object.assign({}, src, patch)`) so the cache is never aliased:
    `saveQuote`, quote delete, `convertToBill`, `saveBillEdits` (+ synced
    source quote), bill `delete-bill` (+ quote status revert to `sent`),
    `markPaid`, project save (single upsert; dead LS fallback removed),
    project delete.
  - INIT: `onAuthStateChanged` → `fbData.start(rerender)` →
    `importLocalData()` → `showDashboard()` (toast if imported). Added
    `rerender(which)` + `refreshOpenBillDetail()` (reactive helpers).
  - Explicit `render*()` calls after mutations were kept (instant UX off
    the sync cache); `onSnapshot` re-render handles import/other devices.
- Behavior preserved: IDs from `.length`, status flow, quote↔bill sync,
  "testing" bill-delete reverts the quote. Data NOT auto-deleted from
  localStorage.

### Phase 2 — VERIFICATION STILL PENDING (user, on live site)

Run the checklist below on the live Pages URL. Until it passes, treat
Phase 2 as unverified and do **not** start Phase 3.

## PHASE 2 — detailed implementation spec (already implemented; kept for reference)

Goal: quotes/bills/projects persist in Firestore (multi-device), with a
one-time import of existing localStorage data. Keep behavior identical.

### Design decision (important — minimizes refactor risk)

Do **NOT** convert every caller to async. Instead use a
**load-into-cache + onSnapshot** model so existing *synchronous*
`getQuotes()/getBills()/getProjects()` keep working:

1. New `js/data.js` (classic script, loaded after `firebase-init.js`, before
   `login.js`; add `<script src="js/data.js"></script>` to `login.html`).
   Exposes `window.fbData` with:
   - in-memory caches `_quotes`, `_bills`, `_projects`
   - `getQuotes()/getBills()/getProjects()` → return `slice()` of cache
     (synchronous — keeps all existing read call sites unchanged)
   - `upsertQuote(q)/deleteQuote(id)`, `upsertBill(b)/deleteBill(billNo)`,
     `upsertProject(p)/deleteProject(id)` → write one doc to Firestore
     (`db.collection('quotes').doc(q.id).set(q)` etc.)
   - `start(onChange)` → attaches `onSnapshot` to the 3 collections, fills
     caches, calls `onChange(which)` so the UI re-renders reactively
   - `importLocalData()` → if all 3 Firestore collections empty AND
     localStorage has data, bulk-write local arrays to Firestore (one-time)
   - Firestore doc IDs: quotes = `q.id` (e.g. `HI-2026-0001`),
     bills = `b.billNo` (e.g. `HI-BILL-2026-0001`), projects = `String(p.id)`.

2. `js/login.js` changes:
   - Replace the `getQuotes/saveQuotes/...` localStorage helpers (≈ lines
     205–214) so reads delegate to `window.fbData` cache. The current code
     calls `saveQuotes(wholeArray)` after mutating an array — **refactor those
     mutation sites to per-doc ops** (`upsert*`/`delete*`). Sites to change
     (search the file):
     - `saveQuote()` → `upsertQuote(quote)` (was push/replace + `saveQuotes`)
     - quote list `delete` handler → `deleteQuote(id)`
     - `convertToBill()` → `upsertBill(bill)` + `upsertQuote(quote)` (status)
     - `saveBillEdits()` → `upsertBill(bill)` + (synced) `upsertQuote(quote)`
     - `markPaidBtn` handler → `upsertBill(bill)`
     - bill `delete-bill` handler → `deleteBill(billNo)` +
       `upsertQuote(quote)` (revert status) — keep the "testing" behavior
     - projects: `saveProjectBtn` → `upsertProject(project)`;
       `delete-project` → `deleteProject(id)`
   - `nextQuoteId()/nextBillId()/nextProjectId()` keep using the (now
     cache-backed) `getQuotes()/getBills()/getProjects()` — still sync. NOTE:
     IDs are derived from `.length`; with reactive cache this still works but
     verify no duplicate-ID race in normal single-admin use (acceptable).
   - `showDashboard()`: before first render, ensure `window.fbData.start(...)`
     has loaded once. Simplest: in INIT, on `onAuthStateChanged(user)` with a
     user → `await window.fbData.start(rerender); await importLocalData();`
     then `showDashboard()`. `start`'s `onChange` should call the matching
     `renderQuoteList()/renderBillList()/renderProjectList()` (+ refresh open
     bill detail if visible).
   - The render functions stay synchronous (they read the cache). Only INIT
     becomes async — keep the async surface tiny.

3. One-time migration UX: after `start()`, if Firestore empty & localStorage
   non-empty, show a toast/confirm "Import existing local data to the cloud?"
   → `importLocalData()` → toast done. Do not auto-delete localStorage (leave
   as backup).

### Files for Phase 2
- New: `js/data.js`
- Modify: `login.html` (add `js/data.js` script tag after firebase-init.js),
  `js/login.js` (delegate reads to cache; convert mutation sites to
  `upsert*`/`delete*`; make INIT await `start`+import).

### Phase 2 verification (manual; no test framework)
1. Publish-rules already done. Log in on the live Pages URL.
2. If you had local quotes/bills: a one-time import prompt appears → accept →
   they show up; refresh → still there (now from Firestore).
3. Create a new quote → appears; open Firebase console → Firestore → it's a
   doc in `quotes`. Convert to Bill → doc in `bills`, quote status `converted`.
4. Edit Bill → bill + source quote updated in Firestore. Delete bill (testing)
   → bill doc removed, quote status reverted.
5. Open the site in a **different browser** and log in → same data appears
   (cloud sync proven).
6. Logged-out direct Firestore read denied (rules).
7. Console: no red errors.
Commit on `feature/firebase-cloud-images`, push, pause for user review.

## Phases 3–5 (summary, after Phase 2)

- **3:** "Design Images" section + `<input type=file multiple>`; client-side
  canvas compression (~1280px, JPEG ~0.8); upload to Firebase Storage
  (`quotes/{id}/...`, `bills/{billNo}/...`); store `{url,path,name}` in record
  `images[]`; thumbnails + delete; carry through convert/edit (extend
  `saveBillEdits` `fields` + `loadBillIntoBuilder` prefill). Decide
  Storage(Blaze+$1 budget) vs Cloudinary first. Add `storage.rules` in console.
  Add `firebase-storage-compat.js` + `storage` to `window.fb`.
- **4:** `printDocument()` adds a "Design Images" block; wait for `<img>` load
  before `w.print()`; add CSS to `PRINT_STYLES`.
- **5:** Full 8-point end-to-end verification (see plan doc), then merge
  `feature/firebase-cloud-images` → `main` when user approves.

## Reuse / gotchas

- Projects already have multi-image-by-URL patterns (`addPhotoUrlRow`,
  `project.photos`, `.pac-thumb` onerror) — reuse for Phase 3 thumbnails.
- `convertToBill()` deep-copies the quote (`JSON.parse(JSON.stringify)`), so
  new fields like `images` propagate automatically.
- `js/login.js` is one large IIFE; function declarations are hoisted, consts
  are not — keep new element refs near existing ones.
- Compat SDK only (no ES modules / no bundler — static GitHub Pages site,
  `node` not available locally).
