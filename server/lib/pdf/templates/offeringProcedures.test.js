import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from '../../store.js';
import { buildPages } from './offeringProcedures.js';

test('fully blank offering procedures returns no pages', () => {
  const om = emptyOm('test-id');
  assert.strictEqual(buildPages(om, {}).length, 0, 'should return [] when all offering procedures fields are blank');
});

test('blank offering procedures fields render no fallback copy', () => {
  const om = emptyOm('test-id');
  om.offeringProcedures.dataRoomLink = 'https://example.com/dataroom';
  // offerDeadline, loiInstructions, tourInstructions, dataRoomInstructions left blank
  const html = buildPages(om, {}).join('\n');
  assert.ok(!html.includes('To be determined'), 'should not render a fallback for a blank offer deadline');
  assert.ok(!html.includes('Contact the brokerage team listed'), 'should not render fallback LOI instructions');
  assert.ok(!html.includes('Contact the brokerage team to arrange'), 'should not render fallback tour instructions');
  assert.ok(!html.includes('Data room access details will be provided'), 'should not render fallback data room instructions');
  assert.ok(html.includes('example.com/dataroom'), 'should still render the value that was provided');
});
