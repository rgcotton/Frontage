import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { emptyOm } from './store.js';

// store.js resolves its data directory from process.cwd() at import time, so each
// test runs in its own freshly-chdir'd temp directory before dynamically importing it.
async function loadStoreInTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'store-test-'));
  process.env.STORAGE_ROOT = dir;
  const mod = await import(`./store.js?cachebust=${Math.random()}`);
  return { store: mod, dir };
}

test('createOm persists the given ownerEmail, defaulting to null when omitted', async () => {
  const { store } = await loadStoreInTempDir();
  const signedOut = await store.createOm('om');
  assert.equal(signedOut.ownerEmail, null);

  const owned = await store.createOm('om', 'jane@example.com');
  assert.equal(owned.ownerEmail, 'jane@example.com');
});

test('listOms only returns documents owned by the requested ownerEmail', async () => {
  const { store } = await loadStoreInTempDir();
  await store.createOm('om', 'jane@example.com');
  await store.createOm('om', 'bob@example.com');
  await store.createOm('om', null);

  const janes = await store.listOms('jane@example.com');
  assert.equal(janes.length, 1);

  const signedOut = await store.listOms(null);
  assert.equal(signedOut.length, 0);

  const bobs = await store.listOms('bob@example.com');
  assert.equal(bobs.length, 1);
});

test('updateOm cannot change ownerEmail via a partial update', async () => {
  const { store } = await loadStoreInTempDir();
  const om = await store.createOm('om', 'jane@example.com');
  const updated = await store.updateOm(om.id, { ownerEmail: 'attacker@example.com', folderId: 'f1' });
  assert.equal(updated.ownerEmail, 'jane@example.com');
  assert.equal(updated.folderId, 'f1');
});

test('duplicateOm preserves the ownerEmail of the source document', async () => {
  const { store } = await loadStoreInTempDir();
  const om = await store.createOm('om', 'jane@example.com');
  const copy = await store.duplicateOm(om.id);
  assert.equal(copy.ownerEmail, 'jane@example.com');
});

test('emptyOm defaults sharing, ndaSignatures, and driveTimePois to a safe empty state', () => {
  const om = emptyOm('id1');
  assert.deepEqual(om.sharing, { requireNda: false, ndaText: '' });
  assert.deepEqual(om.ndaSignatures, []);
  assert.deepEqual(om.driveTimePois, []);
});

test('create-then-read round-trips ownerEmail and backfills current branding defaults', async () => {
  const { store } = await loadStoreInTempDir();
  const email = 'owner@test.com';
  const created = await store.createOm('om', email);
  assert.equal(created.ownerEmail, email);

  const read = await store.getOm(created.id);
  assert.equal(read.ownerEmail, email);
  assert.equal(read.id, created.id);
  assert.equal(read.docType, 'om');
  // Regression: new branding fields added in ff51c31 must survive the create→read roundtrip
  assert.equal(read.branding.onePagerFont, null);
  assert.equal(read.branding.onePagerLayout, 'default');
  assert.equal(read.branding.statStyle, 'minimal');
});

test('getOm backfills onePagerFont/onePagerLayout/statStyle for a one-pager saved before the Design section existed', async () => {
  const { store, dir } = await loadStoreInTempDir();
  // Simulate a document saved before ff51c31: branding exists but lacks the new Design fields.
  const legacy = {
    id: 'legacy-design',
    docType: 'onePager',
    ownerEmail: 'owner@test.com',
    cover: { propertyName: 'Old One Pager' },
    branding: { primaryColor: '#123456', accentColor: '#654321', font: 'modern', template: 'institutional' },
  };
  await fs.mkdir(path.join(dir, 'data', 'oms'), { recursive: true });
  await fs.writeFile(path.join(dir, 'data', 'oms', 'legacy-design.json'), JSON.stringify(legacy));
  const loaded = await store.getOm('legacy-design');
  // Existing fields must be preserved.
  assert.equal(loaded.branding.primaryColor, '#123456');
  assert.equal(loaded.branding.template, 'institutional');
  // New Design-section fields must be backfilled so DesignSection never receives undefined.
  assert.equal(loaded.branding.onePagerFont, null);
  assert.equal(loaded.branding.onePagerLayout, 'default');
  assert.equal(loaded.branding.statStyle, 'minimal');
});

test('getOm backfills sharing/ndaSignatures/driveTimePois for a record saved before this feature existed', async () => {
  const { store, dir } = await loadStoreInTempDir();
  const legacy = { id: 'legacy1', docType: 'om', cover: { propertyName: 'Old Doc' } };
  await fs.mkdir(path.join(dir, 'data', 'oms'), { recursive: true });
  await fs.writeFile(path.join(dir, 'data', 'oms', 'legacy1.json'), JSON.stringify(legacy));
  const loaded = await store.getOm('legacy1');
  assert.deepEqual(loaded.sharing, { requireNda: false, ndaText: '' });
  assert.deepEqual(loaded.ndaSignatures, []);
  assert.deepEqual(loaded.driveTimePois, []);
});
