#!/usr/bin/env node
/**
 * Renders one sample OM through all 4 themes × 2 docTypes = 8 PDFs.
 * (BOV docType was removed from the product; do not add it back here.)
 * Output: server/generated/samples/<template>-<docType>.pdf
 *
 * Usage: node server/scripts/render-samples.js
 * Or via: npm run render:samples
 */

import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { generatePdf, closeBrowser } from '../lib/pdf/render.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = resolve(__dirname, '../generated/samples');

const THEMES = ['institutional', 'editorial', 'bold', 'minimal'];
const DOC_TYPES = ['om', 'onePager'];

const SAMPLE_OM = {
  id: 'sample-render-001',
  docType: 'om', // overridden per loop
  ownerEmail: 'sample@example.com',
  cover: {
    propertyName: 'Maple Grove Apartments',
    addressLine1: '1234 Oak Street',
    city: 'Austin', state: 'TX', zip: '78701',
    formattedAddress: '1234 Oak Street, Austin, TX 78701',
    lat: 30.2672, lng: -97.7431,
    propertyType: 'Multifamily',
    tagline: 'Value-add opportunity in central Austin',
    coverPhoto: null,
    brokerLogo: null,
    brokerageName: 'Atlas Realty Group',
    brokerageWebsite: 'https://atlasrealty.example.com',
    onePagerHighlights: '96% occupied\n48-unit complex\nStrong rent growth',
  },
  branding: {
    // NOTE: no primaryColor/accentColor on purpose — brand overrides repaint
    // every theme, which hides the themes' native palettes in samples.
    background: 'white',
    font: 'modern',
    template: 'institutional', // overridden per loop
  },
  overview: {
    yearBuilt: 1987, squareFootage: 38400, lotSize: '2.1 acres',
    units: 48, occupancyPct: 96, zoning: 'MF-3',
    parking: '72 spaces', leaseType: 'Gross', description: 'Well-maintained 48-unit multifamily asset...',
    photos: [],
  },
  executiveSummary: {
    narrative: 'Maple Grove Apartments presents a compelling value-add opportunity...',
    highlights: ['96% occupied with strong rent growth trajectory', '1987 vintage with recent exterior updates', 'Attractive in-place cap rate with upside potential'],
    offeringPrice: 8500000,
    capRate: 5.2,
    noi: 442000,
  },
  market: {
    marketName: 'Austin, TX',
    narrative: 'Austin continues to rank among the top multifamily markets in the nation...',
    population: 978908, medianIncome: 71576, daytimePopulation: 1200000,
    trafficCount: '42,000 VPD', submarketVacancyRate: 4.2,
    askingRents: '$1,485/mo', absorptionTrends: 'Positive net absorption YTD', images: [],
  },
  financials: {
    grossIncome: 855360, operatingExpenses: 413360,
    lineItems: [
      { category: 'Property Tax', annual: 98000 },
      { category: 'Insurance', annual: 42000 },
      { category: 'Utilities', annual: 38000 },
      { category: 'Maintenance', annual: 65000 },
      { category: 'Management', annual: 68160 },
      { category: 'Reserves', annual: 24000 },
    ],
    rentRollFile: null, rentRoll: [],
    proForma: { assumptions: { rentGrowthPct: 3, expenseGrowthPct: 2, vacancyPct: 5, holdPeriodYears: 5, exitCapRate: 5.5 }, cashFlows: [] },
  },
  salesComps: [
    { address: '890 Riverside Dr, Austin, TX', saleDate: '2024-06', salePrice: 9200000, pricePerSF: 241, capRate: 4.9, squareFeet: 38200, notes: 'Class B 52-unit, similar vintage' },
    { address: '2200 Lamar Blvd, Austin, TX', saleDate: '2024-03', salePrice: 7800000, pricePerSF: 227, capRate: 5.4, squareFeet: 34400, notes: '45-unit, full interior renovation' },
  ],
  rentComps: [
    { address: '1100 Barton Springs Rd, Austin, TX', tenant: '1BR/1BA', rentPerSF: 1.92, leaseTerm: '12mo', squareFeet: 720, leaseType: 'Gross' },
    { address: '445 W 30th St, Austin, TX', tenant: '2BR/2BA', rentPerSF: 1.78, leaseTerm: '12mo', squareFeet: 980, leaseType: 'Gross' },
  ],
  offeringProcedures: {
    loiInstructions: 'Submit LOI to info@atlasrealty.example.com by the deadline.',
    tourInstructions: 'Guided tours available Tuesday and Thursday 10am–2pm.',
    offerDeadline: '2024-10-31',
    dataRoomLink: 'https://dataroom.example.com/maple-grove',
    dataRoomInstructions: 'Request access via the broker email above.',
  },
  team: [{ name: 'Sarah Chen', title: 'Senior Vice President', phone: '512-555-0101', email: 'schen@atlasrealty.example.com', bio: 'Sarah specializes in Central Texas multifamily with 15 years experience.', headshot: null }],
  files: [], aiInstructions: {}, autofilledFields: [], lastExtractionNotes: null,
  valuation: { methodologyApproach: 'Income Capitalization', methodologyNarrative: 'Value derived using direct cap rate applied to stabilized NOI.', concludedValue: 8500000, valueEffectiveDate: '2024-07-01', valueBasisNote: 'Market cap rate of 5.2% applied to $442,000 NOI' },
  recommendation: { narrative: 'We recommend proceeding with acquisition at the stated price.', recommendedAction: 'Acquire' },
  sharing: { requireNda: false, ndaText: '' },
  ndaSignatures: [], driveTimePois: [
    { name: 'Whole Foods Market', address: '525 N Lamar Blvd, Austin, TX', category: 'Grocery Store', driveTimeMinutes: 7 },
    { name: 'Austin-Bergstrom Airport', address: 'Austin, TX 78719', category: 'Airport', driveTimeMinutes: 22 },
  ],
};

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  let count = 0;
  for (const docType of DOC_TYPES) {
    for (const template of THEMES) {
      const om = {
        ...SAMPLE_OM,
        docType,
        branding: { ...SAMPLE_OM.branding, template },
      };
      const filename = `${template}-${docType}.pdf`;
      const outputPath = join(OUTPUT_DIR, filename);
      await generatePdf(om, outputPath);
      console.log(`✓ ${filename}`);
      count++;
    }
  }

  await closeBrowser();
  console.log(`\n${count} PDFs written to server/generated/samples/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
