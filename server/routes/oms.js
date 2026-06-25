import express from 'express';
import fs from 'fs';
import path from 'path';
import { listOms, createOm, getOm, updateOm, deleteOm, duplicateOm, renameOm, autofillOm } from '../lib/store.js';
import { upload, toFileRef, resolveDiskPath } from '../lib/upload.js';
import { generatePdf } from '../lib/pdf/render.js';
import { generatePptx } from '../lib/pptxGenerator.js';
import { generateAiContent, analyzeLogoColors, AI_KINDS } from '../lib/ai.js';
import { geocodeAddress, buildAddressString, fetchStreetMapBuffer, fetchRegionalMapBuffer, recalculateDriveTimes } from '../lib/maps.js';
import { getOwnerEmail } from '../lib/auth.js';
import { extractFromPdfBuffer, extractFromText, fetchUrlContent, buildOmPatchFromExtraction } from '../lib/extraction.js';
import { createSignature, isValidSignatureToken } from '../lib/nda.js';

const router = express.Router();
const GENERATED_DIR = path.join(process.cwd(), 'generated');
fs.mkdirSync(GENERATED_DIR, { recursive: true });

// Fetches a document and confirms it belongs to the requesting owner (identified by
// the X-User-Email header, or null for the signed-out workspace). Sends 404 itself
// and returns null when missing or not owned, so callers can `if (!om) return;`.
async function getOwnedOm(req, res) {
  const om = await getOm(req.params.id);
  if (!om || om.ownerEmail !== getOwnerEmail(req)) {
    res.status(404).json({ error: 'Not found' });
    return null;
  }
  return om;
}

router.get('/', async (req, res) => {
  res.json(await listOms(getOwnerEmail(req)));
});

router.post('/', async (req, res) => {
  const om = await createOm(req.body?.docType, getOwnerEmail(req));
  res.status(201).json(om);
});

router.get('/:id', async (req, res) => {
  const om = await getOwnedOm(req, res);
  if (!om) return;
  res.json(om);
});

// Public, unauthenticated: just enough to decide what the share page should render
// (the NDA gate or the document) without ever leaking document content.
router.get('/:id/share-info', async (req, res) => {
  const om = await getOm(req.params.id);
  if (!om) return res.status(404).json({ error: 'Not found' });
  res.json({
    propertyName: om.cover?.propertyName || 'Untitled Property',
    requireNda: Boolean(om.sharing?.requireNda),
    ndaText: om.sharing?.ndaText || '',
  });
});

