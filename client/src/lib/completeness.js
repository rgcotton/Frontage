export const SECTION_LABELS = {
  cover: 'Cover Page',
  overview: 'Property Overview',
  executiveSummary: 'Executive Summary',
  market: 'Market Overview',
  financials: 'Financials',
  salesComps: 'Sales Comps',
  rentComps: 'Rent Comps',
  locationMap: 'Location & Amenities',
  offeringProcedures: 'Offering Procedures',
  team: 'Team',
};

export function computeCompleteness(om) {
  return {
    cover: Boolean(om.cover.propertyName && om.cover.addressLine1),
    overview: Boolean(om.overview.description),
    executiveSummary: Boolean(om.executiveSummary.narrative && om.executiveSummary.offeringPrice),
    market: Boolean(om.market.narrative),
    financials: Boolean(om.executiveSummary.offeringPrice),
    salesComps: (om.salesComps || []).length > 0,
    rentComps: (om.rentComps || []).length > 0,
    locationMap: Boolean(om.cover.addressLine1),
    offeringProcedures: Boolean(om.offeringProcedures.loiInstructions || om.offeringProcedures.tourInstructions),
    team: (om.team || []).length > 0,
  };
}

export function overallCompletenessPct(om) {
  const values = Object.values(computeCompleteness(om));
  if (!values.length) return 0;
  const done = values.filter(Boolean).length;
  return Math.round((done / values.length) * 100);
}
