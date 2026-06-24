import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSignature, isValidSignatureToken } from './nda.js';

test('createSignature returns a record with a name, a signedAt timestamp, and a token', () => {
  const sig = createSignature('Jane Recipient');
  assert.equal(sig.name, 'Jane Recipient');
  assert.ok(sig.id);
  assert.ok(sig.token);
  assert.ok(!Number.isNaN(new Date(sig.signedAt).getTime()), 'signedAt should be a valid timestamp');
});

test('createSignature trims the name and rejects an empty one', () => {
  const sig = createSignature('  Jane Recipient  ');
  assert.equal(sig.name, 'Jane Recipient');
  assert.throws(() => createSignature('   '));
  assert.throws(() => createSignature(''));
});

test('isValidSignatureToken is true only for a token that exists on the document', () => {
  const sig = createSignature('Jane Recipient');
  const om = { ndaSignatures: [sig] };
  assert.equal(isValidSignatureToken(om, sig.token), true);
  assert.equal(isValidSignatureToken(om, 'not-a-real-token'), false);
});

test('isValidSignatureToken is false for a missing or empty token', () => {
  const om = { ndaSignatures: [createSignature('Jane Recipient')] };
  assert.equal(isValidSignatureToken(om, null), false);
  assert.equal(isValidSignatureToken(om, undefined), false);
  assert.equal(isValidSignatureToken(om, ''), false);
});

test('isValidSignatureToken is false when the document has no signatures at all', () => {
  assert.equal(isValidSignatureToken({ ndaSignatures: [] }, 'anything'), false);
  assert.equal(isValidSignatureToken({}, 'anything'), false);
});
