import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { signSession, getOwnerEmail } from './auth.js';

before(() => {
  process.env.JWT_SECRET = 'test-secret-for-auth-tests';
});

function fakeReq(cookieValue) {
  return { cookies: cookieValue !== undefined ? { frontage_session: cookieValue } : {} };
}

test('returns the email from a valid signed cookie', () => {
  const token = signSession('Jane@Example.com');
  assert.equal(getOwnerEmail(fakeReq(token)), 'jane@example.com');
});

test('lowercases the email stored in the token', () => {
  const token = signSession('BOB@EXAMPLE.COM');
  assert.equal(getOwnerEmail(fakeReq(token)), 'bob@example.com');
});

test('returns null when no cookie is present', () => {
  assert.equal(getOwnerEmail(fakeReq(undefined)), null);
});

test('returns null for a tampered token', () => {
  const token = signSession('jane@example.com');
  const tampered = token.slice(0, -4) + 'XXXX';
  assert.equal(getOwnerEmail(fakeReq(tampered)), null);
});

test('returns null for a token signed with the wrong secret', () => {
  const bad = jwt.sign({ email: 'jane@example.com' }, 'wrong-secret');
  assert.equal(getOwnerEmail(fakeReq(bad)), null);
});
