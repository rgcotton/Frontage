import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './market.js';
import { resolveTheme } from './layout.js';
const defaultCtx = { theme: resolveTheme({}) };

test('fully blank market returns no pages', () => {
  const om = emptyOm('test-id');
  assert.strictEqual(buildPages(om, defaultCtx).length, 0, 'should return [] when all market fields are blank');
});

test('blank market fields render no placeholder dashes or fallback text', () => {
  const om = emptyOm('test-id');
  om.market.population = 5000;
  // medianIncome, daytimePopulation, trafficCount, submarketVacancyRate, askingRents,
  // absorptionTrends, narrative left blank
  const html = buildPages(om, defaultCtx).join('\n');
  assert.ok(!html.includes('—'), 'should not render a dash placeholder for any blank field');
  assert.ok(!html.includes('No market narrative provided.'), 'should not render fallback narrative text');
  assert.ok(html.includes('5,000'), 'should still render the value that was provided');
});
