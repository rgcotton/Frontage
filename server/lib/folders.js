import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { getStorageRoot } from './storagePaths.js';

const FOLDERS_PATH = path.join(getStorageRoot(), 'data', 'folders.json');

async function ensureFile() {
  try {
    await fs.access(FOLDERS_PATH);
  } catch {
    await fs.mkdir(path.dirname(FOLDERS_PATH), { recursive: true });
    await fs.writeFile(FOLDERS_PATH, '[]');
  }
}

async function writeFolders(folders) {
  await fs.writeFile(FOLDERS_PATH, JSON.stringify(folders, null, 2));
}

async function readAllFolders() {
  await ensureFile();
  const raw = await fs.readFile(FOLDERS_PATH, 'utf-8');
  return JSON.parse(raw);
}

export async function listFolders(ownerEmail = null) {
  const folders = await readAllFolders();
  return folders.filter((f) => (f.ownerEmail ?? null) === ownerEmail);
}

export async function createFolder(name, ownerEmail = null) {
  const folders = await readAllFolders();
  const folder = {
    id: nanoid(10),
    name: String(name || '').trim() || 'Untitled Folder',
    ownerEmail,
    createdAt: new Date().toISOString(),
  };
  folders.push(folder);
  await writeFolders(folders);
  return folder;
}

export async function renameFolder(id, name, ownerEmail = null) {
  const folders = await readAllFolders();
  const folder = folders.find((f) => f.id === id);
  if (!folder || (folder.ownerEmail ?? null) !== ownerEmail) return null;
  const trimmed = String(name || '').trim();
  if (trimmed) folder.name = trimmed;
  await writeFolders(folders);
  return folder;
}

export async function deleteFolder(id, ownerEmail = null) {
  const folders = await readAllFolders();
  const folder = folders.find((f) => f.id === id);
  if (!folder || (folder.ownerEmail ?? null) !== ownerEmail) return false;
  const next = folders.filter((f) => f.id !== id);
  await writeFolders(next);
  return true;
}
