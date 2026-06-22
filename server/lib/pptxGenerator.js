import fs from 'fs';
import PptxGenJS from 'pptxgenjs';
import { resolveDiskPath } from './upload.js';
import { fetchStaticMapBuffer } from './maps.js';
import { formatCurrency, formatPercent, formatNumber, formatMonthYear, escOrDash } from './pdf/helpers/format.js';

const NAVY = '1A2B4C';
const GOLD = 'C9A227';
const CHARCOAL = '33363D';
const LIGHT_GRAY = 'F2F3F5';
const MUTED = '8A8D93';

const LEASE_TYPES_NONE = '—';

function imagePathIfDrawable(omId, fileRef) {
  if (!fileRef) return null;
  if (!/^image\/(jpeg|png)$/.test(fileRef.mimetype)) return null;
  const p = resolveDiskPath(omId, fileRef);
  return fs.existsSync(p) ? p : null;
}

function num(value) {
  return Number(String(value ?? '').replace(/[^0-9.-]/g, '')) || 0;
}

function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks.length ? chunks : [[]];
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
  const totalW = 9.4;
  const gap = 0.15;
  const w = (totalW - gap * (items.length - 1)) / items.length;
  items.forEach(([label, value], i) => {
    const x = 0.3 + i * (w + gap);
    slide.addShape('roundRect', { x, y, w, h: 0.9, fill: { color: LIGHT_GRAY }, line: { color: LIGHT_GRAY }, rectRadius: 0.05 });
    slide.addText(label.toUpperCase(), { x: x + 0.13, y: y + 0.08, w: w - 0.26, h: 0.25, fontSize: 7.5, color: MUTED });
    slide.addText(value || '—', { x: x + 0.13, y: y + 0.35, w: w - 0.26, h: 0.45, fontSize: 14, bold: true, color: NAVY });
  });
}

