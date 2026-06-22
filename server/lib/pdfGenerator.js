import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { resolveDiskPath } from './upload.js';

const NAVY = '#1A2B4C';
const GOLD = '#C9A227';
const CHARCOAL = '#33363D';
const LIGHT_GRAY = '#F2F3F5';
const WHITE = '#FFFFFF';

const PAGE_W = 612; // letter
const PAGE_H = 792;
const MARGIN = 50;

function imagePathIfDrawable(omId, fileRef) {
  if (!fileRef) return null;
  if (!/^image\/(jpeg|png)$/.test(fileRef.mimetype)) return null;
  const p = resolveDiskPath(omId, fileRef);
  return fs.existsSync(p) ? p : null;
}

function addHeader(doc, om, sectionTitle) {
  doc.rect(0, 0, PAGE_W, 70).fill(NAVY);
  doc
    .fillColor(WHITE)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text((om.cover.propertyName || 'Offering Memorandum').toUpperCase(), MARGIN, 26, {
      width: PAGE_W - MARGIN * 2 - 150,
    });
  doc
    .fillColor(GOLD)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text(sectionTitle.toUpperCase(), MARGIN, 26, {
      width: PAGE_W - MARGIN * 2,
      align: 'right',
    });
  doc.fillColor(CHARCOAL).font('Helvetica');
}

function addFooter(doc, pageNum) {
  doc
    .fontSize(8)
    .fillColor('#8A8D93')
    .text('Confidential Offering Memorandum', MARGIN, PAGE_H - 40, { continued: false })
    .text(String(pageNum), PAGE_W - MARGIN - 20, PAGE_H - 40, { width: 20, align: 'right' });
  doc.fillColor(CHARCOAL);
}

function sectionLabel(doc, text, y) {
  doc.font('Helvetica-Bold').fontSize(14).fillColor(NAVY).text(text, MARGIN, y);
  doc
    .moveTo(MARGIN, y + 20)
    .lineTo(MARGIN + 60, y + 20)
    .lineWidth(2)
    .strokeColor(GOLD)
    .stroke();
  doc.fillColor(CHARCOAL).font('Helvetica').fontSize(10);
  return y + 34;
}

function statBox(doc, x, y, w, label, value) {
  doc.roundedRect(x, y, w, 50, 4).fillAndStroke(LIGHT_GRAY, LIGHT_GRAY);
  doc
    .fillColor('#8A8D93')
    .font('Helvetica')
    .fontSize(8)
    .text(label.toUpperCase(), x + 10, y + 10, { width: w - 20 });
  doc
    .fillColor(NAVY)
    .font('Helvetica-Bold')
    .fontSize(13)
    .text(value || '—', x + 10, y + 24, { width: w - 20 });
}

function newPage(doc, om, title, pageNum) {
  doc.addPage({ size: 'LETTER', margin: 0 });
  addHeader(doc, om, title);
  addFooter(doc, pageNum);
  return 95;
}

