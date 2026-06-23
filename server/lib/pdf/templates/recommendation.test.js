import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './recommendation.js';

test('blank recommendation narrative renders no fallback text', () => {
  const om = emptyOm('test-id');
  om.recommendation.recommendedAction = 'Sell';
  // narrative left blank
  const html = buildPages(om, {}).join('\n');
  assert.ok(!html.includes('No recommendation provided.'), 'should not render fallback narrative text');
  assert.ok(html.includes('Sell'), 'should still render the value that was provided');
});
