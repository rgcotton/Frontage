import fs from 'fs';
import PptxGenJS from 'pptxgenjs';
import { resolveDiskPath } from './upload.js';

const NAVY = '1A2B4C';
const GOLD = 'C9A227';
const CHARCOAL = '33363D';
const LIGHT_GRAY = 'F2F3F5';
const MUTED = '8A8D93';

function imagePathIfDrawable(omId, fileRef) {
  if (!fileRef) return null;
  if (!/^image\/(jpeg|png)$/.test(fileRef.mimetype)) return null;
  const p = resolveDiskPath(omId, fileRef);
  return fs.existsSync(p) ? p : null;
}

function addSectionHeader(slide, propertyName, sectionTitle) {
  slide.background = { color: 'FFFFFF' };
  slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.6, fill: { color: NAVY } });
  slide.addText((propertyName || 'Offering Memorandum').toUpperCase(), {
    x: 0.3,
    y: 0.07,
    w: 6,
    h: 0.46,
    fontSize: 12,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Helvetica',
  });
  slide.addText(sectionTitle.toUpperCase(), {
    x: 6.3,
    y: 0.07,
    w: 3.4,
    h: 0.46,
    fontSize: 12,
    bold: true,
    color: GOLD,
    align: 'right',
    fontFace: 'Helvetica',
  });
}

function statBoxes(slide, items, y) {
  const w = 3.0;
  const gap = 0.2;
  items.forEach(([label, value], i) => {
    const x = 0.3 + i * (w + gap);
    slide.addShape('roundRect', { x, y, w, h: 0.9, fill: { color: LIGHT_GRAY }, line: { color: LIGHT_GRAY }, rectRadius: 0.05 });
    slide.addText(label.toUpperCase(), { x: x + 0.15, y: y + 0.08, w: w - 0.3, h: 0.25, fontSize: 8, color: MUTED });
    slide.addText(value || '—', { x: x + 0.15, y: y + 0.35, w: w - 0.3, h: 0.45, fontSize: 16, bold: true, color: NAVY });
  });
}

function table(slide, headers, rows, y, colWidths) {
  const headerRow = headers.map((h) => ({
    text: h,
    options: { fill: { color: NAVY }, color: 'FFFFFF', bold: true, fontSize: 10 },
  }));
  const bodyRows = rows.map((row, i) =>
    row.map((cell) => ({
      text: cell != null && cell !== '' ? String(cell) : '—',
      options: { fill: { color: i % 2 === 1 ? LIGHT_GRAY : 'FFFFFF' }, color: CHARCOAL, fontSize: 9 },
    }))
  );
  slide.addTable([headerRow, ...bodyRows], {
    x: 0.3,
    y,
    w: 9.4,
    colW: colWidths,
    border: { type: 'none' },
    autoPage: false,
  });
}

