import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

const DATA_DIR = path.join(process.cwd(), 'data', 'oms');

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function omPath(id) {
  return path.join(DATA_DIR, `${id}.json`);
}

export function emptyOm(id) {
  const now = new Date().toISOString();
  return {
    id,
    createdAt: now,
    updatedAt: now,
    cover: {
      propertyName: '',
      addressLine1: '',
      city: '',
      state: '',
      zip: '',
      propertyType: '',
      tagline: '',
      coverPhoto: null,
      brokerLogo: null,
    },
    overview: {
      yearBuilt: '',
      squareFootage: '',
      lotSize: '',
      units: '',
      zoning: '',
      parking: '',
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
      demographics: '',
      images: [],
    },
    financials: {
      askingPrice: '',
      noi: '',
      capRate: '',
      grossIncome: '',
      operatingExpenses: '',
      lineItems: [],
      rentRollFile: null,
    },
    salesComps: [],
    rentComps: [],
    team: [],
    files: [],
  };
}

export async function listOms() {
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
          updatedAt: om.updatedAt,
          createdAt: om.createdAt,
        };
      })
  );
  return oms.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function createOm() {
  await ensureDataDir();
  const id = nanoid(10);
  const om = emptyOm(id);
  await fs.writeFile(omPath(id), JSON.stringify(om, null, 2));
  return om;
}

export async function getOm(id) {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(omPath(id), 'utf-8');
    return JSON.parse(raw);
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
