import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Single source of truth for where persistent data lives. Production (and local
// dev) resolve this relative to the repo, always server/storage. Tests override
// it with STORAGE_ROOT so each test run writes into its own temp directory
// instead of silently sharing real production storage.
export function getStorageRoot() {
  if (process.env.STORAGE_ROOT) return process.env.STORAGE_ROOT;
  return path.join(__dirname, '..', 'storage');
}
