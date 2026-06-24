import { nanoid } from 'nanoid';
import { getClient, MODEL } from './ai.js';
import { normalizeUrl } from './pdf/helpers/format.js';

const PROPERTY_TYPES = ['Office', 'Retail', 'Industrial', 'Multifamily', 'Land', 'Mixed-Use', 'Hospitality', 'Other'];
const LEASE_TYPES = ['NNN', 'Gross', 'Modified Gross', 'Other'];

const EXTRACTION_SYSTEM_PROMPT = `You are a commercial real estate analyst. You will be given a document (a brochure, offering memorandum, broker package, listing flyer, or similar) about a commercial property. Extract ONLY information explicitly present in the document.

Rules:
- If a field is not present, or you are not confident about its value, omit it from the JSON or set it to null. Never guess, estimate, or invent a value.
- "propertyType" must be exactly one of: ${PROPERTY_TYPES.join(', ')}. If the property doesn't clearly fit one of these, omit it.
- "leaseType" (the subject property's own lease structure, not a comparable) must be exactly one of: ${LEASE_TYPES.join(', ')}. If not stated, omit it.
- "highlights" is an array of up to 6 short, punchy investment highlights actually stated or strongly implied by the document, not generic filler.
- "tenants" is an array of the subject property's own tenants/rent roll, if the document includes one. Each entry: tenantName, suite, sf, leaseStart (YYYY-MM-DD), leaseEnd (YYYY-MM-DD), monthlyRent, annualRent, leaseType. Omit any sub-field you can't confidently determine.
- "documentType" must be one of: "text", "scanned_image", "mixed". Use "scanned_image" if the document is a scanned/photographed page with little to no machine-readable text, in which case set "extractionNotes" to a short note that the document appears to be a scanned image and extraction may be limited.
- Return ONLY a single JSON object, no markdown fences, no commentary, matching this shape:
{
  "documentType": "text" | "scanned_image" | "mixed",
  "extractionNotes": string | null,
  "propertyName": string | null,
  "addressLine1": string | null,
  "city": string | null,
  "state": string | null,
  "zip": string | null,
  "propertyType": string | null,
  "offeringPrice": number | null,
  "capRate": number | null,
  "noi": number | null,
  "squareFootage": number | null,
  "yearBuilt": number | null,
  "units": number | null,
  "lotSize": string | null,
  "leaseType": string | null,
  "tenants": [{ "tenantName": string, "suite": string|null, "sf": number|null, "leaseStart": string|null, "leaseEnd": string|null, "monthlyRent": number|null, "annualRent": number|null, "leaseType": string|null }],
  "highlights": [string],
  "description": string | null,
  "brokerName": string | null,
  "brokerTitle": string | null,
  "brokerPhone": string | null,
  "brokerEmail": string | null,
  "brokerageName": string | null
}`;

export function parseExtractionResponse(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const wrapped = new Error(`Could not parse an extraction result from the AI response: ${err.message}`);
    wrapped.status = 502;
    throw wrapped;
  }
}

