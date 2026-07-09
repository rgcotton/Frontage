import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './disclaimer.js';
import { resolveTheme } from './layout.js';

const ctx = { theme: resolveTheme({}) };

test('buildPages returns exactly one page', () => {
  const om = emptyOm('test-id');
  const pages = buildPages(om, ctx);
  assert.strictEqual(pages.length, 1);
});

test('disclaimer page contains standard CRE confidentiality language', () => {
  const om = emptyOm('test-id');
  const [html] = buildPages(om, ctx);
  assert.ok(html.includes('deemed reliable'), 'must mention "deemed reliable"');
  assert.ok(html.includes('independent'), 'must reference independent verification');
  assert.ok(html.includes('confidential') || html.includes('Confidential'), 'must use the word confidential');
  assert.ok(html.includes('due diligence'), 'must reference due diligence');
});

test('disclaimer page includes property name when provided', () => {
  const om = emptyOm('test-id');
  om.cover.propertyName = 'Sunset Plaza';
  const [html] = buildPages(om, ctx);
  assert.ok(html.includes('Sunset Plaza'));
});

test('disclaimer page includes brokerage name when provided', () => {
  const om = emptyOm('test-id');
  om.cover.brokerageName = 'Apex Commercial Realty';
  const [html] = buildPages(om, ctx);
  assert.ok(html.includes('Apex Commercial Realty'));
});

test('disclaimer page uses graceful fallback when propertyName and brokerageName are blank', () => {
  const om = emptyOm('test-id');
  const [html] = buildPages(om, ctx);
  assert.ok(!html.includes('undefined'));
  assert.ok(!html.includes('null'));
});
