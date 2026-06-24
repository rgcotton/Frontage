import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAutofilled, clearAutofilled, markAutofilled } from './autofill.js';

function spy() {
  const calls = [];
  const fn = (partial) => calls.push(partial);
  fn.calls = calls;
  return fn;
}

test('isAutofilled reports whether a field is in autofilledFields', () => {
  const om = { autofilledFields: ['cover.tagline'] };
  assert.equal(isAutofilled(om, 'cover.tagline'), true);
  assert.equal(isAutofilled(om, 'cover.propertyName'), false);
});

test('isAutofilled is false when autofilledFields is missing entirely', () => {
  assert.equal(isAutofilled({}, 'cover.tagline'), false);
});

test('clearAutofilled removes the field and calls onUpdateOm when present', () => {
  const om = { autofilledFields: ['cover.tagline', 'cover.city'] };
  const onUpdateOm = spy();
  clearAutofilled(om, onUpdateOm, 'cover.tagline');
  assert.equal(onUpdateOm.calls.length, 1);
  assert.deepEqual(onUpdateOm.calls[0].autofilledFields, ['cover.city']);
});

test('clearAutofilled does nothing when the field is not marked', () => {
  const om = { autofilledFields: ['cover.city'] };
  const onUpdateOm = spy();
  clearAutofilled(om, onUpdateOm, 'cover.tagline');
  assert.equal(onUpdateOm.calls.length, 0);
});

test('markAutofilled adds the field exactly once, even if already present', () => {
  const om = { autofilledFields: ['cover.tagline'] };
  const onUpdateOm = spy();
  markAutofilled(om, onUpdateOm, 'cover.tagline');
  assert.deepEqual(onUpdateOm.calls[0].autofilledFields, ['cover.tagline']);
});

test('markAutofilled adds the field when not previously present', () => {
  const om = { autofilledFields: ['cover.city'] };
  const onUpdateOm = spy();
  markAutofilled(om, onUpdateOm, 'cover.tagline');
  assert.deepEqual(onUpdateOm.calls[0].autofilledFields, ['cover.city', 'cover.tagline']);
});

test('markAutofilled works when autofilledFields is missing entirely', () => {
  const onUpdateOm = spy();
  markAutofilled({}, onUpdateOm, 'cover.tagline');
  assert.deepEqual(onUpdateOm.calls[0].autofilledFields, ['cover.tagline']);
});
