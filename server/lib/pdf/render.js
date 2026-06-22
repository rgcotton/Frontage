import puppeteer from 'puppeteer';
import { buildDocument, footerHtml } from './templates/layout.js';
import { toDataUri } from './helpers/images.js';
import { fetchStaticMapDataUri } from '../maps.js';
import * as cover from './templates/cover.js';
import * as toc from './templates/toc.js';
import * as overview from './templates/overview.js';
import * as executiveSummary from './templates/executiveSummary.js';
import * as market from './templates/market.js';
import * as financials from './templates/financials.js';
import * as salesComps from './templates/salesComps.js';
import * as rentComps from './templates/rentComps.js';
import * as locationMap from './templates/locationMap.js';
import * as offeringProcedures from './templates/offeringProcedures.js';
import * as team from './templates/team.js';
import * as backCover from './templates/backCover.js';

const CONTENT_SECTIONS = [
  { label: 'Property Overview', mod: overview },
  { label: 'Executive Summary', mod: executiveSummary },
  { label: 'Market Overview', mod: market },
  { label: 'Financials', mod: financials },
  { label: 'Sales Comparables', mod: salesComps },
  { label: 'Rent Comparables', mod: rentComps },
  { label: 'Location & Amenities', mod: locationMap },
  { label: 'Offering Procedures', mod: offeringProcedures },
  { label: 'Meet the Team', mod: team },
];

function injectFooter(pageHtml, footer) {
  const idx = pageHtml.lastIndexOf('</section>');
  if (idx === -1) return pageHtml;
  return pageHtml.slice(0, idx) + footer + pageHtml.slice(idx);
}

let sharedBrowser = null;
async function getBrowser() {
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

export async function generatePdf(om, outputPath, ctxOverrides = {}) {
  const renderCtx = {
    coverPhotoUri: toDataUri(om.id, om.cover.coverPhoto),
    brokerLogoUri: toDataUri(om.id, om.cover.brokerLogo),
    staticMapUri: await fetchStaticMapDataUri(om.cover),
    ...ctxOverrides,
  };

  const coverPages = cover.buildPages(om, renderCtx);

  let runningPage = 2; // page 1 = cover, page 2 = TOC
  const tocEntries = [];
  const sectionPages = [];
  for (const section of CONTENT_SECTIONS) {
    const pages = section.mod.buildPages(om, renderCtx);
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

  const documentHtml = buildDocument(allPages.join('\n'));

  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
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
