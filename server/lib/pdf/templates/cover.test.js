import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './cover.js';
import { resolveTheme } from './layout.js';
const defaultCtx = { theme: resolveTheme({}) };

test('blank cover stat fields render no placeholder dashes', () => {
  const om = emptyOm('test-id');
  om.cover.propertyName = 'Test Property';
  om.executiveSummary.offeringPrice = 2500000;
  // capRate, noi, squareFootage left blank
  const html = buildPages(om, defaultCtx).join('\n');
  assert.ok(!html.includes('—'), 'should not render a dash placeholder for any blank stat');
  assert.ok(html.includes('$2,500,000'), 'should still render the value that was provided');
});
