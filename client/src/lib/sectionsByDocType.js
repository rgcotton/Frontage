export const ALL_SECTION_LABELS = {
  cover: 'Cover Page',
  branding: 'Branding',
  overview: 'Property Overview',
  executiveSummary: 'Executive Summary',
  market: 'Market Overview',
  financials: 'Financials',
  salesComps: 'Sales Comps',
  rentComps: 'Rent Comps',
  locationMap: 'Location & Amenities',
  driveTimePois: 'Drive Times',
  offeringProcedures: 'Offering Procedures',
  team: 'About the Team',
  valuation: 'Valuation',
  recommendation: 'Recommendation',
  propertyInfo: 'Property Info',
  dealHighlights: 'Deal Highlights',
  brokerInfo: 'Broker Info',
};

const KEYS_BY_DOC_TYPE = {
  om: [
    'cover',
    'branding',
    'overview',
    'executiveSummary',
    'market',
    'financials',
    'salesComps',
    'rentComps',
    'locationMap',
    'driveTimePois',
    'offeringProcedures',
    'team',
  ],
  onePager: ['propertyInfo', 'dealHighlights', 'driveTimePois', 'brokerInfo'],
};

export const DOC_TYPE_LABELS = {
  om: 'Offering Memorandum',
  onePager: 'One Pager',
};

export const DOC_TYPE_DESCRIPTIONS = {
  om: 'Full multi-page marketing package with financials, comps, maps, and offering procedures.',
  onePager: 'A single designed page with photo, key stats, highlights, and broker contact.',
};

export function getSectionsForDocType(docType) {
  const keys = KEYS_BY_DOC_TYPE[docType] || KEYS_BY_DOC_TYPE.om;
  return keys.map((key) => ({ key, label: ALL_SECTION_LABELS[key] }));
}