// Public, unauthenticated: anyone who signs gets a token tied to this document, which
// /shared then accepts. Not real auth -- same unguessable-token bar as the rest of the app.
router.post('/:id/nda/sign', async (req, res) => {
  const om = await getOm(req.params.id);
  if (!om) return res.status(404).json({ error: 'Not found' });
  try {
    const signature = createSignature(req.body?.name);
    await updateOm(req.params.id, { ndaSignatures: [...(om.ndaSignatures || []), signature] });
    res.json({ token: signature.token });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Public, unauthenticated view used by the shareable web link (SharePage / Flipbook).
// Anyone with the link can view; the unguessable id is the only access control, same
// as the existing /uploads and /generated static file serving -- unless the broker has
// required an NDA, in which case a valid signature token is also required.
router.get('/:id/shared', async (req, res) => {
  const om = await getOm(req.params.id);
  if (!om) return res.status(404).json({ error: 'Not found' });
  if (om.sharing?.requireNda && !isValidSignatureToken(om, req.query.token)) {
    return res.status(403).json({ error: 'An NDA signature is required to view this document.' });
  }
  res.json(om);
});

router.put('/:id', async (req, res) => {
  const existing = await getOwnedOm(req, res);
  if (!existing) return;
  const om = await updateOm(req.params.id, req.body);
  res.json(om);
});

router.delete('/:id', async (req, res) => {
  const existing = await getOwnedOm(req, res);
  if (!existing) return;
  await deleteOm(req.params.id);
  res.status(204).end();
});

router.post('/:id/autofill', async (req, res) => {
  const sourceId = req.body?.sourceId;
  if (!sourceId) return res.status(400).json({ error: 'sourceId is required' });
  const target = await getOwnedOm(req, res);
  if (!target) return;
  const ownerEmail = getOwnerEmail(req);
  const source = await getOm(sourceId);
  if (!source || source.ownerEmail !== ownerEmail) return res.status(404).json({ error: 'Not found' });
  const om = await autofillOm(req.params.id, sourceId);
  res.json(om);
});

router.post('/:id/duplicate', async (req, res) => {
  const existing = await getOwnedOm(req, res);
  if (!existing) return;
  const copy = await duplicateOm(req.params.id);
  res.status(201).json(copy);
});

router.put('/:id/rename', async (req, res) => {
  const propertyName = String(req.body?.propertyName || '').trim();
  if (!propertyName) return res.status(400).json({ error: 'propertyName is required' });
  const existing = await getOwnedOm(req, res);
  if (!existing) return;
  const om = await renameOm(req.params.id, propertyName);
  res.json(om);
});

router.post('/:id/upload', upload.array('files', 20), async (req, res) => {
  const om = await getOwnedOm(req, res);
  if (!om) return;
  const refs = (req.files || []).map((f) => toFileRef(req, f));
  const updatedFiles = [...(om.files || []), ...refs];
  await updateOm(req.params.id, { files: updatedFiles });
  res.status(201).json(refs);
});

// Shared by both extraction entry points: runs the extraction, maps the result onto
// the document's existing fields, persists the imported source file (if any), and
// returns the updated document plus a human-readable note (e.g. scanned-image caveat).
async function applyExtraction(req, res, om, extracted, fileRef) {
  const { patch, autofilledFields } = buildOmPatchFromExtraction(om, extracted);
  if (fileRef) patch.files = [...(om.files || []), fileRef];
  patch.autofilledFields = [...new Set([...(om.autofilledFields || []), ...autofilledFields])];
  const updated = await updateOm(req.params.id, patch);
  res.json({ om: updated, extractionNotes: extracted.extractionNotes || null, documentType: extracted.documentType || 'text' });
}

router.post('/:id/extract/upload', upload.single('file'), async (req, res) => {
  const om = await getOwnedOm(req, res);
  if (!om) return;
  if (!req.file) return res.status(400).json({ error: 'A file is required.' });
  if (req.file.mimetype !== 'application/pdf') {
    return res.status(400).json({ error: 'Only PDF files are supported for document import right now.' });
  }
  try {
    const buffer = fs.readFileSync(req.file.path);
    const extracted = await extractFromPdfBuffer(buffer);
    await applyExtraction(req, res, om, extracted, toFileRef(req, req.file));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/:id/extract/url', async (req, res) => {
  const om = await getOwnedOm(req, res);
  if (!om) return;
  const url = String(req.body?.url || '').trim();
  if (!url) return res.status(400).json({ error: 'A URL is required.' });
  try {
    const content = await fetchUrlContent(url);
    const extracted = content.type === 'pdf' ? await extractFromPdfBuffer(content.buffer) : await extractFromText(content.text);
    await applyExtraction(req, res, om, extracted, null);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/:id/generate', async (req, res) => {
  const om = await getOwnedOm(req, res);
  if (!om) return;
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

const DOC_TYPE_AUTO_KINDS = {
  om: ['propertyDescription', 'executiveSummaryNarrative', 'investmentHighlights', 'marketNarrative', 'tagline'],
  bov: ['propertyDescription', 'valuationMethodologyNarrative', 'brokerRecommendationNarrative'],
  onePager: ['propertyDescription', 'tagline'],
};

function applyGeneratedResults(om, results) {
  const patch = {};
  for (const [kind, result] of results) {
    switch (kind) {
      case 'propertyDescription':
        if (!patch.overview) patch.overview = { ...om.overview };
        patch.overview.description = result;
        break;
      case 'executiveSummaryNarrative':
        if (!patch.executiveSummary) patch.executiveSummary = { ...om.executiveSummary };
        patch.executiveSummary.narrative = result;
        break;
      case 'investmentHighlights':
        if (!patch.executiveSummary) patch.executiveSummary = { ...om.executiveSummary };
        patch.executiveSummary.highlights = result;
        break;
      case 'marketNarrative':
        if (!patch.market) patch.market = { ...om.market };
        patch.market.narrative = result;
        break;
      case 'tagline':
        if (!patch.cover) patch.cover = { ...om.cover };
        patch.cover.tagline = result;
        break;
      case 'valuationMethodologyNarrative':
        if (!patch.valuation) patch.valuation = { ...om.valuation };
        patch.valuation.methodologyNarrative = result;
        break;
      case 'brokerRecommendationNarrative':
        if (!patch.recommendation) patch.recommendation = { ...om.recommendation };
        patch.recommendation.narrative = result;
        break;
    }
  }
  return patch;
}

// Runs all applicable AI narrative kinds for the document's docType in parallel and
// persists every result in one updateOm call. Used after document extraction to give
// brokers a fully-drafted document without clicking "Generate" on each section.
router.post('/:id/ai/generate-all', async (req, res) => {
  const om = await getOwnedOm(req, res);
  if (!om) return;
  const kinds = DOC_TYPE_AUTO_KINDS[om.docType || 'om'] || DOC_TYPE_AUTO_KINDS.om;
  try {
    const settled = await Promise.allSettled(
      kinds.map((kind) => generateAiContent(kind, om).then((result) => [kind, result]))
    );
    const fulfilled = settled.filter((r) => r.status === 'fulfilled').map((r) => r.value);
    if (!fulfilled.length) return res.status(502).json({ error: 'All AI generation calls failed' });
    const patch = applyGeneratedResults(om, fulfilled);
    const updated = await updateOm(req.params.id, patch);
    res.json(updated);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/:id/ai/analyze-logo', async (req, res) => {
  const om = await getOwnedOm(req, res);
  if (!om) return;
  const logo = om.cover.brokerLogo;
  if (!logo || !logo.mimetype?.startsWith('image/')) {
    return res.status(400).json({ error: 'Upload a brokerage logo first.' });
  }
  try {
    const diskPath = resolveDiskPath(om.id, logo);
    const buffer = fs.readFileSync(diskPath);
    const result = await analyzeLogoColors(buffer, logo.mimetype);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/:id/ai/:kind', async (req, res) => {
  const om = await getOwnedOm(req, res);
  if (!om) return;
  const { kind } = req.params;
  if (!AI_KINDS.includes(kind)) return res.status(400).json({ error: `Unsupported AI kind: ${kind}` });
  try {
    const result = await generateAiContent(kind, om, req.body || {});
    res.json({ kind, result });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/:id/geocode', async (req, res) => {
  const om = await getOwnedOm(req, res);
  if (!om) return;
  try {
    const result = await geocodeAddress(buildAddressString(om.cover));
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('/:id/poi/recalculate', async (req, res) => {
  const om = await getOwnedOm(req, res);
  if (!om) return;
  // The client may pass its current in-memory POI list, which can be ahead of what's
  // persisted (e.g. recalculating right after an edit, before the debounced autosave
  // lands) -- without this, recalculating against the stale persisted list would
  // silently wipe out the user's unsaved edit.
  const pois = req.body.pois || om.driveTimePois || [];
  const driveTimePois = await recalculateDriveTimes(buildAddressString(om.cover), pois);
  const updated = await updateOm(req.params.id, { driveTimePois });
  res.json(updated);
});

// Public, unauthenticated: only ever fetched as an <img src> from the shareable
// Flipbook view, which can't attach the X-User-Email header.
router.get('/:id/static-map.png', async (req, res) => {
  const om = await getOm(req.params.id);
  if (!om) return res.status(404).json({ error: 'Not found' });
  const buf = req.query.type === 'regional' ? await fetchRegionalMapBuffer(om.cover) : await fetchStreetMapBuffer(om.cover);
  if (!buf) return res.status(404).json({ error: 'Map unavailable' });
  res.set('Content-Type', 'image/png');
  res.send(buf);
});

export default router;
