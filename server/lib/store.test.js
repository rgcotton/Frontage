import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

// store.js resolves its data directory from process.cwd() at import time, so each
// test runs in its own freshly-chdir'd temp directory before dynamically importing it.
async function loadStoreInTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'store-test-'));
  process.chdir(dir);
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
  assert.equal(signedOut.length, 1);

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
