/* Native PDF generator for quotations / bills.
   Builds the document with jsPDF text/graphics (no html2canvas), so output
   is small, has selectable text, and never blanks out on canvas limits.
   Exposes window.buildHethvikPdf(payload) -> jsPDF doc (caller calls .save).

   payload = { type, docNo, docDate, isQuote, data, brandSpec, brandNote, terms } */
(function () {
  'use strict';

  window.buildHethvikPdf = function (payload) {
    const JSP = window.jspdf && window.jspdf.jsPDF;
    if (!JSP) throw new Error('jsPDF not loaded');

    const { type, docNo, docDate, isQuote, data } = payload;
    const brandSpec = payload.brandSpec || [];
    const brandNote = payload.brandNote || '';
    const terms     = typeof payload.terms === 'string' ? payload.terms : '';

    const doc = new JSP({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const PW = 210, PH = 297, ML = 14, MR = 14, CW = PW - ML - MR; // content width 182
    const GOLD = [201, 168, 76], DARK = [26, 26, 26], GRAY = [102, 102, 102],
          LIGHT = [232, 232, 232], BROWN = [138, 116, 48];
    let y = 16;

    const money = (n) => 'Rs ' + Math.round(Number(n) || 0).toLocaleString('en-IN');

    function footer() {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(170, 170, 170);
      doc.setDrawColor(221, 221, 221); doc.setLineWidth(0.2);
      doc.line(ML, PH - 12, PW - MR, PH - 12);
      doc.text('Hethvik Interiors  |  Kada Agrahara, Bangalore - 562125', ML, PH - 8);
      doc.text('Computer-generated ' + String(type).toLowerCase(), PW - MR, PH - 8, { align: 'right' });
    }
    function newPage() { footer(); doc.addPage(); y = 16; }
    function ensure(h) { if (y + h > PH - 16) newPage(); }
    function sectionTitle(t, gold) {
      ensure(12);
      doc.setDrawColor.apply(doc, LIGHT); doc.setLineWidth(0.2);
      doc.line(ML, y, PW - MR, y); y += 5;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(gold ? 9 : 8.5);
      doc.setTextColor.apply(doc, gold ? GOLD : [150, 150, 150]);
      doc.text(t, ML, y); y += 5;
    }

    /* ── Header ─────────────────────────────────────────── */
    doc.setFont('times', 'bold'); doc.setFontSize(22);
    doc.setTextColor.apply(doc, DARK); doc.text('Hethvik ', ML, y + 2);
    const hw = doc.getTextWidth('Hethvik ');
    doc.setTextColor.apply(doc, GOLD); doc.text('Interiors', ML + hw, y + 2);

    doc.setFont('times', 'bold'); doc.setFontSize(16); doc.setTextColor.apply(doc, GOLD);
    doc.text(String(type), PW - MR, y, { align: 'right' });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor.apply(doc, DARK);
    doc.text(String(docNo), PW - MR, y + 6, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor.apply(doc, GRAY);
    doc.text('Date: ' + docDate, PW - MR, y + 11, { align: 'right' });

    y += 8;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor.apply(doc, GRAY);
    doc.text('Premium Interior Design Studio', ML, y); y += 4;
    doc.text('Office: Hethvik Decor Mart, Kada Agrahara, Bangalore - 562125', ML, y); y += 4;
    doc.text('+91 97045 20901   |   info@hethvikinteriors.com', ML, y); y += 5;
    doc.setDrawColor.apply(doc, GOLD); doc.setLineWidth(0.6); doc.line(ML, y, PW - MR, y); y += 8;

    /* ── Bill To / Project ──────────────────────────────── */
    const colR = ML + CW / 2;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(150, 150, 150);
    doc.text('BILL TO', ML, y); doc.text('PROJECT DETAILS', colR, y); y += 5;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor.apply(doc, DARK);
    doc.text(data.clientName || '-', ML, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
    doc.text('Document No: ' + docNo, colR, y);
    let yL = y + 5, yR = y + 5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor.apply(doc, DARK);
    if (data.clientPhone) { doc.text(String(data.clientPhone), ML, yL); yL += 5; }
    if (data.clientAddress) {
      const al = doc.splitTextToSize(String(data.clientAddress), CW / 2 - 4);
      doc.text(al, ML, yL); yL += al.length * 4.5;
    }
    doc.text('Date: ' + docDate, colR, yR); yR += 5;
    if (!isQuote && data.quoteId) { doc.text('Ref Quote: ' + data.quoteId, colR, yR); yR += 5; }
    y = Math.max(yL, yR) + 3;

    /* ── Items table ────────────────────────────────────── */
    const cols = [
      { t: '#',            w: 8,  a: 'left'  },
      { t: 'Place / Area', w: 24, a: 'left'  },
      { t: 'Description',  w: 40, a: 'left'  },
      { t: 'Sqft',         w: 14, a: 'left'  },
      { t: 'Material',     w: 28, a: 'left'  },
      { t: 'Hardware',     w: 24, a: 'left'  },
      { t: 'Rate/Sqft',    w: 22, a: 'right' },
      { t: 'Amount',       w: 22, a: 'right' },
    ];
    const colX = []; let cx = ML; cols.forEach(c => { colX.push(cx); cx += c.w; });
    const lineH = 4.2, padY = 1.8;

    function tableHeader() {
      doc.setFillColor.apply(doc, GOLD); doc.rect(ML, y, CW, 7, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
      cols.forEach((c, i) => {
        const tx = c.a === 'right' ? colX[i] + c.w - 2 : colX[i] + 2;
        doc.text(c.t.toUpperCase(), tx, y + 4.7, { align: c.a });
      });
      y += 7;
    }

    ensure(15); tableHeader();
    (data.items || []).forEach((it, idx) => {
      const matStr = Array.isArray(it.materials) ? it.materials.join(', ') : (it.material || '');
      const hwStr  = Array.isArray(it.hardware)  ? it.hardware.join(', ')  : (it.hardware || '');
      const cells = [
        [String(idx + 1)],
        doc.splitTextToSize(String(it.place || ''), cols[1].w - 3),
        doc.splitTextToSize(String(it.description || '-'), cols[2].w - 3),
        doc.splitTextToSize(String(it.sqft || '') + ' sqft', cols[3].w - 3),
        doc.splitTextToSize(matStr || '-', cols[4].w - 3),
        doc.splitTextToSize(hwStr || '-', cols[5].w - 3),
        [money(it.pricePerSqft)],
        [money(it.total)],
      ];
      const maxLines = Math.max.apply(null, cells.map(a => a.length));
      const rowH = maxLines * lineH + padY * 2;
      if (y + rowH > PH - 16) { newPage(); tableHeader(); }
      if (idx % 2 === 1) { doc.setFillColor(250, 250, 250); doc.rect(ML, y, CW, rowH, 'F'); }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(42, 42, 42);
      cells.forEach((lines, i) => {
        const tx = cols[i].a === 'right' ? colX[i] + cols[i].w - 2 : colX[i] + 2;
        lines.forEach((ln, li) => doc.text(ln, tx, y + padY + lineH * (li + 1) - 1, { align: cols[i].a }));
      });
      doc.setDrawColor.apply(doc, LIGHT); doc.setLineWidth(0.1); doc.line(ML, y + rowH, PW - MR, y + rowH);
      y += rowH;
    });
    y += 6;

    /* ── Totals ─────────────────────────────────────────── */
    const boxW = 74, boxX = PW - MR - boxW;
    const trows = [['Subtotal', money(data.subtotal)]];
    if (Number(data.discountAmount) > 0) trows.push(['Discount', '- ' + money(data.discountAmount)]);
    trows.push(['GST (' + (data.gstPercent || 0) + '%)', money(data.gstAmount)]);
    ensure(trows.length * 6 + 12);
    const boxTop = y; let ty = y;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
    trows.forEach(r => {
      doc.setTextColor.apply(doc, GRAY); doc.text(r[0], boxX + 3, ty + 4);
      doc.setTextColor.apply(doc, DARK); doc.text(r[1], boxX + boxW - 3, ty + 4, { align: 'right' });
      ty += 6;
    });
    doc.setFillColor.apply(doc, GOLD); doc.rect(boxX, ty, boxW, 8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(255, 255, 255);
    doc.text('Grand Total', boxX + 3, ty + 5.5);
    doc.text(money(data.grandTotal), boxX + boxW - 3, ty + 5.5, { align: 'right' });
    doc.setDrawColor.apply(doc, LIGHT); doc.setLineWidth(0.2); doc.rect(boxX, boxTop, boxW, (ty + 8) - boxTop);
    y = ty + 8 + 8;

    /* ── Additional notes ───────────────────────────────── */
    if (data.notes) {
      sectionTitle('ADDITIONAL NOTES');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor.apply(doc, GRAY);
      doc.splitTextToSize(String(data.notes), CW).forEach(ln => { ensure(5); doc.text(ln, ML, y); y += 4.5; });
      y += 3;
    }

    /* ── Materials & brand spec ─────────────────────────── */
    if (brandSpec.length) {
      sectionTitle('MATERIALS & BRAND SPECIFICATIONS');
      doc.setFontSize(8.5);
      brandSpec.forEach((g, gi) => {
        const labelLines = doc.splitTextToSize(g.label, 56);
        const itemLines  = doc.splitTextToSize((g.items || []).join(', '), CW - 64);
        const rowH = Math.max(labelLines.length, itemLines.length) * 4.2 + 2.5;
        if (y + rowH > PH - 16) newPage();
        if (gi % 2 === 1) { doc.setFillColor(250, 250, 250); doc.rect(ML, y, CW, rowH, 'F'); }
        doc.setFont('helvetica', 'bold'); doc.setTextColor.apply(doc, BROWN);
        labelLines.forEach((ln, i) => doc.text(ln, ML + 2, y + 4 + i * 4.2));
        doc.setFont('helvetica', 'normal'); doc.setTextColor(42, 42, 42);
        itemLines.forEach((ln, i) => doc.text(ln, ML + 62, y + 4 + i * 4.2));
        doc.setDrawColor.apply(doc, LIGHT); doc.setLineWidth(0.1); doc.line(ML, y + rowH, PW - MR, y + rowH);
        y += rowH;
      });
      if (brandNote) {
        y += 2; doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor.apply(doc, GRAY);
        doc.splitTextToSize(brandNote, CW).forEach(ln => { ensure(4); doc.text(ln, ML, y); y += 4; });
      }
      y += 4;
    }

    /* ── Terms & conditions ─────────────────────────────── */
    if (terms) {
      sectionTitle('TERMS & CONDITIONS', true);
      const isHeading = (l) => /:$/.test(l) ||
        /^(Interior Painting Prices|Exterior Painting Prices|Brands considered)/.test(l);
      terms.split('\n').forEach(raw => {
        const l = raw.trim();
        if (!l) { y += 1.5; return; }
        if (isHeading(l)) {
          doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor.apply(doc, DARK);
          doc.splitTextToSize(l.replace(/:$/, ''), CW).forEach(ln => { ensure(5); doc.text(ln, ML, y); y += 4.2; });
          y += 1;
        } else {
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(85, 85, 85);
          doc.splitTextToSize(l, CW).forEach(ln => { ensure(4.5); doc.text(ln, ML, y); y += 3.8; });
        }
      });
    }

    footer();
    return doc;
  };
})();
