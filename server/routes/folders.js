import express from 'express';
import { listFolders, createFolder, renameFolder, deleteFolder } from '../lib/folders.js';
import { listOms, updateOm } from '../lib/store.js';
import { getOwnerEmail } from '../lib/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  res.json(await listFolders(getOwnerEmail(req)));
});

router.post('/', async (req, res) => {
  const folder = await createFolder(req.body?.name, getOwnerEmail(req));
  res.status(201).json(folder);
});

router.put('/:id', async (req, res) => {
  const folder = await renameFolder(req.params.id, req.body?.name, getOwnerEmail(req));
  if (!folder) return res.status(404).json({ error: 'Not found' });
  res.json(folder);
});

router.delete('/:id', async (req, res) => {
  const ownerEmail = getOwnerEmail(req);
  const ok = await deleteFolder(req.params.id, ownerEmail);
  if (!ok) return res.status(404).json({ error: 'Not found' });

  // Move any documents that were in this folder back to the root.
  const oms = await listOms(ownerEmail);
  await Promise.all(oms.filter((om) => om.folderId === req.params.id).map((om) => updateOm(om.id, { folderId: null })));

  res.status(204).end();
});

export default router;