function present(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

function pick(target, autofilledFields, prefix, key, extracted, extractedKey = key) {
  const value = extracted[extractedKey];
  if (present(value)) {
    target[key] = value;
    autofilledFields.push(`${prefix}.${key}`);
  }
}

export function buildOmPatchFromExtraction(existingOm, extracted) {
  const autofilledFields = [];

  const cover = { ...existingOm.cover };
  pick(cover, autofilledFields, 'cover', 'propertyName', extracted);
  pick(cover, autofilledFields, 'cover', 'addressLine1', extracted);
  pick(cover, autofilledFields, 'cover', 'city', extracted);
  pick(cover, autofilledFields, 'cover', 'state', extracted);
  pick(cover, autofilledFields, 'cover', 'zip', extracted);
  pick(cover, autofilledFields, 'cover', 'brokerageName', extracted);
  if (present(extracted.propertyType) && PROPERTY_TYPES.includes(extracted.propertyType)) {
    cover.propertyType = extracted.propertyType;
    autofilledFields.push('cover.propertyType');
  }

  const overview = { ...existingOm.overview };
  pick(overview, autofilledFields, 'overview', 'squareFootage', extracted);
  pick(overview, autofilledFields, 'overview', 'yearBuilt', extracted);
  pick(overview, autofilledFields, 'overview', 'units', extracted);
  pick(overview, autofilledFields, 'overview', 'lotSize', extracted);
  pick(overview, autofilledFields, 'overview', 'description', extracted);
  if (present(extracted.leaseType) && LEASE_TYPES.includes(extracted.leaseType)) {
    overview.leaseType = extracted.leaseType;
    autofilledFields.push('overview.leaseType');
  }

  const executiveSummary = { ...existingOm.executiveSummary };
  pick(executiveSummary, autofilledFields, 'executiveSummary', 'offeringPrice', extracted);
  pick(executiveSummary, autofilledFields, 'executiveSummary', 'capRate', extracted);
  pick(executiveSummary, autofilledFields, 'executiveSummary', 'noi', extracted);
  if (Array.isArray(extracted.highlights) && extracted.highlights.length) {
    executiveSummary.highlights = extracted.highlights.filter(present);
    autofilledFields.push('executiveSummary.highlights');
  }

  const financials = { ...existingOm.financials };
  if (Array.isArray(extracted.tenants) && extracted.tenants.length) {
    financials.rentRoll = [
      ...(existingOm.financials.rentRoll || []),
      ...extracted.tenants.map((t) => ({
        id: nanoid(8),
        tenantName: t.tenantName || '',
        suite: t.suite || '',
        sf: t.sf ?? '',
        leaseStart: t.leaseStart || '',
        leaseEnd: t.leaseEnd || '',
        monthlyRent: t.monthlyRent ?? '',
        annualRent: t.annualRent ?? '',
        leaseType: t.leaseType || '',
      })),
    ];
    autofilledFields.push('financials.rentRoll');
  }

  const team = [...existingOm.team];
  if (present(extracted.brokerName) || present(extracted.brokerEmail)) {
    const base = team[0] || { id: nanoid(8), name: '', title: '', phone: '', email: '', bio: '', headshot: null };
    const member = { ...base };
    if (present(extracted.brokerName)) member.name = extracted.brokerName;
    if (present(extracted.brokerTitle)) member.title = extracted.brokerTitle;
    if (present(extracted.brokerPhone)) member.phone = extracted.brokerPhone;
    if (present(extracted.brokerEmail)) member.email = extracted.brokerEmail;
    team[0] = member;
    autofilledFields.push('team.0');
  }

  const patch = { cover, overview, executiveSummary, financials, team };
  if (present(extracted.extractionNotes)) {
    patch.lastExtractionNotes = extracted.extractionNotes;
  }
  return { patch, autofilledFields };
}

async function callExtraction(contentBlocks) {
  const anthropic = getClient();
  if (!anthropic) {
    const err = new Error('ANTHROPIC_API_KEY is not set. Add it to server/.env and restart the server.');
    err.status = 503;
    throw err;
  }
  let response;
  try {
    response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: contentBlocks }],
    });
  } catch (err) {
    const wrapped = new Error(`Anthropic API request failed: ${err.message}`);
    wrapped.status = 502;
    throw wrapped;
  }
  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();
  return parseExtractionResponse(text);
}

export async function extractFromPdfBuffer(buffer) {
  return callExtraction([
    { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: buffer.toString('base64') } },
    { type: 'text', text: 'Extract the property fields from this document, following the system instructions exactly.' },
  ]);
}

export async function extractFromText(text) {
  return callExtraction([
    { type: 'text', text: `Extract the property fields from the following document text, following the system instructions exactly.\n\n${text}` },
  ]);
}

export function stripHtmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const FETCH_TIMEOUT_MS = 15_000;
const MAX_FETCH_BYTES = 32 * 1024 * 1024; // 32MB, matches Claude's PDF document size limit

// Fetches a broker-provided link and returns either the raw PDF bytes or the
// page's stripped-down readable text, ready to hand to the extraction prompt.
export async function fetchUrlContent(rawUrl) {
  const url = normalizeUrl(rawUrl);
  if (!/^https?:\/\//i.test(url)) {
    const err = new Error('That link is not a valid http(s) URL.');
    err.status = 400;
    throw err;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch (err) {
    const wrapped = new Error(`Could not reach that URL: ${err.message}`);
    wrapped.status = 400;
    throw wrapped;
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    const err = new Error(`Could not fetch that URL (HTTP ${res.status}).`);
    err.status = 400;
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  const isPdf = contentType.includes('application/pdf') || /\.pdf(\?|$)/i.test(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length > MAX_FETCH_BYTES) {
    const err = new Error('That document is too large to read (32MB limit).');
    err.status = 400;
    throw err;
  }
  if (isPdf) return { type: 'pdf', buffer };
  return { type: 'text', text: stripHtmlToText(buffer.toString('utf-8')) };
}
