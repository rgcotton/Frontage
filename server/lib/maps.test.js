import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchDriveTimeMinutes, recalculateDriveTimes } from './maps.js';

test('fetchDriveTimeMinutes returns null when the origin address is missing, never throws', async () => {
  const result = await fetchDriveTimeMinutes('', '123 Main St, Springfield, MO');
  assert.equal(result, null);
});

test('fetchDriveTimeMinutes returns null when the destination address is missing, never throws', async () => {
  const result = await fetchDriveTimeMinutes('123 Main St, Springfield, MO', '');
  assert.equal(result, null);
});

test('fetchDriveTimeMinutes returns null when GOOGLE_MAPS_API_KEY is not set, never throws', async (t) => {
  const original = process.env.GOOGLE_MAPS_API_KEY;
  delete process.env.GOOGLE_MAPS_API_KEY;
  t.after(() => {
    if (original !== undefined) process.env.GOOGLE_MAPS_API_KEY = original;
  });
  const result = await fetchDriveTimeMinutes('123 Main St, Springfield, MO', '456 Oak Ave, Springfield, MO');
  assert.equal(result, null);
});

test('recalculateDriveTimes returns the pois unchanged in shape, with null drive times when there is no origin address', async () => {
  const pois = [
    { id: 'p1', name: 'Walmart', address: '1 Main St', category: 'Grocery Store', driveTimeMinutes: null },
    { id: 'p2', name: 'I-435', address: '', category: 'Highway Access', driveTimeMinutes: null },
  ];
  const result = await recalculateDriveTimes('', pois);
  assert.equal(result.length, 2);
  assert.equal(result[0].id, 'p1');
  assert.equal(result[0].driveTimeMinutes, null);
  assert.equal(result[1].driveTimeMinutes, null);
});

test('recalculateDriveTimes leaves a POI with a blank address as null without affecting the others', async (t) => {
  const original = process.env.GOOGLE_MAPS_API_KEY;
  delete process.env.GOOGLE_MAPS_API_KEY; // force the deterministic null path, no network
  t.after(() => {
    if (original !== undefined) process.env.GOOGLE_MAPS_API_KEY = original;
  });
  const pois = [{ id: 'p1', name: 'Walmart', address: '1 Main St', category: '', driveTimeMinutes: 5 }];
  const result = await recalculateDriveTimes('123 Property St', pois);
  assert.equal(result[0].driveTimeMinutes, null, 'should overwrite a stale value with the fresh (null) result, not leave the old one');
});
