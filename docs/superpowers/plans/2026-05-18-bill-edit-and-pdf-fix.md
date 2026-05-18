# Editable Final Bill + Blank-PDF Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make "Download PDF" reliably render the full document, and let the admin add line items to a converted bill (synced back to the source quotation).

**Architecture:** Replace the host-page `@media print` mechanism with a self-contained pop-up window that holds only the document + its styles. Reuse the existing Quotation builder for bill editing via a new `editingBillNo` mode; on save, update the bill and write identical fields into the source quote.

**Tech Stack:** Vanilla JS (IIFE in `js/login.js`), static HTML/CSS, GSAP (CDN). No build, no test framework, no Node — verification is manual in a browser.

**Spec:** `docs/superpowers/specs/2026-05-18-bill-edit-and-pdf-fix-design.md`

---

## Testing note

This is a static site with **no test runner**. Each task's verification is a concrete manual browser procedure with exact steps and expected results. Login credentials: employee ID `admin`, password `hethvik2025`. Open `login.html` directly in Chrome (double-click, or `start login.html` from the repo root in PowerShell).

## File Structure

- `js/login.js` — all behavior. Add `PRINT_STYLES` constant; rewrite `printDocument`; add `editingBillNo`, `loadBillIntoBuilder`, `saveBillEdits`; branch the save button and builder-PDF type; extend `clearBuilder`; add Edit-Bill wiring.
- `login.html` — remove `#printTemplate`; add `#editBillBtn` to the bill detail panel.
- `css/login.css` — remove the now-dead `@media print { … }` block.

Work happens on branch `fix/bill-edit-and-pdf` (already created; the design spec is already committed there).

---

### Task 1: Baseline commit of existing working-tree changes

The working tree already has uncommitted edits to `js/login.js` (an in-progress `convertToBill` improvement the spec keeps, plus a failed `afterprint` patch that Task 2 will delete). Commit **only** `js/login.js` so later task diffs are clean. Leave `.claude/settings.local.json` and `.vscode/` untouched.

**Files:**
- Modify: `js/login.js` (no edits — just commit current state)

- [ ] **Step 1: Inspect what will be committed**

Run: `git diff --stat js/login.js`
Expected: shows `js/login.js` modified (the `convertToBill` / null-safety / afterprint working changes).

- [ ] **Step 2: Stage and commit only login.js**

```bash
git add js/login.js
git commit -m "$(cat <<'EOF'
Baseline: commit in-progress login.js working changes

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: Verify clean baseline**

Run: `git status --porcelain js/login.js`
Expected: no output (login.js fully committed). `.claude/settings.local.json` / `.vscode/` may still show — that is fine, leave them.

---

### Task 2: Blank-PDF fix — dedicated print window

Replace the `#printTemplate` + `@media print` approach with a standalone pop-up window. The document markup is unchanged; only the delivery mechanism changes.

**Files:**
- Modify: `js/login.js` — add `PRINT_STYLES` constant; rewrite `printDocument()` (currently ~lines 705–835, including the `afterprint`/`matchMedia` teardown)
- Modify: `login.html` — remove the `#printTemplate` div (line ~436)
- Modify: `css/login.css` — remove the entire `@media print { … }` block (lines ~798–1001)

- [ ] **Step 1: Add the `PRINT_STYLES` constant**

In `js/login.js`, immediately after the `DEFAULT_TERMS` constant block (just before the `STORAGE HELPERS` section comment, ~line 19), insert:

