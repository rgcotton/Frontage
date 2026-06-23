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

export function emptyOm(id, docType = 'om') {
  const now = new Date().toISOString();
  return {
    id,
    docType,
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
    },
    branding: {
      primaryColor: '#1B2A4A',
      accentColor: '#C9A84C',
      background: 'white',
      font: 'modern',
    },
    overview: {
      yearBuilt: '',
      squareFootage: '',
      lotSize: '',
      units: '',
      occupancyPct: '',
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
  };
}

// Backfills any fields missing from an older record (read from disk) against
// the current emptyOm() shape, so the app never has to run a migration script.
function mergeWithDefaults(om) {
  const defaults = emptyOm(om.id);
  const merged = { ...defaults, ...om };
  for (const key of ['cover', 'branding', 'overview', 'executiveSummary', 'market', 'offeringProcedures', 'valuation', 'recommendation']) {
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
  merged.salesComps = (om.salesComps || []).map((c) => ({ ...salesCompDefaults, ...c }));
  merged.rentComps = (om.rentComps || []).map((c) => ({ ...rentCompDefaults, ...c }));
  merged.team = (om.team || []).map((m) => ({ ...teamDefaults, ...m }));
  merged.files = om.files || [];
  merged.aiInstructions = { ...defaults.aiInstructions, ...(om.aiInstructions || {}) };
  return merged;
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
          docType: om.docType || 'om',
          updatedAt: om.updatedAt,
          createdAt: om.createdAt,
        };
      })
  );
  return oms.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

const VALID_DOC_TYPES = ['om', 'onePager', 'bov'];

export async function createOm(docType = 'om') {
  await ensureDataDir();
  const id = nanoid(10);
  const om = emptyOm(id, VALID_DOC_TYPES.includes(docType) ? docType : 'om');
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
