import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const SERVER_ENTRY = path.join(import.meta.dirname, 'index.js');
const PORT = 4732;
const BASE = `http://localhost:${PORT}`;

function waitForLine(child, pattern, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for: ${pattern}`)), timeoutMs);
    child.stdout.on('data', (chunk) => {
      if (pattern.test(chunk.toString())) {
        clearTimeout(timer);
        resolve();
      }
    });
  });
}

function authedFetch(urlPath, email, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (email) headers['X-User-Email'] = email;
  return fetch(`${BASE}${urlPath}`, { ...options, headers });
}

test('documents and folders are isolated per owner, including the signed-out workspace', async (t) => {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'ownership-test-'));
  const child = spawn('node', [SERVER_ENTRY], { cwd, env: { ...process.env, PORT: String(PORT) } });
  t.after(() => {
    if (!child.killed) child.kill('SIGKILL');
  });
  await waitForLine(child, /listening/i, 10_000);

  const janeOm = await (await authedFetch('/api/oms', 'jane@example.com', { method: 'POST', body: JSON.stringify({ docType: 'om' }) })).json();
  await authedFetch('/api/oms', 'bob@example.com', { method: 'POST', body: JSON.stringify({ docType: 'om' }) });
  await authedFetch('/api/oms', null, { method: 'POST', body: JSON.stringify({ docType: 'om' }) });

  const janeList = await (await authedFetch('/api/oms', 'jane@example.com')).json();
  const bobList = await (await authedFetch('/api/oms', 'bob@example.com')).json();
  const signedOutList = await (await authedFetch('/api/oms', null)).json();
  assert.equal(janeList.length, 1, "jane should only see her own document");
  assert.equal(bobList.length, 1, "bob should only see his own document");
  assert.equal(signedOutList.length, 1, 'the signed-out workspace should only see its own document');

  const bobGetsJanesDoc = await authedFetch(`/api/oms/${janeOm.id}`, 'bob@example.com');
  assert.equal(bobGetsJanesDoc.status, 404, "bob must not be able to fetch jane's document by id");

  const bobUpdatesJanesDoc = await authedFetch(`/api/oms/${janeOm.id}`, 'bob@example.com', {
    method: 'PUT',
    body: JSON.stringify({ cover: { propertyName: 'Hijacked' } }),
  });
  assert.equal(bobUpdatesJanesDoc.status, 404, "bob must not be able to update jane's document");

  const janeFolder = await (await authedFetch('/api/folders', 'jane@example.com', { method: 'POST', body: JSON.stringify({ name: 'Janes Folder' }) })).json();
  const bobFolders = await (await authedFetch('/api/folders', 'bob@example.com')).json();
  assert.equal(bobFolders.length, 0, "bob should not see jane's folder");

  const bobDeletesJanesFolder = await authedFetch(`/api/folders/${janeFolder.id}`, 'bob@example.com', { method: 'DELETE' });
  assert.equal(bobDeletesJanesFolder.status, 404, "bob must not be able to delete jane's folder");

  // The shared/public view should work with no identity header at all.
  const sharedView = await fetch(`${BASE}/api/oms/${janeOm.id}/shared`);
  assert.equal(sharedView.status, 200, 'the public shared view should be reachable without any identity header');
});
