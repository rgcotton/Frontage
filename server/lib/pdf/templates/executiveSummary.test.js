import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './executiveSummary.js';

test('blank executive summary fields render no placeholder dashes or fallback text', () => {
  const om = emptyOm('test-id');
  om.executiveSummary.offeringPrice = 3000000;
  // capRate, noi, narrative left blank
  const html = buildPages(om, {}).join('\n');
  assert.ok(!html.includes('—'), 'should not render a dash placeholder for any blank stat');
  assert.ok(!html.includes('No summary provided.'), 'should not render fallback narrative text');
  assert.ok(html.includes('$3,000,000'), 'should still render the value that was provided');
});
