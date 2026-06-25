import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './rentComps.js';

test('empty rentComps returns no pages', () => {
  const om = emptyOm('test-id');
  assert.strictEqual(buildPages(om, {}).length, 0, 'should return [] when there are no comps');
});

test('blank rent comp fields render no placeholder dashes', () => {
  const om = emptyOm('test-id');
  om.rentComps = [{ address: '123 Main St', tenant: '', rentPerSF: '', leaseTerm: '', squareFeet: '', leaseType: '' }];
  const html = buildPages(om, {}).join('\n');
  assert.ok(!html.includes('—'), 'should not render a dash placeholder for any blank comp field');
  assert.ok(html.includes('123 Main St'), 'should still render the value that was provided');
});
