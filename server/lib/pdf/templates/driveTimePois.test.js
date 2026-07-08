import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './driveTimePois.js';
import { resolveTheme } from './layout.js';
const defaultCtx = { theme: resolveTheme({}) };

test('renders no pages at all when there are no POIs, so the section is omitted entirely', () => {
  const om = emptyOm('test-id');
  assert.deepEqual(buildPages(om, defaultCtx), []);
});

test('renders a row per POI with name, category, address, and drive time', () => {
  const om = emptyOm('test-id');
  om.driveTimePois = [{ id: 'p1', name: 'Walmart Supercenter', category: 'Grocery Store', address: '1 Main St', driveTimeMinutes: 8 }];
  const html = buildPages(om, defaultCtx).join('\n');
  assert.ok(html.includes('Walmart Supercenter'));
  assert.ok(html.includes('Grocery Store'));
  assert.ok(html.includes('1 Main St'));
  assert.ok(html.includes('8 min'));
});

test('renders a blank drive time cell, not an error or placeholder, when it could not be calculated', () => {
  const om = emptyOm('test-id');
  om.driveTimePois = [{ id: 'p1', name: 'Walmart Supercenter', category: 'Grocery Store', address: '1 Main St', driveTimeMinutes: null }];
  const html = buildPages(om, defaultCtx).join('\n');
  assert.ok(html.includes('Walmart Supercenter'));
  assert.ok(!html.includes('null'));
  assert.ok(!/\d+ min/.test(html), 'should not render any minute value when none was calculated');
});
