import express from 'express';
import fs from 'fs';
import path from 'path';
import { listOms, createOm, getOm, updateOm, deleteOm } from '../lib/store.js';
import { upload, toFileRef } from '../lib/upload.js';
import { generatePdf } from '../lib/pdfGenerator.js';
import { generatePptx } from '../lib/pptxGenerator.js';

const router = express.Router();
const GENERATED_DIR = path.join(process.cwd(), 'generated');
fs.mkdirSync(GENERATED_DIR, { recursive: true });

router.get('/', async (req, res) => {
  res.json(await listOms());
});

router.post('/', async (req, res) => {
  const om = await createOm();
  res.status(201).json(om);
});

router.get('/:id', async (req, res) => {
  const om = await getOm(req.params.id);
  if (!om) return res.status(404).json({ error: 'Not found' });
  res.json(om);
});

router.put('/:id', async (req, res) => {
  const om = await updateOm(req.params.id, req.body);
  if (!om) return res.status(404).json({ error: 'Not found' });
  res.json(om);
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteOm(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

router.post('/:id/upload', upload.array('files', 20), async (req, res) => {
  const om = await getOm(req.params.id);
  if (!om) return res.status(404).json({ error: 'Not found' });
  const refs = (req.files || []).map((f) => toFileRef(req, f));
  const updatedFiles = [...(om.files || []), ...refs];
  await updateOm(req.params.id, { files: updatedFiles });
  res.status(201).json(refs);
});

router.post('/:id/generate', async (req, res) => {
  const om = await getOm(req.params.id);
  if (!om) return res.status(404).json({ error: 'Not found' });
  const format = (req.body?.format || 'pdf').toLowerCase();

  try {
    if (format === 'pdf') {
      const fileName = `${om.id}-${Date.now()}.pdf`;
      const outPath = path.join(GENERATED_DIR, fileName);
      await generatePdf(om, outPath);
      return res.json({ format: 'pdf', downloadUrl: `/generated/${fileName}` });
    }
    if (format === 'pptx') {
      const fileName = `${om.id}-${Date.now()}.pptx`;
      const outPath = path.join(GENERATED_DIR, fileName);
      await generatePptx(om, outPath);
      return res.json({ format: 'pptx', downloadUrl: `/generated/${fileName}` });
    }
    if (format === 'web') {
      return res.json({ format: 'web', shareUrl: `/share/${om.id}` });
    }
    return res.status(400).json({ error: `Unsupported format: ${format}` });
  } catch (err) {
    console.error('Generate failed:', err);
    return res.status(500).json({ error: 'Generation failed', detail: err.message });
  }
});

export default router;
