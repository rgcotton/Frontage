import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

async function loadFoldersInTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'folders-test-'));
  process.env.STORAGE_ROOT = dir;
  const mod = await import(`./folders.js?cachebust=${Math.random()}`);
  return mod;
}

test('createFolder persists the given ownerEmail, defaulting to null when omitted', async () => {
  const folders = await loadFoldersInTempDir();
  const signedOut = await folders.createFolder('Root Folder');
  assert.equal(signedOut.ownerEmail, null);

  const owned = await folders.createFolder('Janes Folder', 'jane@example.com');
  assert.equal(owned.ownerEmail, 'jane@example.com');
});

test('listFolders only returns folders owned by the requested ownerEmail', async () => {
  const folders = await loadFoldersInTempDir();
  await folders.createFolder('Janes', 'jane@example.com');
  await folders.createFolder('Bobs', 'bob@example.com');
  await folders.createFolder('SignedOut', null);

  assert.equal((await folders.listFolders('jane@example.com')).length, 1);
  assert.equal((await folders.listFolders('bob@example.com')).length, 1);
  assert.equal((await folders.listFolders(null)).length, 1);
});

test('renameFolder refuses to rename a folder owned by a different owner', async () => {
  const folders = await loadFoldersInTempDir();
  const folder = await folders.createFolder('Janes', 'jane@example.com');
  const result = await folders.renameFolder(folder.id, 'Hijacked', 'bob@example.com');
  assert.equal(result, null);
  const stillJanes = await folders.listFolders('jane@example.com');
  assert.equal(stillJanes[0].name, 'Janes');
});

test('deleteFolder refuses to delete a folder owned by a different owner', async () => {
  const folders = await loadFoldersInTempDir();
  const folder = await folders.createFolder('Janes', 'jane@example.com');
  const result = await folders.deleteFolder(folder.id, 'bob@example.com');
  assert.equal(result, false);
  assert.equal((await folders.listFolders('jane@example.com')).length, 1);
});
