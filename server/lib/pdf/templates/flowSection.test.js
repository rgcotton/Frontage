import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages as overviewPages } from './overview.js';
import { buildPages as execSummaryPages } from './executiveSummary.js';
import { buildPages as marketPages } from './market.js';
import { buildPages as driveTimesPages } from './driveTimePois.js';
import { buildPages as offeringProceduresPages } from './offeringProcedures.js';
import { resolveTheme } from './layout.js';
const defaultCtx = { theme: resolveTheme({}) };

// All of these templates should now emit flow sections, not forced full pages.
// A flow section uses class="pdf-flow-section" (no fixed height, shares a printed page).
// A full page uses class="pdf-page" (forced page break, 11in height).

function isFlowSection(html) {
  return html.includes('pdf-flow-section') && !html.includes('pdf-page');
}

test('overview buildPages returns a flow section, not a forced full page', () => {
  const om = emptyOm('test-id');
  om.overview.yearBuilt = 1998;
  const pages = overviewPages(om, defaultCtx);
  assert.ok(pages.length === 1);
  assert.ok(isFlowSection(pages[0]), 'overview should wrap in pdf-flow-section, not pdf-page');
});

test('executiveSummary buildPages returns a flow section', () => {
  const om = emptyOm('test-id');
  om.executiveSummary.offeringPrice = 2000000;
  const pages = execSummaryPages(om, defaultCtx);
  assert.ok(pages.length === 1);
  assert.ok(isFlowSection(pages[0]), 'executiveSummary should wrap in pdf-flow-section');
});

test('market buildPages returns a flow section', () => {
  const om = emptyOm('test-id');
  om.market.narrative = 'Strong submarket.';
  const pages = marketPages(om, defaultCtx);
  assert.ok(pages.length === 1);
  assert.ok(isFlowSection(pages[0]), 'market should wrap in pdf-flow-section');
});

test('driveTimePois buildPages returns a flow section when POIs exist', () => {
  const om = emptyOm('test-id');
  om.driveTimePois = [{ id: 'p1', name: 'Walmart', address: '1 Main', category: 'Grocery Store', driveTimeMinutes: 5 }];
  const pages = driveTimesPages(om, defaultCtx);
  assert.ok(pages.length === 1);
  assert.ok(isFlowSection(pages[0]), 'driveTimePois should wrap in pdf-flow-section');
});

test('offeringProcedures buildPages returns a flow section', () => {
  const om = emptyOm('test-id');
  om.offeringProcedures.loiInstructions = 'Submit via email.';
  const pages = offeringProceduresPages(om, defaultCtx);
  assert.ok(pages.length === 1);
  assert.ok(isFlowSection(pages[0]), 'offeringProcedures should wrap in pdf-flow-section');
});
