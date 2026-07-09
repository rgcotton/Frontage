import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { emptyOm } from './lib/store.js';
import { generatePptx } from './lib/pptxGenerator.js';

test('generatePptx for a onePager docType produces a file without throwing', async () => {
  const om = emptyOm('test-id', 'onePager');
  om.cover.propertyName = 'Test Property';
  om.cover.addressLine1 = '123 Main St';
  om.cover.city = 'Austin';
  om.cover.state = 'TX';
  const out = path.join(os.tmpdir(), `test-onepager-${Date.now()}.pptx`);
  try {
    await generatePptx(om, out);
    assert.ok(fs.existsSync(out), 'output file must exist');
    assert.ok(fs.statSync(out).size > 1000, 'output file must be non-trivially sized');
  } finally {
    try { fs.unlinkSync(out); } catch {}
  }
});

test('generatePptx for a standard om docType produces a file without throwing', async () => {
  const om = emptyOm('test-id', 'om');
  om.cover.propertyName = 'Test OM';
  const out = path.join(os.tmpdir(), `test-om-${Date.now()}.pptx`);
  try {
    await generatePptx(om, out);
    assert.ok(fs.existsSync(out), 'output file must exist');
  } finally {
    try { fs.unlinkSync(out); } catch {}
  }
});
