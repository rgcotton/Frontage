import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './executiveSummary.js';
import { resolveTheme } from './layout.js';
const defaultCtx = { theme: resolveTheme({}) };

test('fully blank executive summary returns no pages', () => {
  const om = emptyOm('test-id');
  assert.strictEqual(buildPages(om, defaultCtx).length, 0, 'should return [] when all executive summary fields are blank');
});

test('blank executive summary fields render no placeholder dashes or fallback text', () => {
  const om = emptyOm('test-id');
  om.executiveSummary.offeringPrice = 3000000;
  // capRate, noi, narrative left blank
  const html = buildPages(om, defaultCtx).join('\n');
  assert.ok(!html.includes('—'), 'should not render a dash placeholder for any blank stat');
  assert.ok(!html.includes('No summary provided.'), 'should not render fallback narrative text');
  assert.ok(html.includes('$3,000,000'), 'should still render the value that was provided');
});
