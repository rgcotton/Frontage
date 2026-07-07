import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const SERVER_ENTRY = path.join(import.meta.dirname, 'index.js');
const PORT = 4734;
const BASE = `http://localhost:${PORT}`;

function waitForLine(child, pattern, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for: ${pattern}`)), timeoutMs);
    child.stdout.on('data', (chunk) => {
      if (pattern.test(chunk.toString())) { clearTimeout(timer); resolve(); }
    });
  });
}

async function login(base, email) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.headers.get('set-cookie');
}

function authedFetch(base, urlPath, cookie, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (cookie) headers['Cookie'] = cookie;
  return fetch(`${base}${urlPath}`, { ...options, headers });
}

test('POI recalculation is ownership-gated and never errors out when addresses are blank', async (t) => {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'poi-test-'));
  const child = spawn('node', [SERVER_ENTRY], {
    cwd,
    env: { ...process.env, PORT: String(PORT), STORAGE_ROOT: cwd, JWT_SECRET: 'test-secret' },
  });
  t.after(() => { if (!child.killed) child.kill('SIGKILL'); });
  await waitForLine(child, /listening/i, 10_000);

  const ownerCookie = await login(BASE, 'broker2@example.com');
  const otherCookie = await login(BASE, 'someone-else@example.com');

  const om = await (await authedFetch(BASE, '/api/oms', ownerCookie, { method: 'POST', body: JSON.stringify({ docType: 'om' }) })).json();

  await authedFetch(BASE, `/api/oms/${om.id}`, ownerCookie, {
    method: 'PUT',
    body: JSON.stringify({
      driveTimePois: [{ id: 'p1', name: 'Walmart', address: '', category: 'Grocery Store', driveTimeMinutes: null }],
    }),
  });

  const recalcRes = await authedFetch(BASE, `/api/oms/${om.id}/poi/recalculate`, ownerCookie, { method: 'POST' });
  assert.equal(recalcRes.status, 200);
  const updated = await recalcRes.json();
  assert.equal(updated.driveTimePois[0].driveTimeMinutes, null, 'blank address should produce a blank drive time, not an error');

  // A different owner cannot trigger recalculation on someone else's document.
  const otherRes = await authedFetch(BASE, `/api/oms/${om.id}/poi/recalculate`, otherCookie, { method: 'POST' });
  assert.equal(otherRes.status, 404);
});

test('recalculation accepts the current in-memory POI list in the request body, so it never clobbers unsaved client edits with a stale persisted list', async (t) => {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'poi-test-'));
  const port2 = PORT + 1;
  const base2 = `http://localhost:${port2}`;
  const child = spawn('node', [SERVER_ENTRY], {
    cwd,
    env: { ...process.env, PORT: String(port2), STORAGE_ROOT: cwd, JWT_SECRET: 'test-secret' },
  });
  t.after(() => { if (!child.killed) child.kill('SIGKILL'); });
  await waitForLine(child, /listening/i, 10_000);

  const ownerCookie = await login(base2, 'broker3@example.com');
  const om = await (await authedFetch(base2, '/api/oms', ownerCookie, { method: 'POST', body: JSON.stringify({ docType: 'om' }) })).json();

  // The server's persisted driveTimePois is still [] here — never PUT.
  // The client sends its current unsaved list directly in the recalculate request body.
  const unsavedPois = [{ id: 'p1', name: 'Unsaved Walmart', address: '', category: '', driveTimeMinutes: null }];
  const res = await authedFetch(base2, `/api/oms/${om.id}/poi/recalculate`, ownerCookie, {
    method: 'POST',
    body: JSON.stringify({ pois: unsavedPois }),
  });
  assert.equal(res.status, 200);
  const updated = await res.json();
  assert.equal(updated.driveTimePois.length, 1, 'the unsaved POI passed in the request body must survive, not be wiped by the stale persisted []');
  assert.equal(updated.driveTimePois[0].name, 'Unsaved Walmart');
});
