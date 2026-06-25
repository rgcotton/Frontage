import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './toc.js';

test('toc renders each entry label and section number', () => {
  const om = emptyOm('test-id');
  const entries = [
    { label: 'Property Overview', number: 1 },
    { label: 'Executive Summary', number: 2 },
    { label: 'Market Overview', number: 3 },
  ];
  const html = buildPages(om, entries).join('\n');
  assert.ok(html.includes('Property Overview'));
  assert.ok(html.includes('Executive Summary'));
  assert.ok(html.includes('01'));
  assert.ok(html.includes('03'));
});

test('toc does not render any page number column', () => {
  const om = emptyOm('test-id');
  const entries = [{ label: 'Financials', number: 1 }];
  const html = buildPages(om, entries).join('\n');
  // Old TOC used e.startPage — there should be no raw integer like "5" or "12"
  // as a standalone right-aligned column value
  assert.ok(!html.includes('startPage'), 'should not reference startPage');
});

test('toc with zero entries still returns one page', () => {
  const om = emptyOm('test-id');
  const pages = buildPages(om, []);
  assert.strictEqual(pages.length, 1);
});
