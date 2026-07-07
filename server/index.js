import 'dotenv/config';

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Generate one with:\n  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import omsRouter from './routes/oms.js';
import foldersRouter from './routes/folders.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';
import { closeBrowser } from './lib/pdf/render.js';
import { getStorageRoot } from './lib/storagePaths.js';

const PORT = process.env.PORT || 4000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(getStorageRoot(), 'uploads');
const GENERATED_DIR = path.join(getStorageRoot(), 'generated');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(GENERATED_DIR, { recursive: true });
fs.mkdirSync(path.join(getStorageRoot(), 'data', 'oms'), { recursive: true });

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));

app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/generated', express.static(GENERATED_DIR));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/oms', omsRouter);
app.use('/api/folders', foldersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Multer / upload error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || /Unsupported file type/.test(err?.message || '')) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`Frontage API listening on http://localhost:${PORT}`);
});

// Puppeteer's shared browser (see lib/pdf/render.js) can keep the process alive
// past a plain SIGTERM, which makes `node --watch` restarts hang indefinitely on
// "Waiting for graceful termination...". Close it explicitly, with a hard
// deadline so a restart/shutdown can never hang longer than this.
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[shutdown] received ${signal}, starting graceful shutdown at ${new Date().toISOString()}`);
  const forceExit = setTimeout(() => {
    console.log(`[shutdown] closeBrowser/server.close did not finish in time, force exiting at ${new Date().toISOString()}`);
    process.exit(0);
  }, 8000);
  Promise.resolve(closeBrowser())
    .catch((err) => console.log('[shutdown] closeBrowser error (ignored):', err?.message))
    .then(() => {
      console.log(`[shutdown] browser closed at ${new Date().toISOString()}, closing server`);
      server.close(() => {
        console.log(`[shutdown] server closed cleanly at ${new Date().toISOString()}, exiting 0`);
        clearTimeout(forceExit);
        process.exit(0);
      });
    });
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
