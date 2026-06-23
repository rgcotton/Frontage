import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getOwnerEmail } from './auth.js';

function fakeReq(headerValue) {
  return { get: (name) => (name.toLowerCase() === 'x-user-email' ? headerValue : undefined) };
}

test('returns the trimmed, lowercased email when the header is present', () => {
  assert.equal(getOwnerEmail(fakeReq('  Jane@Example.com  ')), 'jane@example.com');
});

test('returns null when the header is missing', () => {
  assert.equal(getOwnerEmail(fakeReq(undefined)), null);
});

test('returns null when the header is empty or whitespace-only', () => {
  assert.equal(getOwnerEmail(fakeReq('   ')), null);
  assert.equal(getOwnerEmail(fakeReq('')), null);
});
