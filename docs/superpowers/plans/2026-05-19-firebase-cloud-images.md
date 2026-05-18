# Plan: Cloud-backed Quotes/Bills with Design Image Upload (Firebase)

> Tracking doc for phased implementation. Phases 0–5 are completed and
> reviewed one at a time. Approved 2026-05-19.

## Context

The Hethvik Interiors admin portal (`login.html` + `js/login.js` +
`css/login.css`) is a static GitHub Pages site. Today **all data lives only in
the browser's `localStorage`** (`hethvik_quotes`, `hethvik_bills`,
`hethvik_projects`) and the "admin login" is a hardcoded client-side credential
(`admin` / `hethvik2025`). Projects reference images by *pasted URL*; there is
no file upload anywhere.

The customer wants to **upload 2D/3D design images to each quotation/bill** and
have them **embedded in the generated PDF**, with full cloud persistence
(records + images, multi-device, durable), at minimal cost.

## Cost summary

- **Firebase (Google Cloud):** Firestore (records) + Cloud Storage (images) +
  Auth (admin login). Site stays on GitHub Pages.
- Cloud Storage needs the **Blaze** plan, but Blaze has a **free monthly
  allotment** (~5 GB stored, ~1 GB/day download; Firestore ~1 GB / 50k reads /
  20k writes per day). Studio volume + client-side image compression →
  **expected $0/month**.
- **Safeguard:** Cloud Billing **budget alert at $1** + keep client-side
  compression on.
- No-card fallback: Firestore (Spark) + Cloudinary free tier for images.
- **Website hosting:** GitHub Pages $0 (keep it) / Firebase Hosting $0
  (optional). Only optional recurring cost: custom domain ≈ $10–15/yr.

## Architecture

- **Auth:** Firebase Auth (Email/Password), one admin user; replaces the
  hardcoded credential. Security rules gate all data to the admin UID.
- **Data layer:** new async module mirroring existing helper names
  (`getQuotes/saveQuotes`, `getBills/saveBills`, `getProjects/saveProjects`)
  backed by Firestore + `onSnapshot` + in-memory cache. Existing synchronous
  callers in `js/login.js` become `async/await`.
- **Firestore model:** collections `quotes` (doc id = quote id), `bills`
  (doc id = billNo), `projects`; existing object shapes plus
  `images: [{ url, path, name }]`.
- **Storage:** `quotes/{quoteId}/{file}`, `bills/{billNo}/{file}`; store
  download URL + path in the record's `images`.
- **PDF:** `printDocument()` gains a "Design Images" section.

## Phases

### Phase 0 — Firebase console setup (user, no code)
Create project; enable Auth (Email/Password) + create admin user; enable
Firestore (production) + Cloud Storage; upgrade to Blaze; set **$1 budget
alert**. Return web config + admin email + admin UID.

### Phase 1 — Firebase wiring + Auth
- `login.html`: Firebase modular SDK + `js/firebase-init.js` exposing
  `auth`, `db`, `storage`.
- `js/login.js`: replace `CREDENTIALS` / `sessionStorage` auth with
  `signInWithEmailAndPassword` / `onAuthStateChanged` / `signOut`; keep GSAP UI.
- Deliver `firestore.rules` + `storage.rules` (admin-uid-gated), applied in
  console.

### Phase 2 — Async data layer (records → Firestore)
- New `js/data.js`: async CRUD + `subscribe*` via `onSnapshot`.
- `js/login.js`: make `saveQuote`, `saveBillEdits`, `convertToBill`,
  `loadQuoteIntoBuilder`, `loadBillIntoBuilder`, delete handlers, project
  save/delete, and render functions async; swap localStorage calls. Preserve
  IDs, status flow, quote↔bill sync, testing delete-bill behavior.
- One-time migration: if Firestore empty and localStorage has data, offer
  "Import existing local data".

### Phase 3 — Image upload on quotation/bill
- `login.html`: "Design Images (2D / 3D)" section with
  `<input type="file" accept="image/*" multiple>` + thumbnail strip.
- `js/login.js`: client-side `<canvas>` compress/resize (~1280px, JPEG ~0.8) →
  upload to Storage → push `{url,path,name}` to record `images`; thumbnails with
  delete (also deletes Storage object). Reuse Projects' add/remove-row +
  `.pac-thumb` onerror pattern. Extend `saveBillEdits` `fields` +
  `loadBillIntoBuilder` prefill with `images` (`convertToBill` deep-copy already
  carries them).
- `css/login.css`: thumbnail grid + file-input styling.

### Phase 4 — Embed images in the PDF
- `printDocument()`: "Design Images" block after totals/terms; wait for image
  load before `print()`; add rules to `PRINT_STYLES`.

### Phase 5 — Verification (manual; no test framework)
1. Console: Auth user, Firestore+Storage on, Blaze on, $1 budget alert.
2. Login via Firebase; wrong password rejected.
3. Create quote + 2–3 images; reload → persisted from Firestore.
4. Convert→Bill carries images; Edit Bill preserves; quote stays synced.
5. PDF (quote + bill) embeds images; not blank.
6. Different browser/device → same data + images (cloud sync).
7. Logged-out direct Firestore/Storage read denied (rules verified).
8. Usage within free allotment.

## Critical files

- `login.html`, `js/login.js`, `css/login.css`
- New: `js/firebase-init.js`, `js/data.js`
- Console deliverables: `firestore.rules`, `storage.rules`

## Reuse

- Projects' `addPhotoUrlRow`, `project.photos`, `renderProjectList` thumbnail
  `onerror` fallback (`.pac-thumb`).
- `convertToBill()` deep-copy propagates `images` automatically.
- `saveBillEdits()` `fields` + `loadBillIntoBuilder()` prefill = single points
  to extend for bill-side `images`.
- `showToast` for upload progress/errors.

## Risks

- Sync→async refactor touches many `js/login.js` call sites (Phase 2 heaviest);
  mitigate by keeping data-module names identical, convert methodically.
- Firebase web `apiKey` is public by design; security depends on Auth + rules
  (Phase 1) — also finally removes the insecure hardcoded password.
- Cost held at $0 via free allotment + compression + $1 budget alert.
- Existing localStorage data preserved and importable once (Phase 2).
