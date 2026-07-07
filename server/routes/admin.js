import express from 'express';
import { ZipArchive } from 'archiver';
import { getStorageRoot } from '../lib/storagePaths.js';
import { getOwnerEmail } from '../lib/auth.js';
import { listUsers } from '../lib/loginLog.js';
import path from 'path';

const ADMIN_EMAIL = 'robbiecotton8@gmail.com';

function requireAdmin(req, res) {
  if (getOwnerEmail(req) !== ADMIN_EMAIL) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

const router = express.Router();

router.get('/users', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json(await listUsers());
});

router.get('/export-backup', (req, res) => {
  const secret = process.env.BACKUP_SECRET;
  if (!secret || req.headers['x-backup-secret'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const storageRoot = getStorageRoot();
  const dataDir = path.join(storageRoot, 'data');
  const uploadsDir = path.join(storageRoot, 'uploads');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="backup-${timestamp}.zip"`);

  const archive = new ZipArchive({ zlib: { level: 6 } });

  archive.on('error', (err) => {
    console.error('[backup] archiver error:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Archive failed' });
  });

  archive.pipe(res);
  archive.directory(dataDir, 'data');
  archive.directory(uploadsDir, 'uploads');
  archive.finalize();
});

export default router;
