import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';

const SERVER_ENTRY = path.join(import.meta.dirname, 'index.js');
const PORT = 4731;

function waitForLine(child, pattern, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for: ${pattern}`)), timeoutMs);
    child.stdout.on('data', (chunk) => {
      if (pattern.test(chunk.toString())) { clearTimeout(timer); resolve(); }
    });
  });
}

function waitForExit(child, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out waiting for process exit')), timeoutMs);
    child.on('exit', () => { clearTimeout(timer); resolve(); });
  });
}

test('server shuts down quickly on SIGTERM even with an open Puppeteer browser', async (t) => {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'shutdown-test-'));
  const child = spawn('node', [SERVER_ENTRY], {
    cwd,
    env: { ...process.env, PORT: String(PORT), STORAGE_ROOT: cwd, JWT_SECRET: 'test-secret' },
  });
  t.after(() => { if (!child.killed) child.kill('SIGKILL'); });

  await waitForLine(child, /listening/i, 10_000);

  const base = `http://localhost:${PORT}`;

  // Log in to get a session cookie, then create and generate a document.
  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'shutdown-test@example.com' }),
  });
  const cookie = loginRes.headers.get('set-cookie');

  const createRes = await fetch(`${base}/api/oms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ docType: 'om' }),
  });
  const om = await createRes.json();

  // Forces getBrowser() to launch a real Puppeteer browser inside the child process,
  // matching the real-world state (open browser) the dev server hangs on restart with.
  const generateRes = await fetch(`${base}/api/oms/${om.id}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ format: 'pdf' }),
  });
  assert.equal(generateRes.status, 200, 'PDF generation should succeed before we test shutdown');

  child.kill('SIGTERM');
  await waitForExit(child, 4_000);
});