```js
  /* ═══════════════════════════════════════════════════════════════
     PRINT STYLESHEET (used by the standalone print window)
     ═══════════════════════════════════════════════════════════════ */
  const PRINT_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #fff;
    color: #1a1a1a;
    font-family: 'Jost', 'Segoe UI', sans-serif;
  }
  .print-doc {
    max-width: 100%;
    padding: 15mm 18mm;
    background: #fff;
    position: relative;
  }
  .print-watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-35deg);
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 72pt;
    font-weight: 700;
    color: rgba(201,168,76,0.07);
    letter-spacing: 0.05em;
    white-space: nowrap;
    pointer-events: none;
    z-index: 0;
  }
  .print-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 8mm;
    border-bottom: 2pt solid #C9A84C;
    margin-bottom: 8mm;
    position: relative;
    z-index: 1;
  }
  .print-company h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 22pt;
    color: #1a1a1a;
    margin: 0 0 2mm;
  }
  .print-company p {
    font-size: 9pt;
    color: #666;
    margin: 0;
    line-height: 1.6;
  }
  .print-doc-type { text-align: right; }
  .print-doc-type h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 18pt;
    color: #C9A84C;
    margin: 0 0 2mm;
    letter-spacing: 0.08em;
  }
  .print-doc-type p {
    font-size: 9pt;
    color: #666;
    margin: 0.5mm 0;
  }
  .print-doc-type .print-id {
    font-size: 10pt;
    font-weight: 600;
    color: #1a1a1a;
  }
  .print-client-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8mm;
    margin-bottom: 8mm;
    position: relative;
    z-index: 1;
  }
  .print-client-box h4 {
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #999;
    margin: 0 0 2mm;
  }
  .print-client-box p {
    font-size: 10pt;
    margin: 0.75mm 0;
    color: #1a1a1a;
    line-height: 1.5;
  }
  .print-client-box .client-name { font-size: 12pt; font-weight: 600; }
  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 6mm;
    font-size: 9.5pt;
    position: relative;
    z-index: 1;
  }
  .print-table thead tr { background: #C9A84C; }
  .print-table th {
    padding: 2.5mm 3mm;
    color: #fff;
    font-weight: 600;
    text-align: left;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .print-table td {
    padding: 2mm 3mm;
    border-bottom: 0.5pt solid #e8e8e8;
    color: #2a2a2a;
  }
  .print-table tbody tr:nth-child(even) td { background: #fafafa; }
  .print-table .total-td {
    font-weight: 600;
    color: #1a1a1a;
  }
  .print-totals-section {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8mm;
    position: relative;
    z-index: 1;
  }
  .print-totals-box {
    width: 72mm;
    border: 1pt solid #e0e0e0;
    border-radius: 3mm;
    overflow: hidden;
  }
  .print-totals-row {
    display: flex;
    justify-content: space-between;
    padding: 2mm 4mm;
    font-size: 9.5pt;
    border-bottom: 0.5pt solid #e8e8e8;
    color: #444;
  }
  .print-totals-row:last-child { border-bottom: none; }
  .print-totals-row.grand-row {
    background: #C9A84C;
    color: #fff;
    font-weight: 700;
    font-size: 11pt;
  }
  .print-discount-row { color: #2a8c5a; }
  .print-terms {
    border-top: 1pt solid #e0e0e0;
    padding-top: 5mm;
    margin-top: 5mm;
    position: relative;
    z-index: 1;
  }
  .print-terms h4 {
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #999;
    margin: 0 0 3mm;
  }
  .print-terms p {
    font-size: 8pt;
    color: #666;
    line-height: 1.7;
    margin: 0;
    white-space: pre-line;
  }
  .print-footer {
    position: fixed;
    bottom: 10mm;
    left: 18mm;
    right: 18mm;
    display: flex;
    justify-content: space-between;
    font-size: 7.5pt;
    color: #aaa;
    border-top: 0.5pt solid #ddd;
    padding-top: 3mm;
  }
  @page { size: A4; margin: 0; }
  `;
