(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     CONSTANTS
     ═══════════════════════════════════════════════════════════════ */
  // Per-quote "Additional Notes" default. The full standard Terms &
  // Conditions now live in js/terms-data.js (window.HETHVIK_TERMS) and
  // are printed on every PDF automatically, so this starts empty.
  const DEFAULT_TERMS = '';

  /* ═══════════════════════════════════════════════════════════════
     MATERIALS & BRAND SPECIFICATION  (source: "brands for website")
     Standard company brand list, grouped by category. Auto-included
     on every quotation/bill PDF and previewed in the builder. The
     line-item Material dropdown (MATERIALS_GROUPS below) reuses these
     same values. 'Crompton' / 'Great White' are the corrected brand
     names for the file's 'Cropton' / 'Greate white'.
     ═══════════════════════════════════════════════════════════════ */
  const BRAND_SPEC = [
    { label: 'Plywood Brands',
      items: ['Green Ply', 'Century Ply', 'Archid Ply', 'Garjan Ply', 'Khidhiki Ply'] },
    { label: 'Plywood Materials (6 / 12 / 16 / 18 mm)',
      items: ['MR Grade Ply', 'BWR Ply', 'Marine Ply', 'HDHMR', 'MDF', 'BWP Ply'] },
    { label: 'Hardware Brands',
      items: ['Ebco', 'Hafele', 'Blum', 'Hettich', 'Kyzo'] },
    { label: 'Laminate Brands',
      items: ['Dazzle Berry', 'Marino', 'Century', 'Fine Touch', 'Advance', 'Virgo', 'Decolam', 'Ran Berry', 'Stylam', 'Greenlam'] },
    { label: 'Laminate Finishes',
      items: ['Matte Finish', 'Glossy Finish', 'Acrylic', 'Flutted', 'PU Finish', 'Semi Matte'] },
    { label: 'Glass Types',
      items: ['Clear Glass', 'Toughened Glass', 'Flutted Glass', 'Tinted Glass', 'Frosted Glass'] },
    { label: 'Electrical Brands',
      items: ['Philips', 'Havells', 'Wipro', 'Crompton', 'GM', 'Great White'] },
  ];

  const BRAND_SPEC_NOTE = 'Brands are considered by default and may be ' +
    'modified as per discussions, if required, with applicable costing.';

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
  .print-spec {
    border-top: 1pt solid #e0e0e0;
    padding-top: 5mm;
    margin-top: 5mm;
    position: relative;
    z-index: 1;
  }
  .print-spec h4 {
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #999;
    margin: 0 0 3mm;
  }
  .print-spec-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
  }
  .print-spec-table td {
    padding: 1.6mm 3mm;
    border-bottom: 0.5pt solid #eee;
    color: #2a2a2a;
    vertical-align: top;
  }
  .print-spec-table tbody tr:nth-child(even) td { background: #fafafa; }
  .print-spec-table .bs-cat {
    width: 38%;
    font-weight: 600;
    color: #8a7430;
  }
  .print-spec-note {
    font-size: 7.5pt;
    color: #666;
    line-height: 1.6;
    margin: 3mm 0 0;
    font-style: italic;
  }
  .print-terms-full {
    border-top: 1pt solid #e0e0e0;
    padding-top: 5mm;
    margin-top: 5mm;
    position: relative;
    z-index: 1;
  }
  .print-terms-full > h4 {
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #C9A84C;
    margin: 0 0 3mm;
  }
  .print-terms-full .ft-h {
    font-size: 8pt;
    font-weight: 700;
    color: #1a1a1a;
    margin: 2.5mm 0 0.8mm;
  }
  .print-terms-full .ft-l {
    font-size: 7.5pt;
    color: #555;
    line-height: 1.55;
    margin: 0 0 0.4mm;
  }
  @page { size: A4; margin: 0; }
  `;

  /* ═══════════════════════════════════════════════════════════════
     DATA LAYER  (Firestore-backed cache — see js/data.js)

     Reads stay synchronous (cache slice). Writes are per-document
     upsert/delete ops that update the cache synchronously and push
     one doc to Firestore; onSnapshot reconciles + re-renders.
     ═══════════════════════════════════════════════════════════════ */
  function getQuotes()   { return window.fbData ? window.fbData.getQuotes()   : []; }
  function getBills()    { return window.fbData ? window.fbData.getBills()    : []; }
  function getProjects() { return window.fbData ? window.fbData.getProjects() : []; }

  function upsertQuote(q)     { return window.fbData.upsertQuote(q); }
  function deleteQuoteDoc(id) { return window.fbData.deleteQuote(id); }
  function upsertBill(b)      { return window.fbData.upsertBill(b); }
  function deleteBillDoc(no)  { return window.fbData.deleteBill(no); }
  function upsertProject(p)   { return window.fbData.upsertProject(p); }
  function deleteProjectDoc(id){ return window.fbData.deleteProject(id); }

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

  function friendlyAuthError(err) {
    switch (err && err.code) {
      case 'auth/invalid-email':          return 'Please enter a valid email address.';
      case 'auth/user-disabled':          return 'This account has been disabled.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':     return 'Incorrect email or password.';
      case 'auth/too-many-requests':      return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed': return 'Network error. Check your connection.';
      default:                            return 'Sign-in failed. Please try again.';
    }
  }

  function shakeLoginCard() {
    gsap.to(loginCard, {
      keyframes: [{ x: -8 }, { x: 8 }, { x: -5 }, { x: 5 }, { x: 0 }],
      duration: 0.4, ease: 'power2.out'
    });
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('loginUser').value.trim();
    const pass  = document.getElementById('loginPass').value;
    const btn   = document.getElementById('loginSubmit');
    loginError.textContent = '';

    if (!window.fb || !window.fb.auth) {
      loginError.textContent = 'Authentication service unavailable. Check your connection.';
      shakeLoginCard();
      return;
    }

    if (btn) btn.disabled = true;
    window.fb.auth.signInWithEmailAndPassword(email, pass)
      .then(function () {
        loginError.textContent = '';
        // onAuthStateChanged (see INIT) shows the dashboard.
      })
      .catch(function (err) {
        loginError.textContent = friendlyAuthError(err);
        shakeLoginCard();
      })
      .finally(function () {
        if (btn) btn.disabled = false;
      });
  });

  logoutBtn.addEventListener('click', function () {
    gsap.to(adminDashboard, { opacity: 0, duration: 0.25, ease: 'power2.in',
      onComplete: () => {
        adminDashboard.style.opacity = '';
        if (window.fb && window.fb.auth) window.fb.auth.signOut();
        // onAuthStateChanged (see INIT) shows the login screen.
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
  let editingBillNo  = null;

  const PLACES = [
    'MBR (Master Bedroom)', 'GBR (Guest Bedroom)', 'CBR (Children\'s Bedroom)',
    'Kitchen', 'Utility Area', 'Living Room', 'Dining Room', 'Bathroom',
    'Passage / Corridor', 'Study Room', 'Balcony', 'Home Office',
    'Pooja Room', 'Store Room', 'Foyer / Entrance'
  ];

  const DESCRIPTION_GROUPS = [
    {
      label: 'Bedroom',
      options: ['Wardrobe (Sliding)', 'Wardrobe (Openable)', 'Loft / Overhead Storage',
        'Dresser Unit', 'Study Table', 'Bed Back Panelling', 'Side Tables', 'Bed Cot',
        'Wardrobe Internal Accessories']
    },
    {
      label: 'Living / Dining',
      options: ['TV Unit', 'TV Back Panelling', 'Crockery Unit', 'Showcase / Display Unit',
        'Shoe Rack', 'Pooja Unit', 'Partition / Jaali', 'Bar Unit', 'Console / Foyer Unit']
    },
    {
      label: 'Kitchen',
      options: ['Base Cabinets', 'Wall Cabinets', 'Tall Unit', 'Loft Unit', 'Kitchen Island',
        'Countertop', 'Tandem / Cutlery Drawers', 'Chimney Casing', 'Crockery Drawers']
    },
    {
      label: 'Wall & Ceiling',
      options: ['Wall Design / Panelling', 'Wallpaper Work', 'Texture / Paint Work',
        'False Ceiling', 'Cove Lighting', 'Mirror Panelling', 'Highlighter Wall']
    },
    {
      label: 'Hardware & Finishes',
      options: ['Handles & Knobs', 'Hinges & Channels', 'Profile Lights',
        'Soft-Close Fittings', 'Glass Shutters', 'Laminate Finish', 'PU / Duco Finish']
    },
    {
      label: 'Bathroom & Utility',
      options: ['Vanity / Wash Counter', 'Mirror Cabinet', 'Storage Unit',
        'Utility Cabinets', 'Loft Storage']
    }
  ];

  // Brand groups (Ply / Laminates / Finishes / Hardware / Glass /
  // Electrical) come from the company brand spec (see BRAND_SPEC above);
  // Flooring & Paint/Wall are kept from the original curated list.
  const MATERIALS_GROUPS = [
    {
      label: 'Board / Ply',
      options: ['Green Ply', 'Century Ply', 'Archid Ply', 'Garjan Ply', 'Khidhiki Ply',
        'MR Grade Ply', 'BWR Ply', 'Marine Ply', 'HDHMR', 'MDF', 'BWP Ply']
    },
    {
      label: 'Laminates',
      options: ['Dazzle Berry', 'Marino', 'Century', 'Fine Touch', 'Advance', 'Virgo',
        'Decolam', 'Ran Berry', 'Stylam', 'Greenlam']
    },
    {
      label: 'Laminate Finishes',
      options: ['Matte Finish', 'Glossy Finish', 'Acrylic', 'Flutted', 'PU Finish', 'Semi Matte']
    },
    {
      label: 'Hardware',
      options: ['Ebco', 'Hafele', 'Blum', 'Hettich', 'Kyzo']
    },
    {
      label: 'Glass',
      options: ['Clear Glass', 'Toughened Glass', 'Flutted Glass', 'Tinted Glass', 'Frosted Glass']
    },
    {
      label: 'Electrical',
      options: ['Philips', 'Havells', 'Wipro', 'Crompton', 'GM', 'Great White']
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

  // Reusable dropdown that also supports a free-text "Custom…" entry.
  // Returns the wrapper element with a `.getValue()` method attached.
  const CUSTOM_OPT = 'Custom…';

  function makeChoiceField(config) {
    const wrap = document.createElement('div');
    wrap.className = 'choice-field' + (config.className ? ' ' + config.className : '');

    const sel  = document.createElement('select');
    const flat = [];

    if (config.groups) {
      config.groups.forEach(g => {
        const og = document.createElement('optgroup');
        og.label = g.label;
        g.options.forEach(o => {
          const op = document.createElement('option');
          op.value = o; op.textContent = o;
          og.appendChild(op);
          flat.push(o);
        });
        sel.appendChild(og);
      });
    } else {
      (config.options || []).forEach(o => {
        const op = document.createElement('option');
        op.value = o; op.textContent = o;
        sel.appendChild(op);
        flat.push(o);
      });
    }

    const customOpt = document.createElement('option');
    customOpt.value = CUSTOM_OPT;
    customOpt.textContent = CUSTOM_OPT;
    sel.appendChild(customOpt);

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'custom-in';
    input.placeholder = config.placeholder || 'Type here…';
    input.style.display = 'none';

    function syncCustom(focus) {
      const on = sel.value === CUSTOM_OPT;
      input.style.display = on ? '' : 'none';
      if (on && focus) input.focus();
    }
    sel.addEventListener('change', () => syncCustom(true));

    const v = config.value || '';
    if (v && flat.indexOf(v) === -1) {
      sel.value = CUSTOM_OPT;
      input.value = v;
    } else if (v) {
      sel.value = v;
    }
    syncCustom(false);

    wrap.appendChild(sel);
    wrap.appendChild(input);
    wrap.getValue = function () {
      return sel.value === CUSTOM_OPT ? input.value.trim() : sel.value;
    };
    return wrap;
  }

  function addItemRow(data = {}) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td></td>
      <td></td>
      <td><input type="number" class="sqft-in" value="${data.sqft || ''}" min="0" placeholder="0"></td>
      <td></td>
      <td><input type="number" class="price-in" value="${data.pricePerSqft || ''}" min="0" placeholder="0"></td>
      <td class="total-cell">₹0</td>
      <td><button type="button" class="del-item-btn" title="Remove"><i class="fa-solid fa-xmark"></i></button></td>
    `;
    tr.cells[0].appendChild(makeChoiceField({
      options: PLACES, value: data.place, placeholder: 'Custom place…', className: 'place-field'
    }));
    tr.cells[1].appendChild(makeChoiceField({
      groups: DESCRIPTION_GROUPS, value: data.description, placeholder: 'Custom description…', className: 'desc-field'
    }));
    tr.cells[3].appendChild(makeChoiceField({
      groups: MATERIALS_GROUPS, value: data.material, placeholder: 'Custom material…', className: 'material-field'
    }));

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
      const placeF = tr.querySelector('.place-field');
      const descF  = tr.querySelector('.desc-field');
      const matF   = tr.querySelector('.material-field');
      return {
        place:        placeF ? placeF.getValue() : '',
        description:  descF  ? descF.getValue()  : '',
        sqft,
        material:     matF   ? matF.getValue()   : '',
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

    const quote = buildQuoteObject(status);
    upsertQuote(quote);

    showToast(status === 'draft' ? 'Draft saved.' : 'Quotation saved!');
    clearBuilder();
    renderQuoteList();
  }

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

    const existingBill = getBills().find(b => b.billNo === editingBillNo);
    if (!existingBill) { showToast('Bill not found.', 'error'); return; }
    const bill = Object.assign({}, existingBill, fields); // preserves billNo, billDate, quoteId, status
    upsertBill(bill);

    if (bill.quoteId) {
      const srcQuote = getQuotes().find(q => q.id === bill.quoteId);
      if (srcQuote) {
        upsertQuote(Object.assign({}, srcQuote, fields)); // preserves id, date, status ('converted')
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

  saveQuoteBtn.addEventListener('click', () => {
    if (editingBillNo) saveBillEdits();
    else saveQuote('sent');
  });
  saveDraftBtn.addEventListener('click', () => saveQuote('draft'));
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
      quotes = quotes.filter(q => (q.clientName || '').toLowerCase().includes(f) || (q.id || '').toLowerCase().includes(f));
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
          deleteQuoteDoc(id);
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
    const quote = getQuotes().find(q => q.id === quoteId);
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
    upsertBill(bill);
    upsertQuote(Object.assign({}, quote, { status: 'converted' }));

    selectedBillId = bill.billNo;
    renderQuoteList(quoteSearch.value);
    renderBillList();
    switchToTab('bills');
    showBillDetail(bill.billNo);
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
  const editBillBtn     = document.getElementById('editBillBtn');

  let selectedBillId = null;

  function renderBillList(filter = '') {
    let bills = getBills().slice().reverse();
    if (filter) {
      const f = filter.toLowerCase();
      bills = bills.filter(b => (b.clientName || '').toLowerCase().includes(f) || (b.billNo || '').toLowerCase().includes(f));
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
          <button class="qc-btn qc-btn-edit" data-action="edit-bill" data-billno="${b.billNo}">
            <i class="fa-solid fa-pen"></i> Edit
          </button>
          <button class="qc-btn qc-btn-print" data-action="print-bill" data-billno="${b.billNo}">
            <i class="fa-solid fa-download"></i> PDF
          </button>
          <button class="qc-btn qc-btn-delete" data-action="delete-bill" data-billno="${b.billNo}">
            <i class="fa-solid fa-trash"></i>
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
        <td>${item.description || '—'}</td>
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

    markPaidBtn.dataset.billno  = billNo;
    printBillBtn.dataset.billno = billNo;
    editBillBtn.dataset.billno  = billNo;
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
    } else if (action === 'edit-bill') {
      loadBillIntoBuilder(billNo);
    } else if (action === 'print-bill') {
      const b = getBills().find(x => x.billNo === billNo);
      if (b) printDocument(b, 'FINAL BILL');
    } else if (action === 'delete-bill') {
      if (!confirm(`Delete bill ${billNo}? (testing only)`)) return;
      const card = btn.closest('.quote-card');
      gsap.to(card, { opacity: 0, x: -10, height: 0, marginBottom: 0, padding: 0, duration: 0.3,
        onComplete: () => {
          const bill = getBills().find(b => b.billNo === billNo);
          deleteBillDoc(billNo);

          // Revert the source quotation so it can be converted again (testing).
          if (bill && bill.quoteId) {
            const q = getQuotes().find(x => x.id === bill.quoteId);
            if (q && q.status === 'converted') {
              upsertQuote(Object.assign({}, q, { status: 'sent' }));
            }
          }

          if (selectedBillId === billNo) {
            selectedBillId = null;
            billDetail.style.display = 'none';
            billPreviewEmpty.style.display = 'block';
          }

          renderBillList(billSearch.value);
          renderQuoteList(quoteSearch.value);
          showToast('Bill deleted.', 'info');
        }
      });
    }
  });

  printBillBtn.addEventListener('click', function () {
    const b = getBills().find(x => x.billNo === this.dataset.billno);
    if (b) printDocument(b, 'FINAL BILL');
  });

  editBillBtn.addEventListener('click', function () {
    if (this.dataset.billno) loadBillIntoBuilder(this.dataset.billno);
  });

  markPaidBtn.addEventListener('click', function () {
    const bill = getBills().find(b => b.billNo === this.dataset.billno);
    if (!bill) return;
    upsertBill(Object.assign({}, bill, { status: 'paid' }));
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
  function printDocument(data, type) {
    const isQuote = type === 'QUOTATION';
    const docNo   = isQuote ? data.id : data.billNo;
    const docDate = isQuote ? fmtDate(data.date) : fmtDate(data.billDate);

    const itemsHTML = (data.items || []).map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.place}</td>
        <td>${item.description || '—'}</td>
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
              <th>Description</th>
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
          <h4>Additional Notes</h4>
          <p>${data.notes.replace(/\n/g, '<br>')}</p>
        </div>` : ''}

        <div class="print-spec">
          <h4>Materials &amp; Brand Specifications</h4>
          <table class="print-spec-table">
            <tbody>
              ${BRAND_SPEC.map(g =>
                `<tr><td class="bs-cat">${g.label}</td><td>${g.items.join(', ')}</td></tr>`).join('')}
            </tbody>
          </table>
          <p class="print-spec-note">${BRAND_SPEC_NOTE}</p>
        </div>

        <div class="print-terms-full">
          <h4>Terms &amp; Conditions</h4>
          ${fullTermsHTML()}
        </div>

        <div class="print-footer">
          <span>Hethvik Interiors &bull; Kada Agrahara, Bangalore &ndash; 562125</span>
          <span>This is a computer-generated ${type.toLowerCase()}.</span>
        </div>
      </div>
    `;

    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${type} ${docNo} — Hethvik Interiors</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>${PRINT_STYLES}
/* PDF-render overrides: per-page margins come from html2pdf, so drop the
   doc padding; neutralise fixed-position elements that don't paginate. */
.print-doc { padding: 0 !important; }
.print-watermark { display: none !important; }
.print-footer { position: static !important; left: auto !important; right: auto !important; margin-top: 10mm !important; }
tr, .ft-h, .print-totals-box, .print-client-section, .print-spec-table tr { page-break-inside: avoid; }
</style>
</head>
<body>${docHTML}</body>
</html>`;

    const safe = (s) => String(s || 'document').replace(/[^\w.-]+/g, '_');
    const filename = `${safe(type)}_${safe(docNo)}.pdf`;

    // Fallback: if the PDF library failed to load (e.g. offline), use the
    // old print-window so the feature still works.
    if (typeof html2pdf === 'undefined') {
      const w = window.open('', '_blank');
      if (!w) { showToast('Allow pop-ups to download the PDF.', 'error'); return; }
      w.document.open();
      w.document.write(fullHTML);
      w.document.close();
      w.onload = function () { w.focus(); w.print(); w.close(); };
      return;
    }

    // Direct download: render the document in an isolated off-screen iframe,
    // then rasterise it into a multi-page A4 PDF and save it.
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText =
      'position:fixed;left:-10000px;top:0;width:210mm;height:297mm;border:0;opacity:0;';
    document.body.appendChild(iframe);

    const idoc = iframe.contentWindow.document;
    idoc.open();
    idoc.write(fullHTML);
    idoc.close();

    showToast('Preparing your PDF…', 'info');

    const generate = () => {
      const el = idoc.querySelector('.print-doc') || idoc.body;
      html2pdf().set({
        margin:      [12, 14, 14, 14],          // top, left, bottom, right (mm)
        filename:    filename,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:   { mode: ['css', 'legacy'] }
      }).from(el).save()
        .then(() => { iframe.remove(); })
        .catch((err) => {
          console.error('[pdf] generation failed', err);
          showToast('Could not generate the PDF. Please try again.', 'error');
          iframe.remove();
        });
    };

    // Wait for fonts (and the iframe) to be ready before rasterising.
    const begin = () => {
      if (idoc.fonts && idoc.fonts.ready) {
        idoc.fonts.ready.then(() => setTimeout(generate, 150));
      } else {
        setTimeout(generate, 600);
      }
    };
    if (idoc.readyState === 'complete') begin();
    else iframe.onload = begin;
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

    upsertProject(project);
    showToast(existingId ? 'Project updated!' : 'Project saved to portfolio!');
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
          deleteProjectDoc(id);
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
     MATERIALS & BRAND SPEC — builder preview (static, render once)
     ═══════════════════════════════════════════════════════════════ */
  function renderBrandSpec() {
    const body = document.getElementById('brandSpecBody');
    const note = document.getElementById('brandSpecNote');
    if (!body) return;
    body.innerHTML = BRAND_SPEC.map(g =>
      `<tr><td class="bs-cat">${g.label}</td><td>${g.items.join(', ')}</td></tr>`).join('');
    if (note) note.textContent = BRAND_SPEC_NOTE;
  }
  renderBrandSpec();

  /* ═══════════════════════════════════════════════════════════════
     STANDARD TERMS & CONDITIONS — render window.HETHVIK_TERMS as HTML
     (shared by the PDF and the builder's collapsible preview)
     ═══════════════════════════════════════════════════════════════ */
  function escHTML(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function fullTermsHTML() {
    const text = (typeof window.HETHVIK_TERMS === 'string') ? window.HETHVIK_TERMS : '';
    if (!text) return '';
    const isHeading = (l) =>
      /:$/.test(l) || /^(Interior Painting Prices|Exterior Painting Prices|Brands considered)/.test(l);
    return text.split('\n').map(raw => {
      const l = raw.trim();
      if (!l) return '';
      return isHeading(l)
        ? `<p class="ft-h">${escHTML(l.replace(/:$/, ''))}</p>`
        : `<p class="ft-l">${escHTML(l)}</p>`;
    }).join('');
  }

  (function renderFullTermsPreview() {
    const el = document.getElementById('fullTermsPreview');
    if (el) el.innerHTML = fullTermsHTML();
  })();

  /* ═══════════════════════════════════════════════════════════════
     REACTIVE RE-RENDER (called by js/data.js onSnapshot)
     ═══════════════════════════════════════════════════════════════ */
  function refreshOpenBillDetail() {
    if (!selectedBillId || billDetail.style.display === 'none') return;
    if (getBills().some(b => b.billNo === selectedBillId)) {
      showBillDetail(selectedBillId);
    } else {
      selectedBillId = null;
      billDetail.style.display       = 'none';
      billPreviewEmpty.style.display = 'block';
    }
  }

  function rerender(which) {
    if (which === 'quotes')   renderQuoteList(quoteSearch.value);
    if (which === 'bills')  { renderBillList(billSearch.value); refreshOpenBillDetail(); }
    if (which === 'projects') renderProjectList();
  }

  /* ═══════════════════════════════════════════════════════════════
     INIT — must run last so all const declarations above are live
     ═══════════════════════════════════════════════════════════════ */
  if (window.fb && window.fb.auth) {
    if (window.fbData) window.fbData.onError = (m) => showToast(m, 'error');

    window.fb.auth.onAuthStateChanged(function (user) {
      if (!user) {
        if (window.fbData) window.fbData.stop();
        showLogin();
        return;
      }

      if (!window.fbData) {
        console.error('[login] Data layer unavailable; dashboard will have no cloud data.');
        showDashboard();
        return;
      }

      window.fbData.start(rerender)
        .then(() => window.fbData.importLocalData())
        .then((imported) => {
          showDashboard();
          if (imported) showToast('Local data imported to the cloud.');
        })
        .catch((e) => {
          console.error('[login] Firestore start/import failed', e);
          showDashboard();
        });
    });
  } else {
    showLogin();
  }

})();
