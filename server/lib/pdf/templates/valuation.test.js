import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './valuation.js';

test('blank valuation fields render no placeholder dashes or fallback text', () => {
  const om = emptyOm('test-id');
  om.valuation.concludedValue = 4200000;
  // methodologyApproach, valueEffectiveDate, methodologyNarrative, valueBasisNote left blank
  const html = buildPages(om, {}).join('\n');
  assert.ok(!html.includes('—'), 'should not render a dash placeholder for any blank field');
  assert.ok(!html.includes('No methodology narrative provided.'), 'should not render fallback narrative text');
  assert.ok(html.includes('$4,200,000'), 'should still render the value that was provided');
});
