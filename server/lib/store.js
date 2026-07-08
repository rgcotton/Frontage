import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';
import { UPLOAD_ROOT, resolveDiskPath } from './upload.js';
import { getStorageRoot } from './storagePaths.js';

const DATA_DIR = path.join(getStorageRoot(), 'data', 'oms');

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function omPath(id) {
  return path.join(DATA_DIR, `${id}.json`);
}

export function emptyOm(id, docType = 'om', ownerEmail = null) {
  const now = new Date().toISOString();
  return {
    id,
    docType,
    ownerEmail,
    folderId: null,
    createdAt: now,
    updatedAt: now,
    cover: {
      propertyName: '',
      addressLine1: '',
      city: '',
      state: '',
      zip: '',
      formattedAddress: '',
      lat: null,
      lng: null,
      propertyType: '',
      tagline: '',
      coverPhoto: null,
      brokerLogo: null,
      brokerageName: '',
      brokerageWebsite: '',
    },
    branding: {
      primaryColor: '#1B2A4A',
      accentColor: '#C9A84C',
      background: 'white',
      font: 'modern',
      template: 'institutional',
    },
    overview: {
      yearBuilt: '',
      squareFootage: '',
      lotSize: '',
      units: '',
      occupancyPct: '',
      zoning: '',
      parking: '',
      leaseType: '',
      description: '',
      photos: [],
    },
    executiveSummary: {
      narrative: '',
      highlights: [],
      offeringPrice: '',
      capRate: '',
      noi: '',
    },
    market: {
      marketName: '',
      narrative: '',
      population: '',
      medianIncome: '',
      daytimePopulation: '',
      trafficCount: '',
      submarketVacancyRate: '',
      askingRents: '',
      absorptionTrends: '',
      images: [],
    },
    financials: {
      grossIncome: '',
      operatingExpenses: '',
      lineItems: [],
      rentRollFile: null,
      rentRoll: [],
      proForma: {
        assumptions: {
          rentGrowthPct: '',
          expenseGrowthPct: '',
          vacancyPct: '',
          holdPeriodYears: '',
          exitCapRate: '',
        },
        cashFlows: [],
      },
    },
    salesComps: [],
    rentComps: [],
    offeringProcedures: {
      loiInstructions: '',
      tourInstructions: '',
      offerDeadline: '',
      dataRoomLink: '',
      dataRoomInstructions: '',
    },
    team: [],
    files: [],
    aiInstructions: {},
    // Field paths (e.g. "overview.squareFootage") populated by the PDF/URL import
    // feature, so the editor can flag them for review. Cleared per-field as the
    // broker edits each one.
    autofilledFields: [],
    // One-time notice from the last import (e.g. "this looked like a scanned
    // image" or an extraction failure). Shown once in the editor, then dismissed.
    lastExtractionNotes: null,
    valuation: {
      methodologyApproach: '',
      methodologyNarrative: '',
      concludedValue: '',
      valueEffectiveDate: '',
      valueBasisNote: '',
    },
    recommendation: {
      narrative: '',
      recommendedAction: '',
    },
    sharing: {
      requireNda: false,
      ndaText: '',
    },
    // { id, name, signedAt, token } -- the broker-facing record of who has signed.
    ndaSignatures: [],
    // { id, name, address, category, driveTimeMinutes } in broker-chosen display order.
    driveTimePois: [],
  };
}

