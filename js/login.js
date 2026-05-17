(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     CONSTANTS
     ═══════════════════════════════════════════════════════════════ */
  const CREDENTIALS = { id: 'admin', pass: 'hethvik2025' };
  const LS_QUOTES   = 'hethvik_quotes';
  const LS_BILLS    = 'hethvik_bills';
  const LS_PROJECTS = 'hethvik_projects';
  const SS_AUTH     = 'hethvik_auth';

  const DEFAULT_TERMS = `1. This quotation is valid for 30 days from the date of issue.
2. 50% advance payment required to commence work.
3. Balance payment due upon project completion.
4. Material prices subject to market variation.
5. GST applicable as per government norms.
6. Any changes to scope will be quoted separately.`;

  /* ═══════════════════════════════════════════════════════════════
     STORAGE HELPERS
     ═══════════════════════════════════════════════════════════════ */
  function getQuotes()    { return JSON.parse(localStorage.getItem(LS_QUOTES)   || '[]'); }
  function getBills()     { return JSON.parse(localStorage.getItem(LS_BILLS)    || '[]'); }
  function getProjects()  { return JSON.parse(localStorage.getItem(LS_PROJECTS) || 'null'); }

  function saveQuotes(arr)   { localStorage.setItem(LS_QUOTES,   JSON.stringify(arr)); }
  function saveBills(arr)    { localStorage.setItem(LS_BILLS,    JSON.stringify(arr)); }
  function saveProjects(arr) { localStorage.setItem(LS_PROJECTS, JSON.stringify(arr)); }

  /* ═══════════════════════════════════════════════════════════════
     ID GENERATORS
     ═══════════════════════════════════════════════════════════════ */
  function nextQuoteId() {
    const quotes = getQuotes();
    const year   = new Date().getFullYear();
    const n      = (quotes.length + 1).toString().padStart(4, '0');
    return `HI-${year}-${n}`;
  }

  function nextBillId() {
    const bills = getBills();
    const year  = new Date().getFullYear();
    const n     = (bills.length + 1).toString().padStart(4, '0');
    return `HI-BILL-${year}-${n}`;
  }

  function nextProjectId() {
    const projects = getProjects();
    if (!projects || projects.length === 0) return 100;
    return Math.max(...projects.map(p => p.id)) + 1;
  }

  /* ═══════════════════════════════════════════════════════════════
     CURRENCY FORMATTER
     ═══════════════════════════════════════════════════════════════ */
  function fmtINR(num) {
    if (!num && num !== 0) return '₹0';
    return '₹' + Math.round(num).toLocaleString('en-IN');
  }

  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /* ═══════════════════════════════════════════════════════════════
     TOAST NOTIFICATIONS
     ═══════════════════════════════════════════════════════════════ */
  const toastContainer = document.getElementById('toastContainer');

  function showToast(message, type = 'success') {
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.success}"></i><span>${message}</span>`;
    toastContainer.appendChild(toast);

    gsap.fromTo(toast, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' });

    setTimeout(() => {
      gsap.to(toast, { opacity: 0, x: 30, duration: 0.3, ease: 'power2.in',
        onComplete: () => toast.remove() });
    }, 3200);
  }

  /* ═══════════════════════════════════════════════════════════════
     AUTH
     ═══════════════════════════════════════════════════════════════ */
  const loginScreen    = document.getElementById('loginScreen');
  const adminDashboard = document.getElementById('adminDashboard');
  const loginForm      = document.getElementById('loginForm');
  const loginError     = document.getElementById('loginError');
  const loginCard      = document.getElementById('loginCard');
  const logoutBtn      = document.getElementById('logoutBtn');
  const togglePass     = document.getElementById('togglePass');
  const loginPassInput = document.getElementById('loginPass');

  function showLogin() {
    adminDashboard.style.display = 'none';
    loginScreen.style.display   = 'flex';
    gsap.from(loginCard, { opacity: 0, y: 36, duration: 0.6, ease: 'power3.out', delay: 0.1 });
  }

  function showDashboard() {
    loginScreen.style.display    = 'none';
    adminDashboard.style.display = 'block';
    gsap.from('#adminNav', { opacity: 0, y: -16, duration: 0.5, ease: 'power2.out' });
    gsap.from('#tabQuotations', { opacity: 0, y: 12, duration: 0.5, delay: 0.15, ease: 'power2.out' });
    setQuoteIdBadge(nextQuoteId());
    renderQuoteList();
    renderBillList();
    renderProjectList();
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const id   = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;

    if (id === CREDENTIALS.id && pass === CREDENTIALS.pass) {
      sessionStorage.setItem(SS_AUTH, '1');
      loginError.textContent = '';
      gsap.to(loginCard, { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in',
        onComplete: showDashboard });
    } else {
      loginError.textContent = 'Invalid employee ID or password.';
      gsap.to(loginCard, {
        keyframes: [{ x: -8 }, { x: 8 }, { x: -5 }, { x: 5 }, { x: 0 }],
        duration: 0.4, ease: 'power2.out'
      });
    }
  });

  logoutBtn.addEventListener('click', function () {
    sessionStorage.removeItem(SS_AUTH);
    gsap.to(adminDashboard, { opacity: 0, duration: 0.25, ease: 'power2.in',
      onComplete: () => {
        adminDashboard.style.opacity = '';
        showLogin();
      }
    });
  });

  togglePass.addEventListener('click', function () {
    const isText = loginPassInput.type === 'text';
    loginPassInput.type = isText ? 'password' : 'text';
    togglePass.querySelector('i').className = isText ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
  });

  /* ═══════════════════════════════════════════════════════════════
     TAB NAVIGATION
     ═══════════════════════════════════════════════════════════════ */
  const tabPanels = {
    quotations: document.getElementById('tabQuotations'),
    bills:      document.getElementById('tabBills'),
    projects:   document.getElementById('tabProjects'),
  };

  document.getElementById('adminTabs').addEventListener('click', function (e) {
    const btn = e.target.closest('.admin-tab');
    if (!btn) return;
    const tab = btn.dataset.tab;
    if (!tabPanels[tab]) return;

    document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    Object.values(tabPanels).forEach(p => { p.style.display = 'none'; });
    tabPanels[tab].style.display = 'block';
    gsap.fromTo(tabPanels[tab], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  });

  /* ═══════════════════════════════════════════════════════════════
     QUOTATION BUILDER
     ═══════════════════════════════════════════════════════════════ */
  const itemsBody        = document.getElementById('itemsBody');
  const addItemBtn       = document.getElementById('addItemBtn');
  const qClientName      = document.getElementById('qClientName');
  const qClientPhone     = document.getElementById('qClientPhone');
  const qClientAddress   = document.getElementById('qClientAddress');
  const qDiscount        = document.getElementById('qDiscount');
  const qGst             = document.getElementById('qGst');
  const qNotes           = document.getElementById('qNotes');
  const tSubtotal        = document.getElementById('tSubtotal');
  const tDiscount        = document.getElementById('tDiscount');
  const tGstPct          = document.getElementById('tGstPct');
  const tGst             = document.getElementById('tGst');
  const tGrand           = document.getElementById('tGrand');
  const saveQuoteBtn     = document.getElementById('saveQuoteBtn');
  const saveDraftBtn     = document.getElementById('saveDraftBtn');
  const printQuoteBtn    = document.getElementById('printQuoteBtn');
  const clearBuilderBtn  = document.getElementById('clearBuilderBtn');
  const builderTitle     = document.getElementById('builderTitle');
  const quoteIdBadge     = document.getElementById('quoteIdBadge');

  let editingQuoteId = null;

  const PLACES = [
    'MBR (Master Bedroom)', 'GBR (Guest Bedroom)', 'CBR (Children\'s Bedroom)',
    'Kitchen', 'Utility Area', 'Living Room', 'Dining Room', 'Bathroom',
    'Passage / Corridor', 'Study Room', 'Balcony', 'Home Office',
    'Pooja Room', 'Store Room', 'Custom…'
  ];

  const MATERIALS_GROUPS = [
    {
      label: 'Board / Ply',
      options: ['Commercial Ply', 'BWP Ply (Waterproof)', 'Greenply Standard', 'Greenply Gold', 'Architect Ply']
    },
    {
      label: 'Laminates',
      options: ['Merino Standard Laminate', 'Merino Premium Laminate', 'Greenlam Standard', 'Greenlam Premium', 'High Gloss Laminate', 'Matte Laminate']
    },
    {
      label: 'Hardware',
      options: ['Hettich Standard', 'Hettich Premium', 'Hafele Standard', 'Hafele Premium', 'Ebco Standard']
    },
    {
      label: 'Glass',
      options: ['Plain Glass', 'Frosted Glass', 'Tinted Glass', 'Fluted Glass', 'Mirror']
    },
    {
      label: 'Flooring',
      options: ['Italian Marble', 'Vitrified Tiles', 'Wooden Flooring', 'Vinyl Flooring', 'Ceramic Tiles']
    },
    {
      label: 'Paint / Wall',
      options: ['Asian Paints Premium Emulsion', 'Royale Luxury Emulsion', 'Textured Paint', 'Wallpaper', 'Wall Cladding']
    }
  ];

  function makePlaceSelect(val = '') {
    const sel = document.createElement('select');
    PLACES.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      if (p === val) opt.selected = true;
      sel.appendChild(opt);
    });
    return sel;
  }

  function makeMaterialSelect(val = '') {
    const sel = document.createElement('select');
    MATERIALS_GROUPS.forEach(grp => {
      const og = document.createElement('optgroup');
      og.label = grp.label;
      grp.options.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o;
        opt.textContent = o;
        if (o === val) opt.selected = true;
        og.appendChild(opt);
      });
      sel.appendChild(og);
    });
    return sel;
  }

  function addItemRow(data = {}) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td></td>
      <td><input type="number" class="sqft-in" value="${data.sqft || ''}" min="0" placeholder="0"></td>
      <td></td>
      <td><input type="number" class="price-in" value="${data.pricePerSqft || ''}" min="0" placeholder="0"></td>
      <td class="total-cell">₹0</td>
      <td><button type="button" class="del-item-btn" title="Remove"><i class="fa-solid fa-xmark"></i></button></td>
    `;
    tr.cells[0].appendChild(makePlaceSelect(data.place));
    tr.cells[2].appendChild(makeMaterialSelect(data.material));

    tr.querySelector('.del-item-btn').addEventListener('click', () => {
      gsap.to(tr, { opacity: 0, x: -10, duration: 0.2, onComplete: () => { tr.remove(); recalcTotals(); } });
    });

    const sqftIn  = tr.querySelector('.sqft-in');
    const priceIn = tr.querySelector('.price-in');
    const totalCell = tr.querySelector('.total-cell');

    function updateRowTotal() {
      const sqft  = parseFloat(sqftIn.value)  || 0;
      const price = parseFloat(priceIn.value) || 0;
      totalCell.textContent = fmtINR(sqft * price);
      recalcTotals();
    }

    sqftIn.addEventListener('input', updateRowTotal);
    priceIn.addEventListener('input', updateRowTotal);

    if (data.sqft && data.pricePerSqft) {
      totalCell.textContent = fmtINR(data.sqft * data.pricePerSqft);
    }

    itemsBody.appendChild(tr);
    gsap.fromTo(tr, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' });
    recalcTotals();

    // Scroll the new row into view
    tr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function getItemRows() {
    return Array.from(itemsBody.querySelectorAll('tr')).map(tr => {
      const sqft  = parseFloat(tr.querySelector('.sqft-in').value)  || 0;
      const price = parseFloat(tr.querySelector('.price-in').value) || 0;
      return {
        place:        tr.querySelector('select:first-of-type')?.value || '',
        sqft,
        material:     tr.querySelectorAll('select')[1]?.value || '',
        pricePerSqft: price,
        total:        sqft * price,
      };
    });
  }

  function recalcTotals() {
    const items    = getItemRows();
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const discount = parseFloat(qDiscount.value) || 0;
    const gstPct   = parseFloat(qGst.value)      || 0;
    const afterDisc = Math.max(subtotal - discount, 0);
    const gstAmt    = afterDisc * gstPct / 100;
    const grand     = afterDisc + gstAmt;

    tSubtotal.textContent = fmtINR(subtotal);
    tDiscount.textContent = discount > 0 ? `−${fmtINR(discount)}` : '−₹0';
    tGstPct.textContent   = gstPct;
    tGst.textContent      = fmtINR(gstAmt);
    tGrand.textContent    = fmtINR(grand);
  }

  qDiscount.addEventListener('input', recalcTotals);
  qGst.addEventListener('input', recalcTotals);
  addItemBtn.addEventListener('click', () => addItemRow());

  function setQuoteIdBadge(id) {
    quoteIdBadge.textContent = id;
  }

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

  clearBuilder();

  clearBuilderBtn.addEventListener('click', clearBuilder);

  function buildQuoteObject(status) {
    const items    = getItemRows();
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const discount = parseFloat(qDiscount.value) || 0;
    const gstPct   = parseFloat(qGst.value)      || 0;
    const afterDisc = Math.max(subtotal - discount, 0);
    const gstAmt    = afterDisc * gstPct / 100;
    const grand     = afterDisc + gstAmt;

    return {
      id:            editingQuoteId || nextQuoteId(),
      clientName:    qClientName.value.trim(),
      clientPhone:   qClientPhone.value.trim(),
      clientAddress: qClientAddress.value.trim(),
      date:          new Date().toISOString(),
      items,
      subtotal,
      discountValue:  discount,
      discountAmount: discount,
      gstPercent:     gstPct,
      gstAmount:      gstAmt,
      grandTotal:     grand,
      notes:          qNotes.value.trim(),
      status,
    };
  }

  function saveQuote(status) {
    const name = qClientName.value.trim();
    if (!name) { showToast('Please enter a client name.', 'error'); return; }

    const quote  = buildQuoteObject(status);
    const quotes = getQuotes();
    const idx    = quotes.findIndex(q => q.id === quote.id);
    if (idx >= 0) { quotes[idx] = quote; } else { quotes.push(quote); }
    saveQuotes(quotes);

    showToast(status === 'draft' ? 'Draft saved.' : 'Quotation saved!');
    clearBuilder();
    renderQuoteList();
  }

  saveQuoteBtn.addEventListener('click', () => saveQuote('sent'));
  saveDraftBtn.addEventListener('click', () => saveQuote('draft'));
  printQuoteBtn.addEventListener('click', () => {
    const name = qClientName.value.trim();
    if (!name) { showToast('Please enter client details before downloading.', 'error'); return; }
    printDocument(buildQuoteObject('sent'), 'QUOTATION');
  });

  function loadQuoteIntoBuilder(id) {
    const quote = getQuotes().find(q => q.id === id);
    if (!quote) return;

    editingQuoteId = quote.id;
    builderTitle.textContent  = 'Edit Quotation';
    qClientName.value         = quote.clientName || '';
    qClientPhone.value        = quote.clientPhone || '';
    qClientAddress.value      = quote.clientAddress || '';
    qDiscount.value           = quote.discountValue || 0;
    qGst.value                = quote.gstPercent || 18;
    qNotes.value              = quote.notes || DEFAULT_TERMS;
    setQuoteIdBadge(quote.id);

    itemsBody.innerHTML = '';
    (quote.items || []).forEach(item => addItemRow(item));
    recalcTotals();

    switchToTab('quotations');
    document.getElementById('quotationBuilder').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ═══════════════════════════════════════════════════════════════
     QUOTE LIST
     ═══════════════════════════════════════════════════════════════ */
  const quoteList   = document.getElementById('quoteList');
  const quoteEmpty  = document.getElementById('quoteEmpty');
  const quoteSearch = document.getElementById('quoteSearch');

  function renderQuoteList(filter = '') {
    let quotes = getQuotes().slice().reverse();
    if (filter) {
      const f = filter.toLowerCase();
      quotes = quotes.filter(q => q.clientName.toLowerCase().includes(f) || q.id.toLowerCase().includes(f));
    }

    quoteEmpty.style.display = quotes.length ? 'none' : 'block';

    const existing = quoteList.querySelectorAll('.quote-card');
    existing.forEach(el => el.remove());

    quotes.forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'quote-card';
      card.dataset.id = q.id;

      const convertBtn = q.status !== 'converted'
        ? `<button class="qc-btn qc-btn-convert" data-action="convert" data-id="${q.id}">
             <i class="fa-solid fa-file-invoice-dollar"></i> Convert to Bill
           </button>` : '';

      card.innerHTML = `
        <div class="qc-top">
          <span class="qc-id">${q.id}</span>
          <span class="qc-amount">${fmtINR(q.grandTotal)}</span>
        </div>
        <div class="qc-name">${q.clientName || 'Unknown Client'}</div>
        <div class="qc-meta">
          <span><i class="fa-regular fa-calendar"></i> ${fmtDate(q.date)}</span>
          ${q.clientAddress ? `<span><i class="fa-solid fa-location-dot"></i> ${q.clientAddress}</span>` : ''}
          <span class="status-pill status-${q.status}">${q.status}</span>
        </div>
        <div class="qc-actions">
          <button class="qc-btn qc-btn-edit" data-action="edit" data-id="${q.id}">
            <i class="fa-solid fa-pen"></i> Edit
          </button>
          ${convertBtn}
          <button class="qc-btn qc-btn-print" data-action="print" data-id="${q.id}">
            <i class="fa-solid fa-download"></i> PDF
          </button>
          <button class="qc-btn qc-btn-delete" data-action="delete" data-id="${q.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;

      quoteList.appendChild(card);
      gsap.from(card, { opacity: 0, y: 8, duration: 0.3, delay: idx * 0.04, ease: 'power2.out' });
    });
  }

  quoteList.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;

    if (action === 'edit') {
      loadQuoteIntoBuilder(id);
    } else if (action === 'convert') {
      convertToBill(id);
    } else if (action === 'print') {
      const q = getQuotes().find(x => x.id === id);
      if (q) printDocument(q, 'QUOTATION');
    } else if (action === 'delete') {
      if (!confirm(`Delete quotation ${id}?`)) return;
      const card = btn.closest('.quote-card');
      gsap.to(card, { opacity: 0, x: -10, height: 0, marginBottom: 0, padding: 0, duration: 0.3,
        onComplete: () => {
          const quotes = getQuotes().filter(q => q.id !== id);
          saveQuotes(quotes);
          renderQuoteList(quoteSearch.value);
          showToast('Quotation deleted.', 'info');
        }
      });
    }
  });

  let quoteSearchDebounce;
  quoteSearch.addEventListener('input', function () {
    clearTimeout(quoteSearchDebounce);
    quoteSearchDebounce = setTimeout(() => renderQuoteList(this.value), 280);
  });

  /* ═══════════════════════════════════════════════════════════════
     BILL CONVERSION
     ═══════════════════════════════════════════════════════════════ */
  function convertToBill(quoteId) {
    const quotes = getQuotes();
    const quote  = quotes.find(q => q.id === quoteId);
    if (!quote) return;
    if (quote.status === 'converted') {
      showToast('This quotation is already converted to a bill.', 'info');
      return;
    }

    const bill = Object.assign({}, JSON.parse(JSON.stringify(quote)), {
      billNo:   nextBillId(),
      billDate: new Date().toISOString(),
      quoteId:  quoteId,
      status:   'final',
    });

    const bills = getBills();
    bills.push(bill);
    saveBills(bills);

    quote.status = 'converted';
    saveQuotes(quotes);

    renderQuoteList(quoteSearch.value);
    renderBillList();
    switchToTab('bills');
    showToast(`Bill ${bill.billNo} created!`);
  }

  /* ═══════════════════════════════════════════════════════════════
     BILLS TAB
     ═══════════════════════════════════════════════════════════════ */
  const billList        = document.getElementById('billList');
  const billEmpty       = document.getElementById('billEmpty');
  const billSearch      = document.getElementById('billSearch');
  const billPreviewEmpty= document.getElementById('billPreviewEmpty');
  const billDetail      = document.getElementById('billDetail');
  const billDetailTitle = document.getElementById('billDetailTitle');
  const billDetailClient= document.getElementById('billDetailClient');
  const billDetailNo    = document.getElementById('billDetailNo');
  const billMetaGrid    = document.getElementById('billMetaGrid');
  const billItemsBody   = document.getElementById('billItemsBody');
  const billTotals      = document.getElementById('billTotalsDisplay');
  const printBillBtn    = document.getElementById('printBillBtn');
  const markPaidBtn     = document.getElementById('markPaidBtn');

  let selectedBillId = null;

  function renderBillList(filter = '') {
    let bills = getBills().slice().reverse();
    if (filter) {
      const f = filter.toLowerCase();
      bills = bills.filter(b => b.clientName.toLowerCase().includes(f) || b.billNo.toLowerCase().includes(f));
    }

    billEmpty.style.display = bills.length ? 'none' : 'block';
    const existing = billList.querySelectorAll('.quote-card');
    existing.forEach(el => el.remove());

    bills.forEach((b, idx) => {
      const card = document.createElement('div');
      card.className = 'quote-card';
      if (b.billNo === selectedBillId) card.classList.add('selected');
      card.dataset.id = b.billNo;

      card.innerHTML = `
        <div class="qc-top">
          <span class="qc-id">${b.billNo}</span>
          <span class="qc-amount">${fmtINR(b.grandTotal)}</span>
        </div>
        <div class="qc-name">${b.clientName || 'Unknown Client'}</div>
        <div class="qc-meta">
          <span><i class="fa-regular fa-calendar"></i> ${fmtDate(b.billDate)}</span>
          <span class="status-pill status-${b.status}">${b.status === 'paid' ? 'Paid' : 'Final'}</span>
        </div>
        <div class="qc-actions">
          <button class="qc-btn qc-btn-print" data-action="view" data-billno="${b.billNo}">
            <i class="fa-solid fa-eye"></i> View
          </button>
          <button class="qc-btn qc-btn-print" data-action="print-bill" data-billno="${b.billNo}">
            <i class="fa-solid fa-download"></i> PDF
          </button>
        </div>
      `;
      billList.appendChild(card);
      gsap.from(card, { opacity: 0, y: 8, duration: 0.3, delay: idx * 0.04 });
    });
  }

  function showBillDetail(billNo) {
    const bill = getBills().find(b => b.billNo === billNo);
    if (!bill) return;
    selectedBillId = billNo;

    billPreviewEmpty.style.display = 'none';
    billDetail.style.display       = 'block';
    billDetailTitle.textContent    = 'Final Bill';
    billDetailClient.textContent   = bill.clientName || '';
    billDetailNo.textContent       = bill.billNo;

    billMetaGrid.innerHTML = `
      <div class="bill-meta-item"><strong>${bill.clientName || '—'}</strong>Client Name</div>
      <div class="bill-meta-item"><strong>${bill.billNo}</strong>Bill Number</div>
      <div class="bill-meta-item"><strong>${fmtDate(bill.billDate)}</strong>Bill Date</div>
      <div class="bill-meta-item"><strong>${bill.clientPhone || '—'}</strong>Phone</div>
      <div class="bill-meta-item"><strong>${bill.quoteId || '—'}</strong>Source Quote</div>
      <div class="bill-meta-item"><strong>${bill.clientAddress || '—'}</strong>Location</div>
    `;

    billItemsBody.innerHTML = (bill.items || []).map(item => `
      <tr>
        <td>${item.place}</td>
        <td>${item.sqft}</td>
        <td>${item.material}</td>
        <td>${fmtINR(item.pricePerSqft)}</td>
        <td class="total-cell">${fmtINR(item.total)}</td>
      </tr>
    `).join('');

    billTotals.innerHTML = `
      <div class="totals-row"><span>Subtotal</span><span>${fmtINR(bill.subtotal)}</span></div>
      <div class="totals-row"><span>Discount</span><span class="discount-val">−${fmtINR(bill.discountAmount)}</span></div>
      <div class="totals-row"><span>GST (${bill.gstPercent}%)</span><span>${fmtINR(bill.gstAmount)}</span></div>
      <div class="totals-row grand"><span>Grand Total</span><span>${fmtINR(bill.grandTotal)}</span></div>
    `;

    markPaidBtn.dataset.billno = billNo;
    printBillBtn.dataset.billno = billNo;
    markPaidBtn.textContent = bill.status === 'paid' ? '✓ Paid' : 'Mark as Paid';
    markPaidBtn.disabled = bill.status === 'paid';

    gsap.fromTo(billDetail, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 });
  }

  billList.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const billNo = btn.dataset.billno;

    if (action === 'view') {
      showBillDetail(billNo);
      billList.querySelectorAll('.quote-card').forEach(c => c.classList.remove('selected'));
      btn.closest('.quote-card').classList.add('selected');
    } else if (action === 'print-bill') {
      const b = getBills().find(x => x.billNo === billNo);
      if (b) printDocument(b, 'FINAL BILL');
    }
  });

  printBillBtn.addEventListener('click', function () {
    const b = getBills().find(x => x.billNo === this.dataset.billno);
    if (b) printDocument(b, 'FINAL BILL');
  });

  markPaidBtn.addEventListener('click', function () {
    const bills = getBills();
    const bill  = bills.find(b => b.billNo === this.dataset.billno);
    if (!bill) return;
    bill.status = 'paid';
    saveBills(bills);
    renderBillList(billSearch.value);
    showBillDetail(bill.billNo);
    showToast(`Bill ${bill.billNo} marked as paid!`);
  });

  let billSearchDebounce;
  billSearch.addEventListener('input', function () {
    clearTimeout(billSearchDebounce);
    billSearchDebounce = setTimeout(() => renderBillList(this.value), 280);
  });

  /* ═══════════════════════════════════════════════════════════════
     PDF / PRINT
     ═══════════════════════════════════════════════════════════════ */
  const printTemplate = document.getElementById('printTemplate');

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

    printTemplate.innerHTML = `
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

    printTemplate.style.display = 'block';
    window.print();
    printTemplate.style.display = 'none';
    printTemplate.innerHTML = '';
  }

  /* ═══════════════════════════════════════════════════════════════
     PROJECTS TAB
     ═══════════════════════════════════════════════════════════════ */
  const pTitle          = document.getElementById('pTitle');
  const pCategory       = document.getElementById('pCategory');
  const pClient         = document.getElementById('pClient');
  const pYear           = document.getElementById('pYear');
  const pLocation       = document.getElementById('pLocation');
  const pArea           = document.getElementById('pArea');
  const pBudget         = document.getElementById('pBudget');
  const pStyle          = document.getElementById('pStyle');
  const pThumb          = document.getElementById('pThumb');
  const pRooms          = document.getElementById('pRooms');
  const pMaterials      = document.getElementById('pMaterials');
  const rName           = document.getElementById('rName');
  const rRating         = document.getElementById('rRating');
  const rDate           = document.getElementById('rDate');
  const rQuote          = document.getElementById('rQuote');
  const photoUrlsList   = document.getElementById('photoUrlsList');
  const addPhotoBtn     = document.getElementById('addPhotoBtn');
  const saveProjectBtn  = document.getElementById('saveProjectBtn');
  const clearProjectBtn = document.getElementById('clearProjectBtn');
  const projectBuilderTitle = document.getElementById('projectBuilderTitle');
  const editingProjectId    = document.getElementById('editingProjectId');
  const projectAdminList    = document.getElementById('projectAdminList');
  const projectsCountLabel  = document.getElementById('projectsCountLabel');

  function addPhotoUrlRow(val = '') {
    const row = document.createElement('div');
    row.className = 'photo-url-row';
    row.innerHTML = `
      <div class="form-group" style="flex:1;margin-bottom:0">
        <input type="url" placeholder="https://images.unsplash.com/…?w=1400" value="${val}">
      </div>
      <button type="button" class="del-item-btn" title="Remove"><i class="fa-solid fa-xmark"></i></button>
    `;
    row.querySelector('.del-item-btn').addEventListener('click', () => row.remove());
    photoUrlsList.appendChild(row);
  }

  addPhotoBtn.addEventListener('click', () => addPhotoUrlRow());

  function clearProjectForm() {
    editingProjectId.value = '';
    projectBuilderTitle.textContent = 'Add New Project';
    saveProjectBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Project';
    pTitle.value = ''; pCategory.value = 'Residential';
    pClient.value = ''; pYear.value = '';
    pLocation.value = ''; pArea.value = '';
    pBudget.value = ''; pStyle.value = '';
    pThumb.value = ''; pRooms.value = ''; pMaterials.value = '';
    rName.value = ''; rRating.value = 5; rDate.value = ''; rQuote.value = '';
    photoUrlsList.innerHTML = '';
  }

  clearProjectBtn.addEventListener('click', clearProjectForm);

  saveProjectBtn.addEventListener('click', function () {
    const title = pTitle.value.trim();
    const thumb = pThumb.value.trim();
    if (!title) { showToast('Please enter a project title.', 'error'); return; }
    if (!thumb) { showToast('Please enter a thumbnail URL.', 'error'); return; }

    const photoInputs = photoUrlsList.querySelectorAll('input[type="url"]');
    const photos = [thumb, ...Array.from(photoInputs).map(i => i.value.trim()).filter(Boolean)];

    const reviewText = rQuote.value.trim();
    const reviews = [];
    if (reviewText && rName.value.trim()) {
      reviews.push({
        name:   rName.value.trim(),
        rating: parseInt(rRating.value) || 5,
        date:   rDate.value.trim() || new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        quote:  reviewText,
      });
    }

    const existingId = editingProjectId.value;
    let projects = getProjects();

    if (!projects) {
      const stored = localStorage.getItem(LS_PROJECTS);
      projects = stored ? JSON.parse(stored) : null;
    }

    if (!projects) {
      projects = [];
    }

    const project = {
      id:        existingId ? parseInt(existingId) : nextProjectId(),
      title,
      category:  pCategory.value,
      client:    pClient.value.trim(),
      year:      pYear.value.trim(),
      location:  pLocation.value.trim(),
      area:      pArea.value.trim(),
      budget:    pBudget.value.trim(),
      style:     pStyle.value.trim(),
      rooms:     pRooms.value.split(',').map(s => s.trim()).filter(Boolean),
      materials: pMaterials.value.split(',').map(s => s.trim()).filter(Boolean),
      thumb,
      photos,
      reviews,
    };

    if (existingId) {
      const idx = projects.findIndex(p => p.id === project.id);
      if (idx >= 0) projects[idx] = project; else projects.push(project);
      showToast('Project updated!');
    } else {
      projects.push(project);
      showToast('Project saved to portfolio!');
    }

    saveProjects(projects);
    clearProjectForm();
    renderProjectList();
  });

  function renderProjectList() {
    const projects = getProjects() || [];
    projectsCountLabel.textContent = `${projects.length} project${projects.length !== 1 ? 's' : ''}`;
    projectAdminList.innerHTML = '';

    if (!projects.length) {
      projectAdminList.innerHTML = `
        <div class="list-empty">
          <i class="fa-solid fa-images"></i>
          <p>No projects yet.<br>Add your first portfolio project.</p>
        </div>`;
      return;
    }

    projects.slice().reverse().forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'project-admin-card';
      card.innerHTML = `
        <img class="pac-thumb" src="${p.thumb || ''}" alt="${p.title}" onerror="this.style.background='#1a1a1a';this.src=''">
        <div class="pac-info">
          <div class="pac-title">${p.title}</div>
          <div class="pac-meta">${p.category} &bull; ${p.year || '—'} &bull; ${p.location || '—'}</div>
          <div class="pac-actions">
            <button class="qc-btn qc-btn-edit" data-action="edit-project" data-id="${p.id}">
              <i class="fa-solid fa-pen"></i> Edit
            </button>
            <button class="qc-btn qc-btn-delete" data-action="delete-project" data-id="${p.id}">
              <i class="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
      projectAdminList.appendChild(card);
      gsap.from(card, { opacity: 0, y: 8, duration: 0.3, delay: idx * 0.04 });
    });
  }

  projectAdminList.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action } = btn.dataset;
    const id = parseInt(btn.dataset.id);

    if (action === 'edit-project') {
      loadProjectIntoForm(id);
    } else if (action === 'delete-project') {
      if (!confirm('Delete this project from the portfolio?')) return;
      const card = btn.closest('.project-admin-card');
      gsap.to(card, { opacity: 0, x: -10, height: 0, marginBottom: 0, padding: 0, duration: 0.3,
        onComplete: () => {
          let projects = getProjects() || [];
          projects = projects.filter(p => p.id !== id);
          saveProjects(projects);
          renderProjectList();
          showToast('Project removed from portfolio.', 'info');
        }
      });
    }
  });

  function loadProjectIntoForm(id) {
    const projects = getProjects() || [];
    const p = projects.find(x => x.id === id);
    if (!p) return;

    editingProjectId.value = p.id;
    projectBuilderTitle.textContent = 'Edit Project';
    saveProjectBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Update Project';

    pTitle.value    = p.title    || '';
    pCategory.value = p.category || 'Residential';
    pClient.value   = p.client   || '';
    pYear.value     = p.year     || '';
    pLocation.value = p.location || '';
    pArea.value     = p.area     || '';
    pBudget.value   = p.budget   || '';
    pStyle.value    = p.style    || '';
    pThumb.value    = p.thumb    || '';
    pRooms.value    = (p.rooms     || []).join(', ');
    pMaterials.value= (p.materials || []).join(', ');

    photoUrlsList.innerHTML = '';
    (p.photos || []).slice(1).forEach(url => addPhotoUrlRow(url));

    if (p.reviews && p.reviews[0]) {
      rName.value   = p.reviews[0].name   || '';
      rRating.value = p.reviews[0].rating || 5;
      rDate.value   = p.reviews[0].date   || '';
      rQuote.value  = p.reviews[0].quote  || '';
    }

    switchToTab('projects');
    document.getElementById('tabProjects').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ═══════════════════════════════════════════════════════════════
     TAB HELPER
     ═══════════════════════════════════════════════════════════════ */
  function switchToTab(name) {
    const tabBtn = document.querySelector(`.admin-tab[data-tab="${name}"]`);
    if (tabBtn) tabBtn.click();
  }

  /* ═══════════════════════════════════════════════════════════════
     INIT — must run last so all const declarations above are live
     ═══════════════════════════════════════════════════════════════ */
  if (sessionStorage.getItem(SS_AUTH)) {
    showDashboard();
  } else {
    showLogin();
  }

})();
