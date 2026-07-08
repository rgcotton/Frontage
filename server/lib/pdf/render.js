import puppeteer from 'puppeteer';
import { buildDocument, footerHtml, resolveTheme } from './templates/layout.js';
import { toDataUri } from './helpers/images.js';
import { fetchStreetMapDataUri, fetchRegionalMapDataUri } from '../maps.js';
import * as cover from './templates/cover.js';
import * as toc from './templates/toc.js';
import * as overview from './templates/overview.js';
import * as executiveSummary from './templates/executiveSummary.js';
import * as market from './templates/market.js';
import * as financials from './templates/financials.js';
import * as salesComps from './templates/salesComps.js';
import * as rentComps from './templates/rentComps.js';
import * as locationMap from './templates/locationMap.js';
import * as driveTimePois from './templates/driveTimePois.js';
import * as offeringProcedures from './templates/offeringProcedures.js';
import * as team from './templates/team.js';
import * as backCover from './templates/backCover.js';
import * as onePager from './templates/onePager.js';

// flow:true = sections that emit flowSection() HTML — they share printed pages.
// flow omitted = sections that emit pageShell() HTML — each gets its own forced page.
const OM_CONTENT_SECTIONS = [
  { label: 'Property Overview', mod: overview, flow: true },
  { label: 'Executive Summary', mod: executiveSummary, flow: true },
  { label: 'Market Overview', mod: market, flow: true },
  { label: 'Financials', mod: financials, flow: true },
  { label: 'Sales Comparables', mod: salesComps, flow: true },
  { label: 'Rent Comparables', mod: rentComps, flow: true },
  { label: 'Location & Amenities', mod: locationMap, flow: true },
  { label: 'Drive Times & Points of Interest', mod: driveTimePois, flow: true },
  { label: 'Offering Procedures', mod: offeringProcedures, flow: true },
  { label: 'Meet the Team', mod: team, flow: true },
];

function injectFooter(pageHtml, footer) {
  const idx = pageHtml.lastIndexOf('</section>');
  if (idx === -1) return pageHtml;
  return pageHtml.slice(0, idx) + footer + pageHtml.slice(idx);
}

let sharedBrowser = null;
export async function getBrowser() {
  if (sharedBrowser && !sharedBrowser.connected) {
    sharedBrowser = null;
  }
  if (!sharedBrowser) {
    sharedBrowser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  }
  return sharedBrowser;
}

export async function closeBrowser() {
  if (sharedBrowser) {
    await sharedBrowser.close();
    sharedBrowser = null;
  }
}

// Assembles cover + TOC + content sections + back cover.
function assembleMultiPageDocument(om, renderCtx, contentSections) {
  const coverPages = cover.buildPages(om, renderCtx);
  const activeSections = [];
  for (const section of contentSections) {
    const pages = section.mod.buildPages(om, renderCtx);
    if (!pages.length) continue;
    activeSections.push({ ...section, pages });
  }
  const tocEntries = activeSections.map((s, i) => ({ label: s.label, number: i + 1 }));
  const tocPages = toc.buildPages(om, tocEntries, renderCtx);
  const backCoverPages = backCover.buildPages(om, renderCtx);
  const parts = [...coverPages, ...tocPages];
  let flowBuffer = [];
  const flushFlow = () => {
    if (flowBuffer.length) {
      parts.push(`<div class="pdf-flow-body">${flowBuffer.join('\n')}</div>`);
      flowBuffer = [];
    }
  };
  for (const section of activeSections) {
    if (section.flow) {
      flowBuffer.push(...section.pages);
    } else {
      flushFlow();
      for (const pageHtml of section.pages) {
        parts.push(injectFooter(pageHtml, footerHtml(om.cover.propertyName)));
      }
    }
  }
  flushFlow();
  parts.push(...backCoverPages);
  return parts.join('\n');
}

// ─── One Pager two-pass layout ───────────────────────────────────────────────