// Backfills any fields missing from an older record (read from disk) against
// the current emptyOm() shape, so the app never has to run a migration script.
function mergeWithDefaults(om) {
  const defaults = emptyOm(om.id);
  const merged = { ...defaults, ...om };
  for (const key of ['cover', 'branding', 'overview', 'executiveSummary', 'market', 'offeringProcedures', 'valuation', 'recommendation', 'sharing']) {
    merged[key] = { ...defaults[key], ...(om[key] || {}) };
  }
  merged.financials = {
    ...defaults.financials,
    ...(om.financials || {}),
    proForma: {
      assumptions: { ...defaults.financials.proForma.assumptions, ...(om.financials?.proForma?.assumptions || {}) },
      cashFlows: om.financials?.proForma?.cashFlows || [],
    },
  };
  const salesCompDefaults = { address: '', saleDate: '', salePrice: '', pricePerSF: '', capRate: '', squareFeet: '', notes: '', photo: null };
  const rentCompDefaults = { address: '', tenant: '', rentPerSF: '', leaseTerm: '', squareFeet: '', leaseType: '' };
  const teamDefaults = { name: '', title: '', phone: '', email: '', bio: '', headshot: null };
  const poiDefaults = { name: '', address: '', category: '', driveTimeMinutes: null };
  merged.salesComps = (om.salesComps || []).map((c) => ({ ...salesCompDefaults, ...c }));
  merged.rentComps = (om.rentComps || []).map((c) => ({ ...rentCompDefaults, ...c }));
  merged.team = (om.team || []).map((m) => ({ ...teamDefaults, ...m }));
  merged.driveTimePois = (om.driveTimePois || []).map((p) => ({ ...poiDefaults, ...p }));
  merged.ndaSignatures = om.ndaSignatures || [];
  merged.files = om.files || [];
  merged.aiInstructions = { ...defaults.aiInstructions, ...(om.aiInstructions || {}) };
  return merged;
}