export async function generatePdf(om, outputPath) {
  const doc = new PDFDocument({ size: 'LETTER', margin: 0, autoFirstPage: false });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);
  let page = 1;

  // ---- Page 1: Cover ----
  doc.addPage({ size: 'LETTER', margin: 0 });
  const coverPhoto = imagePathIfDrawable(om.id, om.cover.coverPhoto);
  if (coverPhoto) {
    doc.image(coverPhoto, 0, 0, { width: PAGE_W, height: 420, cover: [PAGE_W, 420] });
    doc.rect(0, 0, PAGE_W, 420).fillOpacity(0.25).fill(NAVY).fillOpacity(1);
  } else {
    doc.rect(0, 0, PAGE_W, 420).fill(NAVY);
  }
  doc.rect(0, 420, PAGE_W, PAGE_H - 420).fill(WHITE);
  doc
    .fillColor(GOLD)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('OFFERING MEMORANDUM', MARGIN, 350, { width: PAGE_W - MARGIN * 2 });
  doc
    .fillColor(WHITE)
    .font('Helvetica-Bold')
    .fontSize(28)
    .text(om.cover.propertyName || 'Untitled Property', MARGIN, 368, {
      width: PAGE_W - MARGIN * 2,
    });
  const addressLine = [om.cover.addressLine1, [om.cover.city, om.cover.state].filter(Boolean).join(', '), om.cover.zip]
    .filter(Boolean)
    .join(' • ');
  doc.fillColor(CHARCOAL).font('Helvetica').fontSize(12).text(addressLine, MARGIN, 450, {
    width: PAGE_W - MARGIN * 2,
  });
  if (om.cover.tagline) {
    doc.fillColor('#5B5F66').font('Helvetica-Oblique').fontSize(12).text(om.cover.tagline, MARGIN, 475, {
      width: PAGE_W - MARGIN * 2,
    });
  }
  if (om.cover.propertyType) {
    doc
      .fillColor(NAVY)
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(om.cover.propertyType.toUpperCase(), MARGIN, 510);
  }
  const brokerLogo = imagePathIfDrawable(om.id, om.cover.brokerLogo);
  if (brokerLogo) {
    try {
      doc.image(brokerLogo, MARGIN, PAGE_H - 110, { fit: [140, 60] });
    } catch {
      /* skip unreadable image */
    }
  }
  addFooter(doc, page);
  page++;

  // ---- Page 2: Property Overview ----
  let y = newPage(doc, om, 'Property Overview', page);
  page++;
  y = sectionLabel(doc, 'Property Overview', y);
  const stats = [
    ['Year Built', om.overview.yearBuilt],
    ['Square Footage', om.overview.squareFootage],
    ['Lot Size', om.overview.lotSize],
    ['Units', om.overview.units],
    ['Zoning', om.overview.zoning],
    ['Parking', om.overview.parking],
  ];
  const boxW = (PAGE_W - MARGIN * 2 - 20) / 3;
  stats.forEach(([label, value], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    statBox(doc, MARGIN + col * (boxW + 10), y + row * 60, boxW, label, value);
  });
  y += Math.ceil(stats.length / 3) * 60 + 20;
  doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY).text('Description', MARGIN, y);
  y += 18;
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(CHARCOAL)
    .text(om.overview.description || 'No description provided.', MARGIN, y, {
      width: PAGE_W - MARGIN * 2,
      align: 'left',
    });
  y = doc.y + 16;
  const photos = (om.overview.photos || []).map((f) => imagePathIfDrawable(om.id, f)).filter(Boolean).slice(0, 4);
  if (photos.length) {
    const pw = (PAGE_W - MARGIN * 2 - (photos.length - 1) * 10) / photos.length;
    photos.forEach((p, i) => {
      try {
        doc.image(p, MARGIN + i * (pw + 10), y, { width: pw, height: 100, cover: [pw, 100] });
      } catch {
        /* skip */
      }
    });
  }

  // ---- Page 3: Executive Summary ----
  y = newPage(doc, om, 'Executive Summary', page);
  page++;
  y = sectionLabel(doc, 'Executive Summary', y);
  const metrics = [
    ['Offering Price', om.executiveSummary.offeringPrice],
    ['Cap Rate', om.executiveSummary.capRate],
    ['NOI', om.executiveSummary.noi],
  ];
  metrics.forEach(([label, value], i) => {
    statBox(doc, MARGIN + i * (boxW + 10), y, boxW, label, value);
  });
  y += 70;
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(CHARCOAL)
    .text(om.executiveSummary.narrative || 'No summary provided.', MARGIN, y, {
      width: PAGE_W - MARGIN * 2,
    });
  y = doc.y + 16;
  if ((om.executiveSummary.highlights || []).length) {
    doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY).text('Investment Highlights', MARGIN, y);
    y += 18;
    om.executiveSummary.highlights.forEach((h) => {
      doc.font('Helvetica').fontSize(10).fillColor(CHARCOAL);
      doc.circle(MARGIN + 3, y + 5, 2).fill(GOLD);
      doc.fillColor(CHARCOAL).text(h, MARGIN + 14, y, { width: PAGE_W - MARGIN * 2 - 14 });
      y = doc.y + 6;
    });
  }

  // ---- Page 4: Market Overview ----
  y = newPage(doc, om, 'Market Overview', page);
  page++;
  y = sectionLabel(doc, 'Market Overview', y);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(NAVY).text(om.market.marketName || 'Market', MARGIN, y);
  y = doc.y + 10;
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(CHARCOAL)
    .text(om.market.narrative || 'No market narrative provided.', MARGIN, y, {
      width: PAGE_W - MARGIN * 2,
    });
  y = doc.y + 16;
  if (om.market.demographics) {
    doc.font('Helvetica-Bold').fontSize(11).fillColor(NAVY).text('Demographics', MARGIN, y);
    y = doc.y + 6;
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(CHARCOAL)
      .text(om.market.demographics, MARGIN, y, { width: PAGE_W - MARGIN * 2 });
    y = doc.y + 16;
  }
  const marketImgs = (om.market.images || []).map((f) => imagePathIfDrawable(om.id, f)).filter(Boolean).slice(0, 4);
  if (marketImgs.length) {
    const pw = (PAGE_W - MARGIN * 2 - (marketImgs.length - 1) * 10) / marketImgs.length;
    marketImgs.forEach((p, i) => {
      try {
        doc.image(p, MARGIN + i * (pw + 10), y, { width: pw, height: 100, cover: [pw, 100] });
      } catch {
        /* skip */
      }
    });
  }

  // ---- Page 5: Financials ----
  y = newPage(doc, om, 'Financial Summary', page);
  page++;
  y = sectionLabel(doc, 'Financial Summary', y);
  const finMetrics = [
    ['Asking Price', om.financials.askingPrice],
    ['NOI', om.financials.noi],
    ['Cap Rate', om.financials.capRate],
  ];
  finMetrics.forEach(([label, value], i) => {
    statBox(doc, MARGIN + i * (boxW + 10), y, boxW, label, value);
  });
  y += 70;
  const finMetrics2 = [
    ['Gross Income', om.financials.grossIncome],
    ['Operating Expenses', om.financials.operatingExpenses],
  ];
  finMetrics2.forEach(([label, value], i) => {
    statBox(doc, MARGIN + i * (boxW + 10), y, boxW, label, value);
  });
  y += 70;
  if ((om.financials.lineItems || []).length) {
    y = drawTable(
      doc,
      y,
      ['Line Item', 'Income', 'Expense'],
      om.financials.lineItems.map((li) => [li.label, li.income, li.expense]),
      [0.5, 0.25, 0.25]
    );
  }

  // ---- Page 6: Sales Comps ----
  newPage(doc, om, 'Sales Comparables', page);
  page++;
  y = sectionLabel(doc, 'Sales Comparables', 95);
  if ((om.salesComps || []).length) {
    drawTable(
      doc,
      y,
      ['Address', 'Sale Date', 'Sale Price', 'Price/SF', 'Cap Rate'],
      om.salesComps.map((c) => [c.address, c.saleDate, c.salePrice, c.pricePerSF, c.capRate]),
      [0.34, 0.16, 0.18, 0.16, 0.16]
    );
  } else {
    doc.font('Helvetica').fontSize(10).fillColor('#8A8D93').text('No sales comparables provided.', MARGIN, y);
  }

  // ---- Page 7: Rent Comps ----
  newPage(doc, om, 'Rent Comparables', page);
  page++;
  y = sectionLabel(doc, 'Rent Comparables', 95);
  if ((om.rentComps || []).length) {
    drawTable(
      doc,
      y,
      ['Address', 'Tenant', 'Rent/SF', 'Lease Term', 'Sq Ft'],
      om.rentComps.map((c) => [c.address, c.tenant, c.rentPerSF, c.leaseTerm, c.squareFeet]),
      [0.32, 0.22, 0.16, 0.16, 0.14]
    );
  } else {
    doc.font('Helvetica').fontSize(10).fillColor('#8A8D93').text('No rent comparables provided.', MARGIN, y);
  }

  // ---- Page 8: Team / Contact ----
  y = newPage(doc, om, 'About the Team', page);
  page++;
  y = sectionLabel(doc, 'About the Team', y);
  if ((om.team || []).length) {
    om.team.forEach((member) => {
      const headshot = imagePathIfDrawable(om.id, member.headshot);
      if (headshot) {
        try {
          doc.image(headshot, MARGIN, y, { width: 64, height: 64, cover: [64, 64] });
        } catch {
          /* skip */
        }
      }
      const textX = MARGIN + 80;
      doc.font('Helvetica-Bold').fontSize(12).fillColor(NAVY).text(member.name || 'Team Member', textX, y);
      doc.font('Helvetica').fontSize(10).fillColor('#5B5F66').text(member.title || '', textX, doc.y);
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(CHARCOAL)
        .text([member.phone, member.email].filter(Boolean).join('  •  '), textX, doc.y + 2);
      if (member.bio) {
        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor(CHARCOAL)
          .text(member.bio, textX, doc.y + 6, { width: PAGE_W - MARGIN - textX });
      }
      y = Math.max(doc.y, y + 64) + 24;
    });
  } else {
    doc.font('Helvetica').fontSize(10).fillColor('#8A8D93').text('No team members provided.', MARGIN, y);
  }

  doc.end();
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
  return outputPath;
}

function drawTable(doc, y, headers, rows, widthRatios) {
  const tableW = PAGE_W - MARGIN * 2;
  const colWidths = widthRatios.map((r) => r * tableW);
  let x = MARGIN;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(WHITE);
  doc.rect(MARGIN, y, tableW, 22).fill(NAVY);
  headers.forEach((h, i) => {
    doc.fillColor(WHITE).text(h, x + 6, y + 6, { width: colWidths[i] - 10 });
    x += colWidths[i];
  });
  y += 22;
  doc.font('Helvetica').fontSize(9);
  rows.forEach((row, rowIdx) => {
    if (y > PAGE_H - 80) return; // simple overflow guard for single-page tables
    const rowH = 22;
    if (rowIdx % 2 === 1) {
      doc.rect(MARGIN, y, tableW, rowH).fill(LIGHT_GRAY);
    }
    x = MARGIN;
    row.forEach((cell, i) => {
      doc.fillColor(CHARCOAL).text(cell || '—', x + 6, y + 6, { width: colWidths[i] - 10 });
      x += colWidths[i];
    });
    y += rowH;
  });
  return y + 10;
}
