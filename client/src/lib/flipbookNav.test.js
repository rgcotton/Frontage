import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getNavVisibility } from './flipbookNav.js';

test('first page: hides Previous, shows Next', () => {
  const { showPrev, showNext } = getNavVisibility(0, 12);
  assert.equal(showPrev, false);
  assert.equal(showNext, true);
});

test('last page: hides Next, shows Previous', () => {
  const { showPrev, showNext } = getNavVisibility(11, 12);
  assert.equal(showPrev, true);
  assert.equal(showNext, false);
});

test('middle page: shows both arrows', () => {
  const { showPrev, showNext } = getNavVisibility(5, 12);
  assert.equal(showPrev, true);
  assert.equal(showNext, true);
});

test('single-page document: hides both arrows', () => {
  const { showPrev, showNext } = getNavVisibility(0, 1);
  assert.equal(showPrev, false);
  assert.equal(showNext, false);
});

test('empty document (0 pages): hides both arrows, does not throw', () => {
  const { showPrev, showNext } = getNavVisibility(0, 0);
  assert.equal(showPrev, false);
  assert.equal(showNext, false);
});

test('negative currentPage is clamped, does not falsely show Previous', () => {
  const { showPrev, showNext } = getNavVisibility(-3, 10);
  assert.equal(showPrev, false);
  assert.equal(showNext, true);
});

test('currentPage beyond last index is clamped, does not falsely show Next', () => {
  const { showPrev, showNext } = getNavVisibility(999, 10);
  assert.equal(showPrev, true);
  assert.equal(showNext, false);
});
