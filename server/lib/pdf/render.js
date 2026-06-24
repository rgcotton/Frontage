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

const OM_CONTENT_SECTIONS = [
  { label: 'Property Overview', mod: overview },
  { label: 'Executive Summary', mod: executiveSummary },
  { label: 'Market Overview', mod: market },
  { label: 'Financials', mod: financials },
  { label: 'Sales Comparables', mod: salesComps },
  { label: 'Rent Comparables', mod: rentComps },
  { label: 'Location & Amenities', mod: locationMap },
  { label: 'Drive Times & Points of Interest', mod: driveTimePois },
  { label: 'Offering Procedures', mod: offeringProcedures },
  { label: 'Meet the Team', mod: team },
];

const BOV_CONTENT_SECTIONS = [
  { label: 'Subject Property', mod: overview },
  { label: 'Valuation Methodology', mod: valuation },
  { label: 'Comparable Sales Analysis', mod: salesComps },
  { label: 'Broker Recommendation', mod: recommendation },
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

// Assembles the cover + table of contents + content sections + back cover document
// shared by the full 'om' and 'bov' document types. Returns the joined page HTML.
function assembleMultiPageDocument(om, renderCtx, contentSections) {
  const coverPages = cover.buildPages(om, renderCtx);

  let runningPage = 2; // page 1 = cover, page 2 = TOC
  const tocEntries = [];
  const sectionPages = [];
  for (const section of contentSections) {
    const pages = section.mod.buildPages(om, renderCtx);
    if (!pages.length) continue; // e.g. Drive Times with zero POIs added -- no page, no TOC entry
    tocEntries.push({ label: section.label, startPage: runningPage + 1 });
    sectionPages.push(...pages);
    runningPage += pages.length;
  }

  const backCoverPages = backCover.buildPages(om, renderCtx);
  const totalPages = 1 + 1 + sectionPages.length + backCoverPages.length;

  const tocPages = toc.buildPages(om, tocEntries);

  const allPages = [...coverPages, ...tocPages];
  let pageNum = 3;
  for (const pageHtml of sectionPages) {
    allPages.push(injectFooter(pageHtml, footerHtml(pageNum, totalPages, om.cover.propertyName)));
    pageNum++;
  }
  allPages.push(...backCoverPages);

  return allPages.join('\n');
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
