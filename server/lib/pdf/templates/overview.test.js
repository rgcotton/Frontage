import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './overview.js';

test('blank overview fields render no placeholder dashes or fallback text', () => {
  const om = emptyOm('test-id');
  om.overview.yearBuilt = 1998;
  // squareFootage, lotSize, occupancyPct, zoning, parking, description left blank
  const html = buildPages(om, {}).join('\n');
  assert.ok(!html.includes('—'), 'should not render a dash placeholder for any blank field');
  assert.ok(!html.includes('No description provided.'), 'should not render fallback description text');
  assert.ok(html.includes('1998'), 'should still render the value that was provided');
});
