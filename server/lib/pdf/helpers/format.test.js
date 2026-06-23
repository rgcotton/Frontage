import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterStats } from './format.js';

test('filterStats drops rows whose raw value is blank', () => {
  const rows = [
    ['Year Built', 1998, (v) => String(v)],
    ['Lot Size', '', (v) => String(v)],
    ['Zoning', null, (v) => String(v)],
  ];
  assert.deepEqual(filterStats(rows), [['Year Built', '1998']]);
});

test('filterStats formats each surviving row using its formatter', () => {
  const rows = [['Occupancy', 92, (v) => `${v}%`]];
  assert.deepEqual(filterStats(rows), [['Occupancy', '92%']]);
});
