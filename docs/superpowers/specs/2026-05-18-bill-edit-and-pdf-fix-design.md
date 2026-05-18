# Design: Editable Final Bill + Blank-PDF Fix

Date: 2026-05-18
Area: `js/login.js`, `login.html`, `css/login.css` (Hethvik Interiors admin portal)

## Problem

Two issues reported against the admin portal:

1. **Blank PDF.** Clicking "Download PDF" (on a quotation or a bill) produces a
   blank page in Chrome's "Save as PDF". Root cause: `printDocument()` injects
   markup into `#printTemplate`, flips it to `display:block`, and calls
   `window.print()` in the same synchronous task, relying on the host page's
   `@media print` rules. The print snapshot happens before the just-shown
   template is laid out. A prior patch only deferred teardown via `afterprint`;
   it never addressed the pre-print layout timing, so it stays blank.

2. **No way to build the final bill.** "Convert to Bill" already saves and lists
   the bill correctly (verified by code trace; no console errors). The real gap:
   the Bills tab is read-only, so the admin cannot add the additional line items
   needed to turn the converted quotation into the final bill.

## Goals

- Downloading a PDF (quote or bill) reliably produces the full document.
- The admin can edit a converted bill — add/edit line items, adjust
  discount/GST/notes — and save it as the final bill.
- Editing a bill keeps the source quotation in sync (identical records).

## Non-goals

- No new builder UI: reuse the existing Quotation builder.
- No change to how `convertToBill()` creates/lists bills (it works).
- No change to authentication, projects, or quotation creation flow.

## Part 1 — Blank-PDF fix (dedicated print window)

Rewrite `printDocument(data, type)` in `js/login.js`:

- Build the same `.print-doc` markup string as today (header, Bill-To box,
  items table, totals, terms, footer). Content logic unchanged.
- Introduce a `PRINT_STYLES` string constant containing the CSS rules that
  currently live inside the `@media print { … }` block of `css/login.css`,
  with the `@media print` wrapper removed and `@page { size: A4; margin: 0; }`
  retained.
- `const w = window.open('', '_blank');`
  - If `w` is null (popup blocked): `showToast('Allow pop-ups to download the
    PDF.', 'error')` and return.
  - Otherwise write a complete standalone document: `<head>` with the Google
    Fonts `<link>` (Playfair Display + Jost) and `<style>${PRINT_STYLES}</style>`,
    `<body>` containing the document markup. Then `w.document.close()`.
- `w.onload = () => { w.focus(); w.print(); w.close(); };`
- Remove the replaced machinery:
  - `#printTemplate` div from `login.html`
  - the entire `@media print { … }` block from `css/login.css`
  - the `afterprint` / `matchMedia` teardown code in `printDocument()`

Because the new window contains only the document and its own styles, the
output cannot be blank from host-page timing or `display:none` races. Both the
quotation "Download PDF" and the bill "Download PDF" paths use this one
function and are fixed together.

## Part 2 — Editable final bill

### State

Add `editingBillNo` (`string | null`) alongside the existing `editingQuoteId`
in the IIFE scope.

Throughout this spec, "primary save button" means the existing
`#saveQuoteBtn` element (currently labelled "Save Quotation"); "Save Draft"
means `#saveDraftBtn`.

### Entry points

Add an **"Edit Bill"** action:
- in the bill detail panel, alongside "Download PDF" / "Mark as Paid";
- on each bill card's action row (currently View / PDF).

Both call `loadBillIntoBuilder(billNo)`.

### `loadBillIntoBuilder(billNo)`

- Find the bill in `getBills()`. If not found, return.
- `editingBillNo = billNo`; `editingQuoteId = bill.quoteId`.
- Populate the existing quotation builder from the bill: client name/phone/
  address, discount, GST, notes, and one item row per `bill.items` entry
  (reuse the row-building path used by `loadQuoteIntoBuilder`). Recalculate
  totals.
- Bill-mode UI:
  - `builderTitle` → "Editing Bill"
  - `quoteIdBadge` → `bill.billNo`
  - primary save button label → "Update Bill"
  - "Save Draft" button hidden (a final bill is not a draft)
- Switch to the Quotations tab and scroll to the builder.

### Saving — `saveBillEdits()` (update bill + sync quote)

When `editingBillNo` is set, the primary save button calls `saveBillEdits()`
instead of `saveQuote()`:

- Validate client name (same rule as quotations); abort with error toast if
  empty.
- Rebuild items and totals from the builder (reuse the existing
  `buildQuoteObject` math).
- Update the matching bill in `getBills()`: overwrite client fields, items,
  subtotal, discountAmount, gstPercent, gstAmount, grandTotal, notes.
  **Preserve** `billNo`, `billDate`, `quoteId`, and `status` (a `paid` bill
  stays `paid`). `saveBills(...)`.
- Sync the source quote: in `getQuotes()`, find the quote whose `id ===
  bill.quoteId`; write the same fields into it, preserving the quote's `id`,
  `date`, and `converted` status. If no such quote (deleted), skip silently.
  `saveQuotes(...)`.
- `showToast('Bill <billNo> updated!')`.
- Reset the builder out of bill-mode (`clearBuilder()`), re-render the quote
  list and bill list, switch to the Bills tab, and `showBillDetail(billNo)`.

### Supporting changes

- `clearBuilder()` also resets bill-mode: `editingBillNo = null`, title back to
  "New Quotation", "Save Draft" shown again, primary button label back to
  "Save Quotation".
- The builder's "Download PDF" prints as `FINAL BILL` when `editingBillNo` is
  set, otherwise `QUOTATION`.
- The primary save button's click handler branches: if `editingBillNo` is set
  → `saveBillEdits()`, else existing `saveQuote('sent')`.
- `convertToBill()` unchanged (already correct, including the existing
  `selectedBillId` / `showBillDetail` follow-up).

### Edge cases

- Editing a `paid` bill is allowed; its `paid` status is preserved on save.
- Source quote missing (deleted after conversion): bill still updates; quote
  sync is skipped without error.
- "Save Draft" is unreachable in bill-mode (button hidden), so no draft-state
  ambiguity for bills.

## Affected files

- `js/login.js` — rewrite `printDocument`; add `PRINT_STYLES`,
  `editingBillNo`, `loadBillIntoBuilder`, `saveBillEdits`; branch the save
  button + builder PDF type; extend `clearBuilder`; add "Edit Bill" buttons and
  their list/detail click handling.
- `login.html` — remove `#printTemplate`; add "Edit Bill" button in the bill
  detail panel.
- `css/login.css` — remove the `@media print { … }` block (moved into JS).

## Testing

Manual (static site, no test framework):

1. Create a quotation with line items → Download PDF → PDF shows full content
   (not blank).
2. Convert quotation to bill → appears in Bills tab.
3. Edit Bill → builder pre-fills with bill data, title "Editing Bill", badge =
   bill number, no "Save Draft".
4. Add an extra line item → Update Bill → returns to Bills tab; bill detail and
   PDF show original + added items with recalculated totals.
5. Open the source quotation → it reflects the same updated items/totals.
6. Mark a bill paid, then Edit Bill and save → still `paid`.
7. Bill "Download PDF" → non-blank, header reads FINAL BILL.