export async function generatePptx(om, outputPath) {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'OM', width: 10, height: 7.5 });
  pptx.layout = 'OM';

  // Slide 1: Cover
  const cover = pptx.addSlide();
  cover.background = { color: NAVY };
  const coverPhoto = imagePathIfDrawable(om.id, om.cover.coverPhoto);
  if (coverPhoto) {
    cover.addImage({ path: coverPhoto, x: 0, y: 0, w: 10, h: 4.2, sizing: { type: 'cover', w: 10, h: 4.2 } });
    cover.addShape('rect', { x: 0, y: 0, w: 10, h: 4.2, fill: { color: NAVY, transparency: 65 } });
  }
  cover.addShape('rect', { x: 0, y: 4.2, w: 10, h: 3.3, fill: { color: 'FFFFFF' } });
  cover.addText('OFFERING MEMORANDUM', { x: 0.5, y: 3.3, w: 9, h: 0.4, fontSize: 13, bold: true, color: GOLD });
  cover.addText(om.cover.propertyName || 'Untitled Property', {
    x: 0.5,
    y: 3.6,
    w: 9,
    h: 0.7,
    fontSize: 30,
    bold: true,
    color: 'FFFFFF',
  });
  const addressLine = [om.cover.addressLine1, [om.cover.city, om.cover.state].filter(Boolean).join(', '), om.cover.zip]
    .filter(Boolean)
    .join('  •  ');
  cover.addText(addressLine, { x: 0.5, y: 4.5, w: 9, h: 0.4, fontSize: 14, color: CHARCOAL });
  if (om.cover.tagline) {
    cover.addText(om.cover.tagline, { x: 0.5, y: 4.85, w: 9, h: 0.4, fontSize: 13, italic: true, color: MUTED });
  }
  if (om.cover.propertyType) {
    cover.addText(om.cover.propertyType.toUpperCase(), { x: 0.5, y: 5.3, w: 9, h: 0.3, fontSize: 11, bold: true, color: NAVY });
  }

  // Slide 2: Property Overview
  const overview = pptx.addSlide();
  addSectionHeader(overview, om.cover.propertyName, 'Property Overview');
  statBoxes(
    overview,
    [
      ['Year Built', om.overview.yearBuilt],
      ['Square Footage', om.overview.squareFootage],
      ['Lot Size', om.overview.lotSize],
    ],
    1.0
  );
  statBoxes(
    overview,
    [
      ['Units', om.overview.units],
      ['Zoning', om.overview.zoning],
      ['Parking', om.overview.parking],
    ],
    2.05
  );
  overview.addText('Description', { x: 0.3, y: 3.2, w: 9.4, h: 0.3, fontSize: 12, bold: true, color: NAVY });
  overview.addText(om.overview.description || 'No description provided.', {
    x: 0.3,
    y: 3.55,
    w: 9.4,
    h: 2.2,
    fontSize: 10,
    color: CHARCOAL,
    valign: 'top',
  });

  // Slide 3: Executive Summary
  const exec = pptx.addSlide();
  addSectionHeader(exec, om.cover.propertyName, 'Executive Summary');
  statBoxes(
    exec,
    [
      ['Offering Price', om.executiveSummary.offeringPrice],
      ['Cap Rate', om.executiveSummary.capRate],
      ['NOI', om.executiveSummary.noi],
    ],
    1.0
  );
  exec.addText(om.executiveSummary.narrative || 'No summary provided.', {
    x: 0.3,
    y: 2.15,
    w: 9.4,
    h: 1.6,
    fontSize: 10,
    color: CHARCOAL,
    valign: 'top',
  });
  if ((om.executiveSummary.highlights || []).length) {
    exec.addText('Investment Highlights', { x: 0.3, y: 3.85, w: 9.4, h: 0.3, fontSize: 12, bold: true, color: NAVY });
    exec.addText(
      om.executiveSummary.highlights.map((h) => ({ text: h, options: { bullet: { code: '2022', color: GOLD }, breakLine: true, fontSize: 10, color: CHARCOAL } })),
      { x: 0.3, y: 4.2, w: 9.4, h: 2.5, valign: 'top' }
    );
  }

  // Slide 4: Market Overview
  const market = pptx.addSlide();
  addSectionHeader(market, om.cover.propertyName, 'Market Overview');
  market.addText(om.market.marketName || 'Market', { x: 0.3, y: 1.0, w: 9.4, h: 0.4, fontSize: 16, bold: true, color: NAVY });
  market.addText(om.market.narrative || 'No market narrative provided.', {
    x: 0.3,
    y: 1.5,
    w: 9.4,
    h: 1.8,
    fontSize: 10,
    color: CHARCOAL,
    valign: 'top',
  });
  if (om.market.demographics) {
    market.addText('Demographics', { x: 0.3, y: 3.4, w: 9.4, h: 0.3, fontSize: 12, bold: true, color: NAVY });
    market.addText(om.market.demographics, { x: 0.3, y: 3.75, w: 9.4, h: 1.5, fontSize: 10, color: CHARCOAL, valign: 'top' });
  }

  // Slide 5: Financials
  const fin = pptx.addSlide();
  addSectionHeader(fin, om.cover.propertyName, 'Financial Summary');
  statBoxes(
    fin,
    [
      ['Asking Price', om.financials.askingPrice],
      ['NOI', om.financials.noi],
      ['Cap Rate', om.financials.capRate],
    ],
    1.0
  );
  statBoxes(
    fin,
    [
      ['Gross Income', om.financials.grossIncome],
      ['Operating Expenses', om.financials.operatingExpenses],
    ],
    2.05
  );
  if ((om.financials.lineItems || []).length) {
    table(
      fin,
      ['Line Item', 'Income', 'Expense'],
      om.financials.lineItems.map((li) => [li.label, li.income, li.expense]),
      3.2,
      [4.7, 2.35, 2.35]
    );
  }

  // Slide 6: Sales Comps
  const sales = pptx.addSlide();
  addSectionHeader(sales, om.cover.propertyName, 'Sales Comparables');
  if ((om.salesComps || []).length) {
    table(
      sales,
      ['Address', 'Sale Date', 'Sale Price', 'Price/SF', 'Cap Rate'],
      om.salesComps.map((c) => [c.address, c.saleDate, c.salePrice, c.pricePerSF, c.capRate]),
      1.0,
      [3.2, 1.5, 1.8, 1.4, 1.5]
    );
  } else {
    sales.addText('No sales comparables provided.', { x: 0.3, y: 1.0, w: 9.4, h: 0.4, fontSize: 11, color: MUTED });
  }

  // Slide 7: Rent Comps
  const rent = pptx.addSlide();
  addSectionHeader(rent, om.cover.propertyName, 'Rent Comparables');
  if ((om.rentComps || []).length) {
    table(
      rent,
      ['Address', 'Tenant', 'Rent/SF', 'Lease Term', 'Sq Ft'],
      om.rentComps.map((c) => [c.address, c.tenant, c.rentPerSF, c.leaseTerm, c.squareFeet]),
      1.0,
      [3.0, 2.2, 1.5, 1.5, 1.2]
    );
  } else {
    rent.addText('No rent comparables provided.', { x: 0.3, y: 1.0, w: 9.4, h: 0.4, fontSize: 11, color: MUTED });
  }

  // Slide 8: Team / Contact
  const team = pptx.addSlide();
  addSectionHeader(team, om.cover.propertyName, 'About the Team');
  if ((om.team || []).length) {
    let y = 1.0;
    om.team.forEach((member) => {
      const headshot = imagePathIfDrawable(om.id, member.headshot);
      if (headshot) {
        team.addImage({ path: headshot, x: 0.3, y, w: 0.9, h: 0.9, sizing: { type: 'cover', w: 0.9, h: 0.9 } });
      }
      team.addText(member.name || 'Team Member', { x: 1.4, y, w: 8.3, h: 0.3, fontSize: 13, bold: true, color: NAVY });
      team.addText(member.title || '', { x: 1.4, y: y + 0.28, w: 8.3, h: 0.25, fontSize: 10, color: MUTED });
      team.addText([member.phone, member.email].filter(Boolean).join('   •   '), {
        x: 1.4,
        y: y + 0.52,
        w: 8.3,
        h: 0.25,
        fontSize: 9,
        color: CHARCOAL,
      });
      if (member.bio) {
        team.addText(member.bio, { x: 1.4, y: y + 0.76, w: 8.3, h: 0.4, fontSize: 9, color: CHARCOAL });
      }
      y += 1.25;
    });
  } else {
    team.addText('No team members provided.', { x: 0.3, y: 1.0, w: 9.4, h: 0.4, fontSize: 11, color: MUTED });
  }

  await pptx.writeFile({ fileName: outputPath });
  return outputPath;
}
