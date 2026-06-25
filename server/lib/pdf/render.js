import puppeteer from 'puppeteer';
import { buildDocument, buildTheme, footerHtml } from './templates/layout.js';
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
import * as valuation from './templates/valuation.js';
import * as recommendation from './templates/recommendation.js';
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

const BOV_CONTENT_SECTIONS = [
  { label: 'Subject Property', mod: overview, flow: true },
  { label: 'Valuation Methodology', mod: valuation, flow: true },
  { label: 'Comparable Sales Analysis', mod: salesComps },
  { label: 'Broker Recommendation', mod: recommendation, flow: true },
  { label: 'Meet the Team', mod: team },
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
    sharedBrowser = await puppeteer.launch({ headless: true });
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
// Flow sections (flow:true) share printed pages naturally via CSS; full-page sections
// each force their own page. TOC lists section labels without page numbers.
function assembleMultiPageDocument(om, renderCtx, contentSections) {
  const coverPages = cover.buildPages(om, renderCtx);

  // Collect only sections that have content
  const activeSections = [];
  for (const section of contentSections) {
    const pages = section.mod.buildPages(om, renderCtx);
    if (!pages.length) continue;
    activeSections.push({ ...section, pages });
  }

  // TOC entries: section number + label, no page numbers (not predictable with flow layout)
  const tocEntries = activeSections.map((s, i) => ({ label: s.label, number: i + 1 }));
  const tocPages = toc.buildPages(om, tocEntries);
  const backCoverPages = backCover.buildPages(om, renderCtx);

  // Build content: consecutive flow sections are wrapped in a pdf-flow-body so they
  // share a printed page; full-page sections remain as individual pageShell sections.
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

export async function generatePdf(om, outputPath, ctxOverrides = {}) {
  const theme = buildTheme(om.branding);
  const [streetMapUri, regionalMapUri] = await Promise.all([fetchStreetMapDataUri(om.cover), fetchRegionalMapDataUri(om.cover)]);
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
    console.log('[render] brokerLogo raw:', JSON.stringify(om.cover.brokerLogo));
    console.log('[render] brokerLogoUri length:', renderCtx.brokerLogoUri?.length ?? 'null');
    console.log('[render] hasLogo:', Boolean(renderCtx.brokerLogoUri));
    bodyHtml = onePager.buildPages(om, renderCtx).join('\n');
  } else if (docType === 'bov') {
    bodyHtml = assembleMultiPageDocument(om, renderCtx, BOV_CONTENT_SECTIONS);
  } else {
    bodyHtml = assembleMultiPageDocument(om, renderCtx, OM_CONTENT_SECTIONS);
  }

  const documentHtml = buildDocument(bodyHtml, theme);

  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    // Match the viewport to the print page at a 2x device scale so raster images
    // (hero photos, headshots, logos) sample at higher resolution instead of being
    // downscaled to a 1x layout box before Chromium rasterizes the PDF.
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