const PX = onePager.PX_PER_IN; // 96
const AVAILABLE_BOTTOM_PX = (11 - 0.45 - 4.4) * PX; // (FOOTER_TOP - STATS_TOP) * 96 = 590.4px
const LEFT_COL_PAD_PX = 2 * 0.25 * PX;               // top + bottom column padding = 48px
const GAP_PX = 0.1 * PX;                              // gap between cards = 9.6px
const CARD_OVERHEAD_PX = 2 * 0.14 * PX + 22;          // card top+bottom padding + header ≈ 48.9px

async function measureOnePagerCards(page, html) {
  await page.setViewport({ width: 816, height: 4000, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  return page.evaluate(() => {
    const result = {};
    document.querySelectorAll('[data-measure]').forEach((el) => {
      result[el.dataset.measure] = el.scrollHeight;
    });
    return result;
  });
}

function computeOnePagerRenderParams(measurements, naturalStatsH, highlights, pois) {
  const statsH_px = naturalStatsH * PX;
  let dsH = measurements['deal-summary'] || 0;
  let hlH = measurements['highlights'] || 0;
  let dtH = measurements['drive-times'] || 0;

  const activeCount = [dsH, hlH, dtH].filter((h) => h > 0).length;
  const gapTotal = activeCount * GAP_PX;
  const naturalCardTotal = dsH + hlH + dtH;
  const naturalScaleable = statsH_px + LEFT_COL_PAD_PX + gapTotal + naturalCardTotal;

  if (naturalScaleable <= AVAILABLE_BOTTOM_PX) {
    // ── Extra space: distribute proportionally across multi-row cards (Option A) ──
    const bottomSectionH = AVAILABLE_BOTTOM_PX - statsH_px;
    const availableForCards = bottomSectionH - LEFT_COL_PAD_PX - gapTotal;
    const extraForCards = Math.max(0, availableForCards - naturalCardTotal);

    // Single-row: only 1 highlight item OR only 1 POI → use flex-start, give extra to spacer
    const hlSingle = highlights.length <= 1;
    const dtSingle = pois.length <= 1;

    // Multi-row cards participate in proportional distribution
    const multiRows = [];
    if (dsH > 0) multiRows.push({ key: 'deal-summary', h: dsH });
    if (hlH > 0 && !hlSingle) multiRows.push({ key: 'highlights', h: hlH });
    if (dtH > 0 && !dtSingle) multiRows.push({ key: 'drive-times', h: dtH });
    const multiTotal = multiRows.reduce((s, c) => s + c.h, 0);

    const cardBases = {};
    const cardJustify = {};

    if (dsH > 0) {
      const share = multiTotal > 0 ? (dsH / multiTotal) * extraForCards : 0;
      cardBases['deal-summary'] = dsH + share;
      cardJustify['deal-summary'] = 'flex-start';
    }
    if (hlH > 0) {
      if (hlSingle) {
        cardBases['highlights'] = hlH;
        cardJustify['highlights'] = 'flex-start';
      } else {
        const share = multiTotal > 0 ? (hlH / multiTotal) * extraForCards : 0;
        cardBases['highlights'] = hlH + share;
        cardJustify['highlights'] = 'space-between';
      }
    }
    if (dtH > 0) {
      if (dtSingle) {
        cardBases['drive-times'] = dtH;
        cardJustify['drive-times'] = 'flex-start';
      } else {
        const share = multiTotal > 0 ? (dtH / multiTotal) * extraForCards : 0;
        cardBases['drive-times'] = dtH + share;
        cardJustify['drive-times'] = 'space-between';
      }
    }

    return { scaleFactor: 1, statsHOverride: naturalStatsH, cardBases, cardJustify };
  }

  // ── Too tall: scale down, dropping items if scale would fall below 0.8 ──
  let trimHighlights = highlights.slice();
  let trimPois = pois.slice();
  let curHlH = hlH;
  let curDtH = dtH;

  const computeScale = (hH, dH) => {
    const n = [dsH, hH, dH].filter((h) => h > 0).length;
    const g = n * GAP_PX;
    return AVAILABLE_BOTTOM_PX / (statsH_px + LEFT_COL_PAD_PX + g + dsH + hH + dH);
  };

  let scaleFactor = computeScale(curHlH, curDtH);

  while (scaleFactor < 0.8 && (trimHighlights.length > 1 || trimPois.length > 1)) {
    if (trimHighlights.length >= trimPois.length && trimHighlights.length > 1) {
      const perItem = Math.max(15, (curHlH - CARD_OVERHEAD_PX) / trimHighlights.length);
      curHlH = Math.max(CARD_OVERHEAD_PX, curHlH - perItem);
      trimHighlights.pop();
    } else if (trimPois.length > 1) {
      const perItem = Math.max(15, (curDtH - CARD_OVERHEAD_PX) / trimPois.length);
      curDtH = Math.max(CARD_OVERHEAD_PX, curDtH - perItem);
      trimPois.pop();
    } else {
      break;
    }
    scaleFactor = computeScale(curHlH, curDtH);
  }

  scaleFactor = Math.max(0.8, scaleFactor);

  return {
    scaleFactor,
    statsHOverride: naturalStatsH * scaleFactor,
    cardBases: {},
    cardJustify: {},
    highlightsOverride: trimHighlights,
    poisOverride: trimPois,
  };
}

// ─── Main PDF export ──────────────────────────────────────────────────────────

export async function generatePdf(om, outputPath, ctxOverrides = {}) {
  const theme = resolveTheme(om.branding);
  const [streetMapUri, regionalMapUri] = await Promise.all([
    fetchStreetMapDataUri(om.cover),
    fetchRegionalMapDataUri(om.cover),
  ]);
  const renderCtx = {
    theme,
    coverPhotoUri: toDataUri(om.id, om.cover.coverPhoto),
    brokerLogoUri: toDataUri(om.id, om.cover.brokerLogo),
    streetMapUri,
    regionalMapUri,
    ...ctxOverrides,
  };

  const docType = om.docType || 'om';
  let bodyHtml;

  if (docType === 'onePager') {
    const browser = await getBrowser();
    const page = await browser.newPage();
    try {
      // Pass 1: measure natural card heights
      const measureHtml = onePager.buildMeasurementHtml(om, renderCtx);
      const measurements = await measureOnePagerCards(page, measureHtml);

      // Derive naturalStatsH using the same formula as buildPages
      const rawStatValues = [
        om.executiveSummary?.offeringPrice,
        om.executiveSummary?.capRate,
        om.executiveSummary?.noi,
        om.overview?.squareFootage,
        om.overview?.occupancyPct,
      ];
      const statCount = rawStatValues.filter(Boolean).length;
      const naturalStatsH = statCount === 0 ? 0 : statCount <= 2 ? 0.8 : 0.95;

      const cover = om.cover || {};
      const highlights = cover.onePagerHighlights
        ? cover.onePagerHighlights.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 4)
        : (om.executiveSummary?.highlights || []).filter(Boolean).slice(0, 4);
      const pois = (om.driveTimePois || []).slice(0, 4);

      const renderParams = computeOnePagerRenderParams(measurements, naturalStatsH, highlights, pois);

      // Pass 2: render final PDF with computed params
      await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });
      const finalHtml = buildDocument(onePager.buildPages(om, renderCtx, renderParams).join('\n'), theme);
      await page.setContent(finalHtml, { waitUntil: 'load' });
      await page.pdf({
        path: outputPath,
        width: '8.5in',
        height: '11in',
        printBackground: true,
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
      });
    } finally {
      await page.close();
    }
    return outputPath;
  }

  bodyHtml = assembleMultiPageDocument(om, renderCtx, OM_CONTENT_SECTIONS);
  const documentHtml = buildDocument(bodyHtml, theme);
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });
    await page.setContent(documentHtml, { waitUntil: 'load' });
    await page.pdf({
      path: outputPath,
      width: '8.5in',
      height: '11in',
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
  } finally {
    await page.close();
  }
  return outputPath;
}