```

- [ ] **Step 2: Replace `printDocument()` with the print-window version**

In `js/login.js`, replace the **entire** `printDocument` function — from `function printDocument(data, type) {` through its closing `}` (this includes the old `printTemplate.innerHTML = …`, `printTemplate.style.display`, the `teardownPrint`/`onMqlChange`/`afterprint`/`matchMedia` block, and `window.print()`) — with:

```js
  function printDocument(data, type) {
    const isQuote = type === 'QUOTATION';
    const docNo   = isQuote ? data.id : data.billNo;
    const docDate = isQuote ? fmtDate(data.date) : fmtDate(data.billDate);

    const itemsHTML = (data.items || []).map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.place}</td>
        <td>${item.sqft} sqft</td>
        <td>${item.material}</td>
        <td style="text-align:right">₹${(item.pricePerSqft || 0).toLocaleString('en-IN')}</td>
        <td style="text-align:right" class="total-td">₹${Math.round(item.total).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const docHTML = `
      <div class="print-doc">
        <div class="print-watermark">${type}</div>
        <div class="print-header">
          <div class="print-company">
            <h1>Hethvik <span style="color:#C9A84C">Interiors</span></h1>
            <p>Premium Interior Design Studio</p>
            <p>Office: Hethvik Decor Mart, Kada Agrahara, Near Modern Spaces, Bangalore &ndash; 562125</p>
            <p>Factory: Hethvik Interiors Factory, Near Cambridge School, B. Hosahalli, Bangalore, Karnataka &ndash; 562125</p>
            <p>+91 97045 20901 &bull; info@hethvikinteriors.com</p>
          </div>
          <div class="print-doc-type">
            <h2>${type}</h2>
            <p class="print-id">${docNo}</p>
            <p>Date: ${docDate}</p>
          </div>
        </div>

        <div class="print-client-section">
          <div class="print-client-box">
            <h4>Bill To</h4>
            <p class="client-name">${data.clientName || '—'}</p>
            ${data.clientPhone ? `<p>${data.clientPhone}</p>` : ''}
            ${data.clientAddress ? `<p>${data.clientAddress}</p>` : ''}
          </div>
          <div class="print-client-box">
            <h4>Project Details</h4>
            <p>Document No: <strong>${docNo}</strong></p>
            <p>Date: ${docDate}</p>
            ${!isQuote && data.quoteId ? `<p>Ref Quote: ${data.quoteId}</p>` : ''}
          </div>
        </div>

        <table class="print-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Place / Area</th>
              <th>Sqft</th>
              <th>Material</th>
              <th style="text-align:right">Rate/Sqft</th>
              <th style="text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsHTML}</tbody>
        </table>

        <div class="print-totals-section">
          <div class="print-totals-box">
            <div class="print-totals-row">
              <span>Subtotal</span>
              <span>₹${Math.round(data.subtotal || 0).toLocaleString('en-IN')}</span>
            </div>
            ${(data.discountAmount > 0) ? `
            <div class="print-totals-row print-discount-row">
              <span>Discount</span>
              <span>−₹${Math.round(data.discountAmount).toLocaleString('en-IN')}</span>
            </div>` : ''}
            <div class="print-totals-row">
              <span>GST (${data.gstPercent || 0}%)</span>
              <span>₹${Math.round(data.gstAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="print-totals-row grand-row">
              <span>Grand Total</span>
              <span>₹${Math.round(data.grandTotal || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        ${data.notes ? `
        <div class="print-terms">
          <h4>Terms &amp; Conditions</h4>
          <p>${data.notes.replace(/\n/g, '<br>')}</p>
        </div>` : ''}

        <div class="print-footer">
          <span>Hethvik Interiors &bull; Kada Agrahara, Bangalore &ndash; 562125</span>
          <span>This is a computer-generated ${type.toLowerCase()}.</span>
        </div>
      </div>
    `;

    const w = window.open('', '_blank');
    if (!w) {
      showToast('Allow pop-ups to download the PDF.', 'error');
      return;
    }
    w.document.open();
    w.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${type} ${docNo} — Hethvik Interiors</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>${PRINT_STYLES}</style>
</head>
<body>${docHTML}</body>
</html>`);
    w.document.close();
    w.onload = function () {
      w.focus();
      w.print();
      w.close();
    };
  }
```

- [ ] **Step 3: Remove the dead `#printTemplate` reference and div**

In `js/login.js`, the `PDF / PRINT` section starts with:

```js
  const printTemplate = document.getElementById('printTemplate');
```

Delete that line (the new `printDocument` no longer uses it).

In `login.html`, delete the line:

```html
  <div id="printTemplate" class="print-only" style="display:none"></div>
```

(Keep the `<!-- ─── Print Template … ─── -->` comment line removed too if it sits directly above it.)

- [ ] **Step 4: Remove the dead `@media print` block from CSS**

In `css/login.css`, delete the entire block that begins with `@media print {` (~line 798) through its matching closing `}` (~line 1001, the line right before the `RESPONSIVE` section comment). The `RESPONSIVE` section (`@media (max-width: 1100px)` …) must remain intact.

- [ ] **Step 5: Manual verification**

1. Open `login.html` in Chrome, log in (`admin` / `hethvik2025`).
2. Quotations tab → "Add Line Item", pick a place/material, enter Sqft `100`, ₹/Sqft `500`. Enter Client Name `Test Client`.
3. Click **Download PDF**. Expected: a new tab/window opens showing the full styled document (gold header "Hethvik Interiors", "QUOTATION", the line item, totals), the browser print dialog appears, and after printing/cancelling the window closes. **The document is NOT blank.**
4. Open DevTools Console (F12). Expected: no red errors.

- [ ] **Step 6: Commit**

```bash
git add js/login.js login.html css/login.css
git commit -m "$(cat <<'EOF'
Fix blank PDF: render documents in a dedicated print window

Replaces the fragile host-page @media print mechanism (which snapshotted
before layout, producing blank PDFs) with a self-contained pop-up window
that contains only the document and its inlined print styles.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Bill-edit mode — state, loader, and entry points

Add the `editingBillNo` state and the ability to load a bill into the existing Quotation builder. No save logic yet (Task 4).

**Files:**
- Modify: `js/login.js` — add `let editingBillNo = null;` (~line 198, next to `let editingQuoteId = null;`); add `loadBillIntoBuilder()` after `loadQuoteIntoBuilder()` (~line 432); add `const editBillBtn` in the bills-tab const block (~lines 562–574); add Edit-Bill button to `renderBillList` card markup (~lines 605–612); set `editBillBtn.dataset.billno` in `showBillDetail` (~line 656); add `edit-bill` branch to `billList` click handler (~lines 664–678); add `editBillBtn` click listener (near the `printBillBtn` listener, ~line 680)
- Modify: `login.html` — add `#editBillBtn` to the bill detail actions (~lines 261–268)

- [ ] **Step 1: Add `editingBillNo` state**

In `js/login.js`, find:

```js
  let editingQuoteId = null;
```

Replace with:

```js
  let editingQuoteId = null;
  let editingBillNo  = null;
```

- [ ] **Step 2: Add `loadBillIntoBuilder()`**

In `js/login.js`, immediately after the closing `}` of `loadQuoteIntoBuilder` (the function that ends right before the `QUOTE LIST` section comment, ~line 432), insert:

```js
  function loadBillIntoBuilder(billNo) {
    const bill = getBills().find(b => b.billNo === billNo);
    if (!bill) return;

    editingBillNo  = bill.billNo;
    editingQuoteId = bill.quoteId || null;

    builderTitle.textContent  = 'Editing Bill';
    qClientName.value         = bill.clientName    || '';
    qClientPhone.value        = bill.clientPhone   || '';
    qClientAddress.value      = bill.clientAddress || '';
    qDiscount.value           = bill.discountValue || 0;
    qGst.value                = bill.gstPercent != null ? bill.gstPercent : 18;
    qNotes.value              = bill.notes || DEFAULT_TERMS;
    setQuoteIdBadge(bill.billNo);

    saveQuoteBtn.innerHTML     = '<i class="fa-solid fa-floppy-disk"></i> Update Bill';
    saveDraftBtn.style.display = 'none';

    itemsBody.innerHTML = '';
    (bill.items || []).forEach(item => addItemRow(item));
    recalcTotals();

    switchToTab('quotations');
    document.getElementById('quotationBuilder').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
```

- [ ] **Step 3: Declare the `editBillBtn` element reference**

In `js/login.js`, find the bills-tab const block ending with:

```js
  const printBillBtn    = document.getElementById('printBillBtn');
  const markPaidBtn     = document.getElementById('markPaidBtn');
```

Replace with:

```js
  const printBillBtn    = document.getElementById('printBillBtn');
  const markPaidBtn     = document.getElementById('markPaidBtn');
  const editBillBtn     = document.getElementById('editBillBtn');
```

- [ ] **Step 4: Add the Edit-Bill button to the bill detail panel**

In `login.html`, find:

```html
              <div class="builder-actions" style="margin-top:1.5rem;">
                <button class="btn btn-gold" id="printBillBtn">
                  <i class="fa-solid fa-download"></i> Download PDF
                </button>
                <button class="btn btn-outline" id="markPaidBtn">
                  <i class="fa-solid fa-circle-check"></i> Mark as Paid
                </button>
              </div>
```

Replace with:

```html
              <div class="builder-actions" style="margin-top:1.5rem;">
                <button class="btn btn-gold" id="printBillBtn">
                  <i class="fa-solid fa-download"></i> Download PDF
                </button>
                <button class="btn btn-outline" id="editBillBtn">
                  <i class="fa-solid fa-pen"></i> Edit Bill
                </button>
                <button class="btn btn-outline" id="markPaidBtn">
                  <i class="fa-solid fa-circle-check"></i> Mark as Paid
                </button>
              </div>
```

- [ ] **Step 5: Add an Edit button to each bill card**

In `js/login.js`, inside `renderBillList`, find:

```js
        <div class="qc-actions">
          <button class="qc-btn qc-btn-print" data-action="view" data-billno="${b.billNo}">
            <i class="fa-solid fa-eye"></i> View
          </button>
          <button class="qc-btn qc-btn-print" data-action="print-bill" data-billno="${b.billNo}">
            <i class="fa-solid fa-download"></i> PDF
          </button>
        </div>
```

Replace with:

```js
        <div class="qc-actions">
          <button class="qc-btn qc-btn-print" data-action="view" data-billno="${b.billNo}">
            <i class="fa-solid fa-eye"></i> View
          </button>
          <button class="qc-btn qc-btn-edit" data-action="edit-bill" data-billno="${b.billNo}">
            <i class="fa-solid fa-pen"></i> Edit
          </button>
          <button class="qc-btn qc-btn-print" data-action="print-bill" data-billno="${b.billNo}">
            <i class="fa-solid fa-download"></i> PDF
          </button>
        </div>
```

- [ ] **Step 6: Wire the bill-card Edit action**

In `js/login.js`, find the `billList` click handler:

```js
    } else if (action === 'print-bill') {
      const b = getBills().find(x => x.billNo === billNo);
      if (b) printDocument(b, 'FINAL BILL');
    }
  });
```

Replace with:

```js
    } else if (action === 'edit-bill') {
      loadBillIntoBuilder(billNo);
    } else if (action === 'print-bill') {
      const b = getBills().find(x => x.billNo === billNo);
      if (b) printDocument(b, 'FINAL BILL');
    }
  });
```

- [ ] **Step 7: Set `editBillBtn` target in `showBillDetail` and add its listener**

In `js/login.js`, inside `showBillDetail`, find:

```js
    markPaidBtn.dataset.billno = billNo;
    printBillBtn.dataset.billno = billNo;
```

Replace with:

```js
    markPaidBtn.dataset.billno  = billNo;
    printBillBtn.dataset.billno = billNo;
    editBillBtn.dataset.billno  = billNo;
```

Then find the `printBillBtn` click listener:

```js
  printBillBtn.addEventListener('click', function () {
    const b = getBills().find(x => x.billNo === this.dataset.billno);
    if (b) printDocument(b, 'FINAL BILL');
  });
```

Immediately after it, insert:

```js
  editBillBtn.addEventListener('click', function () {
    if (this.dataset.billno) loadBillIntoBuilder(this.dataset.billno);
  });
```

- [ ] **Step 8: Manual verification**

1. Open `login.html`, log in. Quotations tab → add a line item (Sqft `100`, ₹/Sqft `500`), Client Name `Edit Test`, click **Save Quotation**.
2. The saved quote card appears with a **Convert to Bill** button → click it. Expected: switches to Bills tab, a bill card and bill detail appear, toast "Bill HI-BILL-… created!".
3. In the bill detail panel click **Edit Bill** (also try the **Edit** button on the bill card). Expected: switches to Quotations tab; builder title shows "Editing Bill"; ID badge shows the `HI-BILL-…` number; the client name and the line item are pre-filled; the **Save Draft** button is hidden; the gold button reads **Update Bill**.
4. Console (F12): no red errors.

(No save yet — that is Task 4. Reloading the page resets the builder; that is expected here.)

- [ ] **Step 9: Commit**

```bash
git add js/login.js login.html
git commit -m "$(cat <<'EOF'
Add bill-edit mode: load a bill into the quotation builder

Adds editingBillNo state, loadBillIntoBuilder(), and Edit Bill entry
points on the bill card and detail panel.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Bill-edit mode — save, quote sync, builder reset, PDF type

Add `saveBillEdits()`, branch the save button, reset bill-mode in `clearBuilder()`, and make the builder's Download PDF print as FINAL BILL in bill-mode.

**Files:**
- Modify: `js/login.js` — add `saveBillEdits()` after `saveQuote()` (~line 402); branch the `saveQuoteBtn` click listener (~line 404); extend `clearBuilder()` (~lines 344–356); branch the `printQuoteBtn` click listener (~lines 406–410)

- [ ] **Step 1: Add `saveBillEdits()`**

In `js/login.js`, find the end of `saveQuote` and its button bindings:

```js
  saveQuoteBtn.addEventListener('click', () => saveQuote('sent'));
  saveDraftBtn.addEventListener('click', () => saveQuote('draft'));
```

Immediately **above** the `saveQuoteBtn.addEventListener` line, insert the new function:

```js
  function saveBillEdits() {
    const name = qClientName.value.trim();
    if (!name) { showToast('Please enter a client name.', 'error'); return; }

    const items     = getItemRows();
    const subtotal  = items.reduce((s, i) => s + i.total, 0);
    const discount  = parseFloat(qDiscount.value) || 0;
    const gstPct    = parseFloat(qGst.value)      || 0;
    const afterDisc = Math.max(subtotal - discount, 0);
    const gstAmt    = afterDisc * gstPct / 100;
    const grand     = afterDisc + gstAmt;

    const fields = {
      clientName:     name,
      clientPhone:    qClientPhone.value.trim(),
      clientAddress:  qClientAddress.value.trim(),
      items,
      subtotal,
      discountValue:  discount,
      discountAmount: discount,
      gstPercent:     gstPct,
      gstAmount:      gstAmt,
      grandTotal:     grand,
      notes:          qNotes.value.trim(),
    };

    const bills = getBills();
    const bill  = bills.find(b => b.billNo === editingBillNo);
    if (!bill) { showToast('Bill not found.', 'error'); return; }
    Object.assign(bill, fields);   // preserves billNo, billDate, quoteId, status
    saveBills(bills);

    if (bill.quoteId) {
      const quotes = getQuotes();
      const quote  = quotes.find(q => q.id === bill.quoteId);
      if (quote) {
        Object.assign(quote, fields); // preserves id, date, status ('converted')
        saveQuotes(quotes);
      }
    }

    const savedBillNo = bill.billNo;
    showToast(`Bill ${savedBillNo} updated!`);
    clearBuilder();
    renderQuoteList(quoteSearch.value);
    selectedBillId = savedBillNo;
    renderBillList();
    switchToTab('bills');
    showBillDetail(savedBillNo);
  }
```

- [ ] **Step 2: Branch the save button**

In `js/login.js`, find:

```js
  saveQuoteBtn.addEventListener('click', () => saveQuote('sent'));
```

Replace with:

```js
  saveQuoteBtn.addEventListener('click', () => {
    if (editingBillNo) saveBillEdits();
    else saveQuote('sent');
  });
```

- [ ] **Step 3: Reset bill-mode in `clearBuilder()`**

In `js/login.js`, find `clearBuilder`:

```js
  function clearBuilder() {
    editingQuoteId = null;
    builderTitle.textContent = 'New Quotation';
    qClientName.value    = '';
    qClientPhone.value   = '';
    qClientAddress.value = '';
    qDiscount.value      = '0';
    qGst.value           = '18';
    qNotes.value         = DEFAULT_TERMS;
    itemsBody.innerHTML  = '';
    recalcTotals();
    setQuoteIdBadge(nextQuoteId());
  }
```

Replace with:

```js
  function clearBuilder() {
    editingQuoteId = null;
    editingBillNo  = null;
    builderTitle.textContent = 'New Quotation';
    qClientName.value    = '';
    qClientPhone.value   = '';
    qClientAddress.value = '';
    qDiscount.value      = '0';
    qGst.value           = '18';
    qNotes.value         = DEFAULT_TERMS;
    itemsBody.innerHTML  = '';
    saveQuoteBtn.innerHTML     = '<i class="fa-solid fa-floppy-disk"></i> Save Quotation';
    saveDraftBtn.style.display = '';
    recalcTotals();
    setQuoteIdBadge(nextQuoteId());
  }
```

- [ ] **Step 4: Make the builder's Download PDF respect bill-mode**

In `js/login.js`, find:

```js
  printQuoteBtn.addEventListener('click', () => {
    const name = qClientName.value.trim();
    if (!name) { showToast('Please enter client details before downloading.', 'error'); return; }
    printDocument(buildQuoteObject('sent'), 'QUOTATION');
  });
```

Replace with:

```js
  printQuoteBtn.addEventListener('click', () => {
    const name = qClientName.value.trim();
    if (!name) { showToast('Please enter client details before downloading.', 'error'); return; }
    if (editingBillNo) {
      const stored = getBills().find(b => b.billNo === editingBillNo) || {};
      const data = Object.assign(buildQuoteObject('final'), {
        billNo:   editingBillNo,
        billDate: stored.billDate || new Date().toISOString(),
        quoteId:  stored.quoteId,
      });
      printDocument(data, 'FINAL BILL');
    } else {
      printDocument(buildQuoteObject('sent'), 'QUOTATION');
    }
  });
```

- [ ] **Step 5: Manual verification — full spec flow**

Open `login.html`, log in, then run the spec's test checklist:

1. Quotations tab → add a line item (place, material, Sqft `100`, ₹/Sqft `500`), Client Name `Sync Test`, **Save Quotation**.
2. On the quote card click **Convert to Bill**. Expected: Bills tab shows the bill; toast "created".
3. Click **Edit Bill**. Builder pre-fills; title "Editing Bill"; badge = bill number; no "Save Draft"; gold button "Update Bill".
4. Click **Add Line Item**, add a second row (Sqft `50`, ₹/Sqft `200`). Click **Update Bill**. Expected: toast "Bill HI-BILL-… updated!"; returns to Bills tab; bill detail shows BOTH line items and recalculated Grand Total (₹500×100 + ₹200×50 = ₹60,000 subtotal, plus GST).
5. Bill detail → **Download PDF**. Expected: print window opens, header reads **FINAL BILL**, both items present, not blank.
6. Go to Quotations tab, find the `Sync Test` quote, click **Edit** (quote edit). Expected: it now contains BOTH line items (synced). Click **Clear** to exit.
7. Bills tab → select the bill → **Mark as Paid**. Then **Edit Bill** → change ₹/Sqft of a row → **Update Bill**. Expected: bill still shows status **Paid** (status preserved).
8. Console (F12) throughout: no red errors.

- [ ] **Step 6: Commit**

```bash
git add js/login.js
git commit -m "$(cat <<'EOF'
Add saveBillEdits: update bill and sync source quotation

Update Bill rebuilds items/totals, writes them to the bill (preserving
billNo/billDate/quoteId/status) and mirrors identical fields into the
source quote. clearBuilder resets bill-mode UI; builder PDF prints as
FINAL BILL while editing a bill.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Final review & branch wrap-up

**Files:** none (verification only)

- [ ] **Step 1: Re-confirm no regressions in core flows**

In a fresh browser session (clear site data first via DevTools → Application → Clear storage, to test from empty state): log in → create a quotation → Save Draft → Save Quotation → Download PDF (non-blank) → Convert to Bill → Edit Bill → add item → Update Bill → Mark as Paid → Download bill PDF (non-blank). Confirm no console errors at any step.

- [ ] **Step 2: Confirm dead code is gone**

Run: `git grep -n "printTemplate"` → Expected: no matches.
Run: `git grep -n "@media print" css/login.css` → Expected: no matches.

- [ ] **Step 3: Review the full branch diff**

Run: `git log --oneline main..fix/bill-edit-and-pdf`
Expected: the spec commit + Tasks 1–4 commits, in order.

Run: `git diff main..fix/bill-edit-and-pdf -- js/login.js login.html css/login.css`
Skim for accidental edits outside the planned changes.

- [ ] **Step 4: Stop — hand back to the user**

Report completion and the verification results. Do NOT merge to `main` or push without the user's explicit instruction (see finishing-a-development-branch when the user is ready to integrate).

---

## Self-Review

**Spec coverage:**
- Blank-PDF fix (dedicated print window, remove `#printTemplate`/`@media print`) → Task 2 ✓
- `editingBillNo` state → Task 3 Step 1 ✓
- Edit-Bill entry points (detail panel + card) → Task 3 Steps 4–7 ✓
- `loadBillIntoBuilder` (prefill, bill-mode UI, hide Save Draft) → Task 3 Step 2 ✓
- `saveBillEdits` (update bill, preserve billNo/billDate/quoteId/status) → Task 4 Step 1 ✓
- Quote sync (same fields, preserve id/date/converted, skip if missing) → Task 4 Step 1 ✓
- Save button branch → Task 4 Step 2 ✓
- `clearBuilder` bill-mode reset → Task 4 Step 3 ✓
- Builder PDF prints FINAL BILL in bill-mode → Task 4 Step 4 ✓
- `convertToBill` unchanged → not modified by any task ✓
- Edge cases (paid bill preserved; missing quote tolerated) → covered by `saveBillEdits` logic + Task 4 Step 5 items 6–7 ✓

**Placeholder scan:** No TBD/TODO; every code step contains complete code; verification steps are concrete browser procedures (no test framework exists, so manual verification is intentional and specified).

**Type/name consistency:** `editingBillNo` (string|null), `loadBillIntoBuilder(billNo)`, `saveBillEdits()`, `editBillBtn`, `PRINT_STYLES`, action string `edit-bill`, button id `editBillBtn` — used consistently across Tasks 3 and 4. `fields` object keys match the quote/bill shape produced by `buildQuoteObject` (`discountValue`/`discountAmount`/`gstPercent`/`gstAmount`/`grandTotal`).
