import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

const FOLDERS_PATH = path.join(process.cwd(), 'data', 'folders.json');

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

export async function listFolders() {
  await ensureFile();
  const raw = await fs.readFile(FOLDERS_PATH, 'utf-8');
  return JSON.parse(raw);
}

export async function createFolder(name) {
  const folders = await listFolders();
  const folder = {
    id: nanoid(10),
    name: String(name || '').trim() || 'Untitled Folder',
    createdAt: new Date().toISOString(),
  };
  folders.push(folder);
  await writeFolders(folders);
  return folder;
}

export async function renameFolder(id, name) {
  const folders = await listFolders();
  const folder = folders.find((f) => f.id === id);
  if (!folder) return null;
  const trimmed = String(name || '').trim();
  if (trimmed) folder.name = trimmed;
  await writeFolders(folders);
  return folder;
}

export async function deleteFolder(id) {
  const folders = await listFolders();
  const next = folders.filter((f) => f.id !== id);
  if (next.length === folders.length) return false;
  await writeFolders(next);
  return true;
}
