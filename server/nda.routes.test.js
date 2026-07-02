import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const SERVER_ENTRY = path.join(import.meta.dirname, 'index.js');
const PORT = 4733;
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

test('share links require a signed NDA when enabled, and stay open by default', async (t) => {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'nda-test-'));
  const child = spawn('node', [SERVER_ENTRY], { cwd, env: { ...process.env, PORT: String(PORT), STORAGE_ROOT: cwd } });
  t.after(() => {
    if (!child.killed) child.kill('SIGKILL');
  });
  await waitForLine(child, /listening/i, 10_000);

  const owner = 'broker@example.com';
  const om = await (await authedFetch('/api/oms', owner, { method: 'POST', body: JSON.stringify({ docType: 'om' }) })).json();

  // Default: no NDA required, /shared is open exactly like before this feature existed.
  const openShare = await fetch(`${BASE}/api/oms/${om.id}/shared`);
  assert.equal(openShare.status, 200, 'shared view should be open when requireNda is false');

  // Broker enables the requirement and sets NDA text.
  await authedFetch(`/api/oms/${om.id}`, owner, {
    method: 'PUT',
    body: JSON.stringify({ sharing: { requireNda: true, ndaText: 'Sample NDA text.' } }),
  });

  // share-info is public and never leaks document content.
  const infoRes = await fetch(`${BASE}/api/oms/${om.id}/share-info`);
  const info = await infoRes.json();
  assert.equal(info.requireNda, true);
  assert.equal(info.ndaText, 'Sample NDA text.');
  assert.equal(info.cover, undefined, 'share-info must not include the full document');

  // Without a token, the document is blocked.
  const blockedRes = await fetch(`${BASE}/api/oms/${om.id}/shared`);
  assert.equal(blockedRes.status, 403, 'shared view should refuse access without a valid NDA signature token');

  // Signing returns a token that unlocks the document.
  const signRes = await fetch(`${BASE}/api/oms/${om.id}/nda/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Jane Recipient' }),
  });
  assert.equal(signRes.status, 200);
  const { token } = await signRes.json();
  assert.ok(token);

  const unlockedRes = await fetch(`${BASE}/api/oms/${om.id}/shared?token=${token}`);
  assert.equal(unlockedRes.status, 200, 'shared view should open with a valid signature token');

  // An invalid token still does not work.
  const fakeTokenRes = await fetch(`${BASE}/api/oms/${om.id}/shared?token=not-a-real-token`);
  assert.equal(fakeTokenRes.status, 403);

  // The broker can see who signed.
  const ownedOm = await (await authedFetch(`/api/oms/${om.id}`, owner)).json();
  assert.equal(ownedOm.ndaSignatures.length, 1);
  assert.equal(ownedOm.ndaSignatures[0].name, 'Jane Recipient');

  // Declining (no name) is rejected.
  const declineRes = await fetch(`${BASE}/api/oms/${om.id}/nda/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '' }),
  });
  assert.equal(declineRes.status, 400);
});
