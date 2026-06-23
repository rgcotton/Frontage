import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import omsRouter from './routes/oms.js';
import foldersRouter from './routes/folders.js';
import { closeBrowser } from './lib/pdf/render.js';

const PORT = process.env.PORT || 4000;
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const GENERATED_DIR = path.join(process.cwd(), 'generated');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(GENERATED_DIR, { recursive: true });
fs.mkdirSync(path.join(process.cwd(), 'data', 'oms'), { recursive: true });

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/generated', express.static(GENERATED_DIR));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/oms', omsRouter);
app.use('/api/folders', foldersRouter);

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
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  const forceExit = setTimeout(() => process.exit(1), 3000);
  Promise.resolve(closeBrowser())
    .catch(() => {})
    .then(() => {
      server.close(() => {
        clearTimeout(forceExit);
        process.exit(0);
      });
    });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
