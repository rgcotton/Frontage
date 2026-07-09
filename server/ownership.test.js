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
      if (pattern.test(chunk.toString())) { clearTimeout(timer); resolve(); }
    });
  });
}

// Logs in via the real /api/auth/login endpoint and returns the Set-Cookie value.
async function login(email) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.headers.get('set-cookie');
}

function authedFetch(urlPath, cookie, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (cookie) headers['Cookie'] = cookie;
  return fetch(`${BASE}${urlPath}`, { ...options, headers });
}

test('documents and folders are isolated per owner, including the signed-out workspace', async (t) => {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'ownership-test-'));
  const child = spawn('node', [SERVER_ENTRY], {
    cwd,
    env: { ...process.env, PORT: String(PORT), STORAGE_ROOT: cwd, JWT_SECRET: 'test-secret' },
  });
  t.after(() => { if (!child.killed) child.kill('SIGKILL'); });
  await waitForLine(child, /listening/i, 10_000);

  const janeCookie = await login('jane@example.com');
  const bobCookie = await login('bob@example.com');

  const janeOm = await (await authedFetch('/api/oms', janeCookie, { method: 'POST', body: JSON.stringify({ docType: 'om' }) })).json();
  await authedFetch('/api/oms', bobCookie, { method: 'POST', body: JSON.stringify({ docType: 'om' }) });

  // Unauthenticated create must be rejected — prevents orphan docs with null ownerEmail.
  const unauthCreate = await authedFetch('/api/oms', null, { method: 'POST', body: JSON.stringify({ docType: 'om' }) });
  assert.equal(unauthCreate.status, 401, 'creating a document without a session must return 401');

  const janeList = await (await authedFetch('/api/oms', janeCookie)).json();
  const bobList = await (await authedFetch('/api/oms', bobCookie)).json();
  assert.equal(janeList.length, 1, 'jane should only see her own document');
  assert.equal(bobList.length, 1, 'bob should only see his own document');

  // Unauthenticated list must be rejected — 401 lets the client detect an expired session.
  const unauthList = await authedFetch('/api/oms', null);
  assert.equal(unauthList.status, 401, 'listing documents without a session must return 401');

  const bobGetsJanesDoc = await authedFetch(`/api/oms/${janeOm.id}`, bobCookie);
  assert.equal(bobGetsJanesDoc.status, 404, "bob must not be able to fetch jane's document by id");

  const bobUpdatesJanesDoc = await authedFetch(`/api/oms/${janeOm.id}`, bobCookie, {
    method: 'PUT',
    body: JSON.stringify({ cover: { propertyName: 'Hijacked' } }),
  });
  assert.equal(bobUpdatesJanesDoc.status, 404, "bob must not be able to update jane's document");

  const janeFolder = await (await authedFetch('/api/folders', janeCookie, { method: 'POST', body: JSON.stringify({ name: 'Janes Folder' }) })).json();
  const bobFolders = await (await authedFetch('/api/folders', bobCookie)).json();
  assert.equal(bobFolders.length, 0, "bob should not see jane's folder");

  const bobDeletesJanesFolder = await authedFetch(`/api/folders/${janeFolder.id}`, bobCookie, { method: 'DELETE' });
  assert.equal(bobDeletesJanesFolder.status, 404, "bob must not be able to delete jane's folder");

  const sharedView = await fetch(`${BASE}/api/oms/${janeOm.id}/shared`);
  assert.equal(sharedView.status, 200, 'the public shared view should be reachable without any session cookie');
});