export async function listOms(ownerEmail = null) {
  if (ownerEmail === null) return [];
  await ensureDataDir();
  const entries = await fs.readdir(DATA_DIR);
  const oms = await Promise.all(
    entries
      .filter((f) => f.endsWith('.json'))
      .map(async (f) => {
        const raw = await fs.readFile(path.join(DATA_DIR, f), 'utf-8');
        const om = JSON.parse(raw);
        return {
          id: om.id,
          propertyName: om.cover?.propertyName || 'Untitled Property',
          docType: om.docType || 'om',
          ownerEmail: om.ownerEmail ?? null,
          folderId: om.folderId ?? null,
          updatedAt: om.updatedAt,
          createdAt: om.createdAt,
        };
      })
  );
  return oms.filter((om) => om.ownerEmail === ownerEmail).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

const VALID_DOC_TYPES = ['om', 'onePager'];

export async function createOm(docType = 'om', ownerEmail = null) {
  await ensureDataDir();
  const id = nanoid(10);
  const om = emptyOm(id, VALID_DOC_TYPES.includes(docType) ? docType : 'om', ownerEmail);
  await fs.writeFile(omPath(id), JSON.stringify(om, null, 2));
  return om;
}

export async function getOm(id) {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(omPath(id), 'utf-8');
    return mergeWithDefaults(JSON.parse(raw));
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

export async function updateOm(id, partial) {
  const existing = await getOm(id);
  if (!existing) return null;
  const merged = {
    ...existing,
    ...partial,
    id: existing.id,
    ownerEmail: existing.ownerEmail,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(omPath(id), JSON.stringify(merged, null, 2));
  return merged;
}

export async function deleteOm(id) {
  await ensureDataDir();
  try {
    await fs.unlink(omPath(id));
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

// FileRefs always look like { ..., filename, url: '/uploads/<omId>/<filename>', ... }. Walk the
// whole record and repoint any of them from the old owning OM id to the new one.
function rewriteFileUrls(node, oldId, newId) {
  if (Array.isArray(node)) {
    node.forEach((item) => rewriteFileUrls(item, oldId, newId));
  } else if (node && typeof node === 'object') {
    if (typeof node.url === 'string' && node.url.startsWith(`/uploads/${oldId}/`)) {
      node.url = node.url.replace(`/uploads/${oldId}/`, `/uploads/${newId}/`);
    }
    for (const key of Object.keys(node)) {
      rewriteFileUrls(node[key], oldId, newId);
    }
  }
}

export async function duplicateOm(id) {
  const existing = await getOm(id);
  if (!existing) return null;

  const newId = nanoid(10);
  const clone = JSON.parse(JSON.stringify(existing));
  rewriteFileUrls(clone, id, newId);

  const now = new Date().toISOString();
  clone.id = newId;
  clone.createdAt = now;
  clone.updatedAt = now;
  clone.cover = {
    ...clone.cover,
    propertyName: clone.cover.propertyName ? `${clone.cover.propertyName} (Copy)` : 'Untitled Property (Copy)',
  };

  try {
    await fs.cp(path.join(UPLOAD_ROOT, id), path.join(UPLOAD_ROOT, newId), { recursive: true });
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  await ensureDataDir();
  await fs.writeFile(omPath(newId), JSON.stringify(clone, null, 2));
  return clone;
}

export async function renameOm(id, propertyName) {
  const existing = await getOm(id);
  if (!existing) return null;
  return updateOm(id, { cover: { ...existing.cover, propertyName } });
}

// Physically copies a single uploaded file from one OM's upload directory to another's
// and returns a FileRef pointing at the new location. Best-effort: if the source file is
// missing, the original ref is returned unchanged rather than throwing.
async function copyFileRefIfPresent(fileRef, sourceId, targetId) {
  if (!fileRef || !fileRef.filename) return fileRef;
  try {
    const sourcePath = resolveDiskPath(sourceId, fileRef);
    const targetDir = path.join(UPLOAD_ROOT, targetId);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.copyFile(sourcePath, path.join(targetDir, fileRef.filename));
    return { ...fileRef, url: `/uploads/${targetId}/${fileRef.filename}` };
  } catch {
    return fileRef;
  }
}

const AUTOFILL_COVER_KEYS = ['propertyName', 'addressLine1', 'city', 'state', 'zip', 'propertyType', 'brokerLogo', 'brokerageName', 'brokerageWebsite'];
const AUTOFILL_OVERVIEW_KEYS = ['yearBuilt', 'squareFootage', 'lotSize', 'zoning', 'parking', 'occupancyPct'];
const AUTOFILL_EXEC_KEYS = ['offeringPrice', 'capRate', 'noi'];
const AUTOFILL_TEAM_KEYS = ['name', 'title', 'phone', 'email', 'headshot'];

// Pre-populates a freshly created document with the broker/property identity fields
// that are common across all document types, copied from an existing saved document.
export async function autofillOm(targetId, sourceId) {
  const target = await getOm(targetId);
  const source = await getOm(sourceId);
  if (!target || !source) return null;

  const cover = { ...target.cover };
  for (const key of AUTOFILL_COVER_KEYS) {
    if (source.cover[key]) cover[key] = source.cover[key];
  }
  if (cover.brokerLogo) cover.brokerLogo = await copyFileRefIfPresent(cover.brokerLogo, sourceId, targetId);

  const overview = { ...target.overview };
  for (const key of AUTOFILL_OVERVIEW_KEYS) {
    if (source.overview[key]) overview[key] = source.overview[key];
  }

  const executiveSummary = { ...target.executiveSummary };
  for (const key of AUTOFILL_EXEC_KEYS) {
    if (source.executiveSummary[key]) executiveSummary[key] = source.executiveSummary[key];
  }

  let team = target.team;
  const sourceMember = (source.team || [])[0];
  if (sourceMember) {
    const base = target.team?.[0] || { id: nanoid(8), name: '', title: '', phone: '', email: '', bio: '', headshot: null };
    const member = { ...base };
    for (const key of AUTOFILL_TEAM_KEYS) {
      if (sourceMember[key]) member[key] = sourceMember[key];
    }
    if (member.headshot) member.headshot = await copyFileRefIfPresent(member.headshot, sourceId, targetId);
    team = [member, ...(target.team || []).slice(1)];
  }

  return updateOm(targetId, { cover, overview, executiveSummary, team });
}
