import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './salesComps.js';

test('blank sales comp fields render no placeholder dashes', () => {
  const om = emptyOm('test-id');
  om.salesComps = [{ address: '456 Oak Ave', saleDate: '', salePrice: '', pricePerSF: '', capRate: '', squareFeet: '', notes: '', photo: null }];
  const html = buildPages(om, {}).join('\n');
  assert.ok(!html.includes('—'), 'should not render a dash placeholder for any blank comp field');
  assert.ok(html.includes('456 Oak Ave'), 'should still render the value that was provided');
});