function table(slide, headers, rows, y, colWidths, opts = {}) {
  const headerRow = headers.map((h) => ({
    text: h,
    options: { fill: { color: NAVY }, color: 'FFFFFF', bold: true, fontSize: 9 },
  }));
  const bodyRows = rows.map((row, i) =>
    row.map((cell) => ({
      text: cell != null && cell !== '' ? String(cell) : '—',
      options: {
        fill: { color: opts.totalRowIndexes?.includes(i) ? 'FFFFFF' : i % 2 === 1 ? LIGHT_GRAY : 'FFFFFF' },
        color: opts.totalRowIndexes?.includes(i) ? NAVY : CHARCOAL,
        bold: Boolean(opts.totalRowIndexes?.includes(i)),
        fontSize: 9,
      },
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

function addCard(slide, x, y, w, h, title, rows, notes) {
  slide.addShape('rect', { x, y, w, h, fill: { color: 'FFFFFF' }, line: { color: 'E7E9EC', width: 1 } });
  slide.addText(title, { x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.3, fontSize: 11, bold: true, color: NAVY });
  const rowY = y + 0.45;
  const rowH = (h - 0.45 - (notes ? 0.5 : 0)) / rows.length;
  rows.forEach(([label, value], i) => {
    const ry = rowY + i * rowH;
    slide.addText(label, { x: x + 0.15, y: ry, w: (w - 0.3) / 2, h: rowH, fontSize: 8.5, color: MUTED, valign: 'middle' });
    slide.addText(value || '—', {
      x: x + 0.15 + (w - 0.3) / 2,
      y: ry,
      w: (w - 0.3) / 2,
      h: rowH,
      fontSize: 8.5,
      bold: true,
      color: CHARCOAL,
      align: 'right',
      valign: 'middle',
    });
  });
  if (notes) {
    slide.addText(notes, { x: x + 0.15, y: y + h - 0.45, w: w - 0.3, h: 0.4, fontSize: 7.5, italic: true, color: MUTED, valign: 'top' });
  }
}

export async function generatePptx(om, outputPath) {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'OM', width: 10, height: 7.5 });
  pptx.layout = 'OM';

  const propertyName = om.cover.propertyName;

  // ---------- Slide: Cover ----------
  const cover = pptx.addSlide();
  cover.background = { color: NAVY };
  const coverPhoto = imagePathIfDrawable(om.id, om.cover.coverPhoto);
  if (coverPhoto) {
    cover.addImage({ path: coverPhoto, x: 0, y: 0, w: 10, h: 4.2, sizing: { type: 'cover', w: 10, h: 4.2 } });
    cover.addShape('rect', { x: 0, y: 0, w: 10, h: 4.2, fill: { color: NAVY, transparency: 65 } });
  }
  cover.addShape('rect', { x: 0, y: 4.2, w: 10, h: 3.3, fill: { color: 'FFFFFF' } });
  cover.addText('OFFERING MEMORANDUM', { x: 0.5, y: 3.3, w: 9, h: 0.4, fontSize: 13, bold: true, color: GOLD });
  cover.addText(propertyName || 'Untitled Property', {
    x: 0.5,
    y: 3.6,
    w: 9,
    h: 0.7,
    fontSize: 30,
    bold: true,
    color: 'FFFFFF',
  });
  const addressLine = [om.cover.formattedAddress || om.cover.addressLine1, [om.cover.city, om.cover.state].filter(Boolean).join(', '), om.cover.zip]
    .filter(Boolean)
    .join('  •  ');
  cover.addText(addressLine, { x: 0.5, y: 4.5, w: 9, h: 0.4, fontSize: 14, color: CHARCOAL });
  if (om.cover.tagline) {
    cover.addText(om.cover.tagline, { x: 0.5, y: 4.85, w: 9, h: 0.4, fontSize: 13, italic: true, color: MUTED });
  }
  if (om.cover.propertyType) {
    cover.addText(om.cover.propertyType.toUpperCase(), { x: 0.5, y: 5.3, w: 9, h: 0.3, fontSize: 11, bold: true, color: NAVY });
  }
  statBoxes(
    cover,
    [
      ['Offering Price', formatCurrency(om.executiveSummary.offeringPrice)],
      ['Cap Rate', formatPercent(om.executiveSummary.capRate)],
      ['NOI', formatCurrency(om.executiveSummary.noi)],
      ['Square Footage', om.overview.squareFootage ? `${formatNumber(om.overview.squareFootage)} SF` : '—'],
    ],
    6.0
  );

  // ---------- Slide: Table of Contents ----------
  const tocEntries = [
    'Property Overview',
    'Executive Summary',
    'Market Overview',
    'Financials',
    'Sales Comparables',
    'Rent Comparables',
    'Location & Amenities',
    'Offering Procedures',
    'Meet the Team',
  ];
  const toc = pptx.addSlide();
  addSectionHeader(toc, propertyName, 'Table of Contents');
  toc.addText('Table of Contents', { x: 0.3, y: 0.9, w: 9.4, h: 0.5, fontSize: 22, bold: true, color: NAVY });
  toc.addShape('rect', { x: 0.3, y: 1.45, w: 0.6, h: 0.03, fill: { color: GOLD } });
  tocEntries.forEach((label, i) => {
    const y = 1.75 + i * 0.5;
    toc.addText(String(i + 1).padStart(2, '0'), { x: 0.3, y, w: 0.4, h: 0.4, fontSize: 11, bold: true, color: NAVY, valign: 'middle' });
    toc.addText(label, { x: 0.75, y, w: 8.5, h: 0.4, fontSize: 13, bold: true, color: CHARCOAL, valign: 'middle' });
    toc.addShape('line', { x: 0.3, y: y + 0.42, w: 9.1, h: 0, line: { color: 'E7E9EC', width: 1 } });
  });

  // ---------- Slide: Property Overview ----------
  const overview = pptx.addSlide();
  addSectionHeader(overview, propertyName, 'Property Overview');
  const isMultifamily = om.cover.propertyType === 'Multifamily';
  const overviewStats = [
    ['Year Built', om.overview.yearBuilt || '—'],
    ['Square Footage', om.overview.squareFootage ? `${formatNumber(om.overview.squareFootage)} SF` : '—'],
    ['Lot Size', om.overview.lotSize || '—'],
  ];
  const overviewStats2 = [];
  if (isMultifamily) overviewStats2.push(['Units', om.overview.units || '—']);
  overviewStats2.push(['Occupancy', om.overview.occupancyPct ? formatPercent(om.overview.occupancyPct) : '—']);
  overviewStats2.push(['Zoning', om.overview.zoning || '—']);
  overviewStats2.push(['Parking', om.overview.parking || '—']);
  statBoxes(overview, overviewStats, 1.0);
  statBoxes(overview, overviewStats2, 2.05);
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
  const overviewPhotos = (om.overview.photos || []).map((f) => imagePathIfDrawable(om.id, f)).filter(Boolean).slice(0, 4);
  if (overviewPhotos.length) {
    const pw = (9.4 - (overviewPhotos.length - 1) * 0.15) / overviewPhotos.length;
    overviewPhotos.forEach((p, i) => {
      overview.addImage({ path: p, x: 0.3 + i * (pw + 0.15), y: 5.9, w: pw, h: 1.1, sizing: { type: 'cover', w: pw, h: 1.1 } });
    });
  }

  // ---------- Slide: Executive Summary ----------
  const exec = pptx.addSlide();
  addSectionHeader(exec, propertyName, 'Executive Summary');
  const bigStats = [
    ['Offering Price', formatCurrency(om.executiveSummary.offeringPrice)],
    ['Cap Rate', formatPercent(om.executiveSummary.capRate)],
    ['NOI', formatCurrency(om.executiveSummary.noi)],
  ];
  bigStats.forEach(([label, value], i) => {
    const y = 1.0 + i * 1.05;
    exec.addShape('roundRect', { x: 0.3, y, w: 2.6, h: 0.9, fill: { color: NAVY }, rectRadius: 0.06 });
    exec.addShape('rect', { x: 0.3, y, w: 0.06, h: 0.9, fill: { color: GOLD } });
    exec.addText(label.toUpperCase(), { x: 0.5, y: y + 0.1, w: 2.3, h: 0.25, fontSize: 8, color: 'CCCCCC' });
    exec.addText(value, { x: 0.5, y: y + 0.38, w: 2.3, h: 0.4, fontSize: 16, bold: true, color: 'FFFFFF' });
  });
  exec.addText('Investment Overview', { x: 3.2, y: 1.0, w: 6.5, h: 0.3, fontSize: 12, bold: true, color: NAVY });
  exec.addText(om.executiveSummary.narrative || 'No summary provided.', {
    x: 3.2,
    y: 1.35,
    w: 6.5,
    h: 2.0,
    fontSize: 10,
    color: CHARCOAL,
    valign: 'top',
  });
  const highlights = (om.executiveSummary.highlights || []).filter(Boolean);
  if (highlights.length) {
    exec.addText('Investment Highlights', { x: 3.2, y: 3.5, w: 6.5, h: 0.3, fontSize: 12, bold: true, color: NAVY });
    exec.addText(
      highlights.map((h) => ({ text: h, options: { bullet: { code: '2022', color: GOLD }, breakLine: true, fontSize: 10, color: CHARCOAL } })),
      { x: 3.2, y: 3.85, w: 6.5, h: 3.0, valign: 'top' }
    );
  }

  // ---------- Slide: Market Overview ----------
  const market = pptx.addSlide();
  addSectionHeader(market, propertyName, 'Market Overview');
  market.addText(om.market.marketName || 'Market', { x: 0.3, y: 0.85, w: 9.4, h: 0.35, fontSize: 16, bold: true, color: NAVY });
  market.addText(om.market.narrative || 'No market narrative provided.', {
    x: 0.3,
    y: 1.25,
    w: 9.4,
    h: 1.3,
    fontSize: 10,
    color: CHARCOAL,
    valign: 'top',
  });
  market.addText('Demographics', { x: 0.3, y: 2.65, w: 9.4, h: 0.3, fontSize: 12, bold: true, color: NAVY });
  statBoxes(
    market,
    [
      ['Population', om.market.population ? formatNumber(om.market.population) : '—'],
      ['Median Income', om.market.medianIncome ? formatCurrency(om.market.medianIncome) : '—'],
      ['Daytime Population', om.market.daytimePopulation ? formatNumber(om.market.daytimePopulation) : '—'],
      ['Traffic Count', om.market.trafficCount ? `${formatNumber(om.market.trafficCount)} VPD` : '—'],
    ],
    3.0
  );
  market.addText('Submarket Trends', { x: 0.3, y: 4.15, w: 9.4, h: 0.3, fontSize: 12, bold: true, color: NAVY });
  statBoxes(
    market,
    [
      ['Submarket Vacancy', om.market.submarketVacancyRate ? formatPercent(om.market.submarketVacancyRate) : '—'],
      ['Asking Rents', om.market.askingRents || '—'],
      ['Absorption Trends', om.market.absorptionTrends || '—'],
    ],
    4.5
  );

  // ---------- Slides: Financials ----------
  const lineItems = om.financials.lineItems || [];
  const totalIncome = lineItems.reduce((s, li) => s + num(li.income), 0);
  const totalExpense = lineItems.reduce((s, li) => s + num(li.expense), 0);
  const t12Chunks = chunk(lineItems, 10);
  t12Chunks.forEach((rows, idx) => {
    const fin = pptx.addSlide();
    addSectionHeader(fin, propertyName, idx === 0 ? 'Financials' : 'Financials (Cont.)');
    if (idx === 0) {
      statBoxes(
        fin,
        [
          ['Asking Price', formatCurrency(om.executiveSummary.offeringPrice)],
          ['NOI', formatCurrency(om.executiveSummary.noi)],
          ['Cap Rate', formatPercent(om.executiveSummary.capRate)],
          ['Gross Income', formatCurrency(om.financials.grossIncome)],
          ['Operating Expenses', formatCurrency(om.financials.operatingExpenses)],
        ],
        1.0
      );
    }
    const tableY = idx === 0 ? 2.2 : 1.0;
    fin.addText('Trailing 12-Month Income & Expenses (T12)', { x: 0.3, y: tableY - 0.35, w: 9.4, h: 0.3, fontSize: 11, bold: true, color: NAVY });
    if (lineItems.length) {
      const isLast = idx === t12Chunks.length - 1;
      const tableRows = rows.map((li) => [li.label, formatCurrency(li.income), formatCurrency(li.expense)]);
      const finalRows = isLast ? [...tableRows, ['Total', formatCurrency(totalIncome), formatCurrency(totalExpense)]] : tableRows;
      table(fin, ['Line Item', 'Income', 'Expense'], finalRows, tableY, [4.7, 2.35, 2.35], {
        totalRowIndexes: isLast ? [finalRows.length - 1] : [],
      });
    } else {
      fin.addText('No T12 line items provided.', { x: 0.3, y: tableY, w: 9.4, h: 0.4, fontSize: 11, color: MUTED });
    }
  });

  const rentRoll = om.financials.rentRoll || [];
  if (rentRoll.length) {
    const totalMonthly = rentRoll.reduce((s, r) => s + num(r.monthlyRent), 0);
    const totalAnnual = rentRoll.reduce((s, r) => s + num(r.annualRent), 0);
    const rollChunks = chunk(rentRoll, 12);
    rollChunks.forEach((rows, idx) => {
      const slide = pptx.addSlide();
      addSectionHeader(slide, propertyName, idx === 0 ? 'Rent Roll' : 'Rent Roll (Cont.)');
      const isLast = idx === rollChunks.length - 1;
      const tableRows = rows.map((r) => [
        r.tenantName,
        r.suite,
        r.sf,
        r.leaseStart,
        r.leaseEnd,
        formatCurrency(r.monthlyRent),
        formatCurrency(r.annualRent),
        r.leaseType,
      ]);
      const finalRows = isLast
        ? [...tableRows, ['Total', '', '', '', '', formatCurrency(totalMonthly), formatCurrency(totalAnnual), '']]
        : tableRows;
      table(
        slide,
        ['Tenant', 'Suite', 'SF', 'Lease Start', 'Lease End', 'Monthly Rent', 'Annual Rent', 'Lease Type'],
        finalRows,
        1.0,
        [1.8, 0.9, 0.8, 1.1, 1.1, 1.3, 1.3, 1.1],
        { totalRowIndexes: isLast ? [finalRows.length - 1] : [] }
      );
    });
  }

  const cashFlows = om.financials.proForma?.cashFlows || [];
  const a = om.financials.proForma?.assumptions || {};
  const hasAssumptions = Object.values(a).some(Boolean);
  if (hasAssumptions || cashFlows.length) {
    const cfChunks = chunk(cashFlows, 10);
    cfChunks.forEach((rows, idx) => {
      const slide = pptx.addSlide();
      addSectionHeader(slide, propertyName, idx === 0 ? 'Pro Forma' : 'Pro Forma (Cont.)');
      let tableY = 1.0;
      if (idx === 0) {
        slide.addText('Cash Flow Assumptions', { x: 0.3, y: 0.85, w: 9.4, h: 0.3, fontSize: 11, bold: true, color: NAVY });
        statBoxes(
          slide,
          [
            ['Rent Growth', a.rentGrowthPct ? formatPercent(a.rentGrowthPct) : '—'],
            ['Expense Growth', a.expenseGrowthPct ? formatPercent(a.expenseGrowthPct) : '—'],
            ['Vacancy', a.vacancyPct ? formatPercent(a.vacancyPct) : '—'],
            ['Hold Period', a.holdPeriodYears ? `${a.holdPeriodYears} yrs` : '—'],
            ['Exit Cap Rate', a.exitCapRate ? formatPercent(a.exitCapRate) : '—'],
          ],
          1.2
        );
        tableY = 2.4;
      }
      if (cashFlows.length) {
        slide.addText('Projected Cash Flow', { x: 0.3, y: tableY - 0.35, w: 9.4, h: 0.3, fontSize: 11, bold: true, color: NAVY });
        const tableRows = rows.map((r) => [r.year, formatCurrency(r.grossIncome), formatCurrency(r.vacancyLoss), formatCurrency(r.operatingExpenses), formatCurrency(r.noi), formatCurrency(r.cashFlow)]);
        table(slide, ['Year', 'Gross Income', 'Vacancy Loss', 'Op. Expenses', 'NOI', 'Cash Flow'], tableRows, tableY, [1.2, 1.7, 1.6, 1.7, 1.4, 1.8]);
      } else if (idx === 0) {
        slide.addText('No projected cash flow schedule provided.', { x: 0.3, y: tableY, w: 9.4, h: 0.4, fontSize: 11, color: MUTED });
      }
    });
  }

  // ---------- Slides: Sales Comps ----------
  const salesComps = om.salesComps || [];
  if (!salesComps.length) {
    const slide = pptx.addSlide();
    addSectionHeader(slide, propertyName, 'Sales Comparables');
    slide.addText('No sales comparables provided.', { x: 0.3, y: 1.0, w: 9.4, h: 0.4, fontSize: 11, color: MUTED });
  } else {
    chunk(salesComps, 2).forEach((rows, idx) => {
      const slide = pptx.addSlide();
      addSectionHeader(slide, propertyName, idx === 0 ? 'Sales Comparables' : 'Sales Comparables (Cont.)');
      rows.forEach((c, i) => {
        const x = 0.3 + i * 4.85;
        addCard(
          slide,
          x,
          1.0,
          4.7,
          5.8,
          c.address || 'Comp',
          [
            ['Sale Date', formatMonthYear(c.saleDate)],
            ['Sale Price', formatCurrency(c.salePrice)],
            ['Price / SF', formatCurrency(c.pricePerSF)],
            ['Cap Rate', formatPercent(c.capRate)],
            ['Square Feet', c.squareFeet ? `${formatNumber(c.squareFeet)} SF` : '—'],
          ],
          c.notes
        );
      });
    });
  }

  // ---------- Slides: Rent Comps ----------
  const rentComps = om.rentComps || [];
  if (!rentComps.length) {
    const slide = pptx.addSlide();
    addSectionHeader(slide, propertyName, 'Rent Comparables');
    slide.addText('No rent comparables provided.', { x: 0.3, y: 1.0, w: 9.4, h: 0.4, fontSize: 11, color: MUTED });
  } else {
    chunk(rentComps, 4).forEach((rows, idx) => {
      const slide = pptx.addSlide();
      addSectionHeader(slide, propertyName, idx === 0 ? 'Rent Comparables' : 'Rent Comparables (Cont.)');
      rows.forEach((c, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 0.3 + col * 4.85;
        const y = 1.0 + row * 3.05;
        addCard(slide, x, y, 4.7, 2.9, escOrDash(c.address), [
          ['Tenant', escOrDash(c.tenant)],
          ['Rent / SF', escOrDash(c.rentPerSF)],
          ['Lease Term', escOrDash(c.leaseTerm)],
          ['Square Feet', c.squareFeet ? `${formatNumber(c.squareFeet)} SF` : '—'],
          ['Lease Type', c.leaseType || LEASE_TYPES_NONE],
        ]);
      });
    });
  }

  // ---------- Slide: Location & Amenities ----------
  const locSlide = pptx.addSlide();
  addSectionHeader(locSlide, propertyName, 'Location & Amenities');
  const addressLine2 = [om.cover.formattedAddress || om.cover.addressLine1, [om.cover.city, om.cover.state].filter(Boolean).join(', '), om.cover.zip]
    .filter(Boolean)
    .join(', ');
  locSlide.addText('Location & Amenities', { x: 0.3, y: 0.85, w: 9.4, h: 0.4, fontSize: 18, bold: true, color: NAVY });
  locSlide.addText(addressLine2 || 'Address not provided', { x: 0.3, y: 1.25, w: 9.4, h: 0.3, fontSize: 11, color: MUTED });
  const mapBuf = await fetchStaticMapBuffer(om.cover);
  if (mapBuf) {
    locSlide.addImage({ data: `image/png;base64,${mapBuf.toString('base64')}`, x: 0.3, y: 1.7, w: 9.4, h: 5.4, sizing: { type: 'cover', w: 9.4, h: 5.4 } });
  } else {
    locSlide.addShape('rect', { x: 0.3, y: 1.7, w: 9.4, h: 5.4, fill: { color: LIGHT_GRAY } });
    locSlide.addText('Map preview unavailable. Configure GOOGLE_MAPS_API_KEY and a valid property address.', {
      x: 1.3,
      y: 4.0,
      w: 7.4,
      h: 0.6,
      fontSize: 10,
      color: MUTED,
      align: 'center',
    });
  }

  // ---------- Slide: Offering Procedures ----------
  const proc = pptx.addSlide();
  addSectionHeader(proc, propertyName, 'Offering Procedures');
  const p = om.offeringProcedures || {};
  proc.addText('Offering Procedures', { x: 0.3, y: 0.85, w: 9.4, h: 0.4, fontSize: 18, bold: true, color: NAVY });
  statBoxes(proc, [['Offer Deadline', p.offerDeadline ? formatMonthYear(p.offerDeadline) : 'To be determined']], 1.35);
  const procBlocks = [
    ['Submitting a Letter of Intent', p.loiInstructions || 'Contact the brokerage team listed in this Offering Memorandum to submit a Letter of Intent.'],
    ['Scheduling a Property Tour', p.tourInstructions || 'Contact the brokerage team to arrange a property tour.'],
    ['Data Room Access', p.dataRoomInstructions || 'Data room access details will be provided upon execution of a confidentiality agreement.'],
  ];
  procBlocks.forEach(([title, body], i) => {
    const y = 2.5 + i * 1.45;
    proc.addText(title, { x: 0.3, y, w: 9.4, h: 0.3, fontSize: 12, bold: true, color: NAVY });
    proc.addText(body, { x: 0.3, y: y + 0.32, w: 9.4, h: 1.0, fontSize: 10, color: CHARCOAL, valign: 'top' });
  });

  // ---------- Slides: Meet the Team ----------
  const team = om.team || [];
  if (!team.length) {
    const slide = pptx.addSlide();
    addSectionHeader(slide, propertyName, 'Meet the Team');
    slide.addText('No team members provided.', { x: 0.3, y: 1.0, w: 9.4, h: 0.4, fontSize: 11, color: MUTED });
  } else {
    team.forEach((m) => {
      const slide = pptx.addSlide();
      addSectionHeader(slide, propertyName, 'Meet the Team');
      const headshot = imagePathIfDrawable(om.id, m.headshot);
      slide.addShape('rect', { x: 0.3, y: 1.0, w: 3.76, h: 5.7, fill: { color: LIGHT_GRAY } });
      if (headshot) {
        slide.addImage({ path: headshot, x: 0.3, y: 1.0, w: 3.76, h: 5.7, sizing: { type: 'cover', w: 3.76, h: 5.7 } });
      }
      slide.addShape('rect', { x: 0.3, y: 1.0, w: 0.06, h: 5.7, fill: { color: GOLD } });
      slide.addText(m.name || '—', { x: 4.3, y: 1.1, w: 5.4, h: 0.5, fontSize: 22, bold: true, color: NAVY });
      slide.addText(m.title || '', { x: 4.3, y: 1.6, w: 5.4, h: 0.35, fontSize: 12, color: MUTED });
      slide.addText([m.phone, m.email].filter(Boolean).join('   •   '), {
        x: 4.3,
        y: 2.05,
        w: 5.4,
        h: 0.3,
        fontSize: 10,
        color: CHARCOAL,
      });
      slide.addShape('line', { x: 4.3, y: 2.4, w: 5.4, h: 0, line: { color: 'E7E9EC', width: 1 } });
      slide.addText(m.bio || 'No bio provided.', { x: 4.3, y: 2.6, w: 5.4, h: 3.8, fontSize: 10, color: CHARCOAL, valign: 'top' });
    });
  }

  // ---------- Slide: Back Cover ----------
  const back = pptx.addSlide();
  back.background = { color: NAVY };
  const brokerLogo = imagePathIfDrawable(om.id, om.cover.brokerLogo);
  if (brokerLogo) {
    back.addImage({ path: brokerLogo, x: 3.5, y: 2.4, w: 3, h: 1.2, sizing: { type: 'contain', w: 3, h: 1.2 } });
  } else {
    back.addText(propertyName || 'Brokerage', { x: 1, y: 2.7, w: 8, h: 0.6, fontSize: 20, bold: true, color: 'FFFFFF', align: 'center' });
  }
  back.addShape('rect', { x: 4.75, y: 3.8, w: 0.5, h: 0.03, fill: { color: GOLD } });
  const primary = team[0];
  if (primary) {
    const lines = [primary.name, primary.title, [primary.phone, primary.email].filter(Boolean).join('   •   ')].filter(Boolean);
    lines.forEach((line, i) => {
      back.addText(line, {
        x: 1,
        y: 4.1 + i * 0.35,
        w: 8,
        h: 0.35,
        fontSize: i === 0 ? 14 : 11,
        bold: i === 0,
        color: i === 0 ? 'FFFFFF' : 'CCCCCC',
        align: 'center',
      });
    });
  }
  back.addText(
    'This Offering Memorandum is confidential and is intended solely for the use of the recipient to evaluate the potential acquisition of the property described herein. It shall not be copied, reproduced, or distributed to any other party at any time without the prior written consent of the broker of record. The information contained herein has been obtained from sources deemed reliable but is not guaranteed as to accuracy or completeness, and is subject to errors, omissions, change of price, prior sale, or withdrawal without notice.',
    { x: 1.5, y: 5.6, w: 7, h: 1.4, fontSize: 7, color: '999999', align: 'center', valign: 'top' }
  );

  await pptx.writeFile({ fileName: outputPath });
  return outputPath;
}
