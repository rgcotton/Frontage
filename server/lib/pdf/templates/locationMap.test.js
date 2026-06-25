import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './locationMap.js';

test('no maps and no address returns no pages', () => {
  const om = emptyOm('test-id');
  const pages = buildPages(om, { streetMapUri: null, regionalMapUri: null });
  assert.strictEqual(pages.length, 0, 'should return [] when there are no maps and no address');
});

test('renders page when at least one map uri is present', () => {
  const om = emptyOm('test-id');
  const pages = buildPages(om, { streetMapUri: 'data:image/png;base64,abc', regionalMapUri: null });
  assert.ok(pages.length > 0, 'should render when a map uri is available');
});

test('renders no placeholder text when a map uri is missing', () => {
  const om = emptyOm('test-id');
  const html = buildPages(om, { streetMapUri: 'data:image/png;base64,abc', regionalMapUri: null }).join('\n');
  assert.ok(!html.includes('Map preview unavailable'), 'should not render placeholder text for missing map');
  assert.ok(!html.includes('GOOGLE_MAPS_API_KEY'), 'should not render API key instructions in output');
});
