import fs from 'fs/promises';
import path from 'path';
import { getStorageRoot } from './storagePaths.js';

function logPath() {
  return path.join(getStorageRoot(), 'data', 'logins.json');
}

async function readLog() {
  try {
    const raw = await fs.readFile(logPath(), 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeLog(entries) {
  const p = logPath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(entries, null, 2));
}

export async function recordLogin(email) {
  if (!email) return;
  const entries = await readLog();
  const isNew = !entries.some((e) => e.email === email);
  entries.push({ email, timestamp: new Date().toISOString(), isNew });
  await writeLog(entries);
}

export async function listUsers() {
  const entries = await readLog();
  const byEmail = new Map();
  for (const entry of entries) {
    const rec = byEmail.get(entry.email);
    if (!rec) {
      byEmail.set(entry.email, { email: entry.email, lastLogin: entry.timestamp, loginCount: 1 });
    } else {
      rec.loginCount++;
      if (entry.timestamp > rec.lastLogin) rec.lastLogin = entry.timestamp;
    }
  }
  return Array.from(byEmail.values()).sort((a, b) => b.lastLogin.localeCompare(a.lastLogin));
}
