import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './financials.js';
import { resolveTheme } from './layout.js';
const defaultCtx = { theme: resolveTheme({}) };

test('fully blank financials returns no pages', () => {
  const om = emptyOm('test-id');
  assert.strictEqual(buildPages(om, defaultCtx).length, 0, 'should return [] when all financial fields are blank');
});

test('blank financial fields render no placeholder dashes or fallback text', () => {
  const om = emptyOm('test-id');
  om.executiveSummary.offeringPrice = 1000000;
  // capRate, noi, grossIncome, operatingExpenses, lineItems, proForma all left blank
  const html = buildPages(om, defaultCtx).join('\n');
  assert.ok(!html.includes('—'), 'should not render a dash placeholder for any blank field');
  assert.ok(!html.includes('No T12 line items provided.'), 'should not render T12 fallback text when there are no line items');
  assert.ok(html.includes('1,000,000') || html.includes('$1,000,000'), 'should still render the value that was provided');
});

test('pro forma section is omitted entirely when assumptions and cash flows are blank', () => {
  const om = emptyOm('test-id');
  const html = buildPages(om, defaultCtx).join('\n');
  assert.ok(!html.includes('Pro Forma'), 'should not render a Pro Forma page when there is nothing to show');
});
