import { getSectionsForDocType } from './sectionsByDocType.js';

export { ALL_SECTION_LABELS as SECTION_LABELS } from './sectionsByDocType.js';

export function computeCompleteness(om) {
  return {
    cover: Boolean(om.cover.propertyName && om.cover.addressLine1),
    branding: true,
    overview: Boolean(om.overview.description),
    executiveSummary: Boolean(om.executiveSummary.narrative && om.executiveSummary.offeringPrice),
    market: Boolean(om.market.narrative),
    financials: Boolean(om.executiveSummary.offeringPrice),
    salesComps: (om.salesComps || []).length > 0,
    rentComps: (om.rentComps || []).length > 0,
    locationMap: Boolean(om.cover.addressLine1),
    driveTimePois: (om.driveTimePois || []).length > 0,
    offeringProcedures: Boolean(om.offeringProcedures.loiInstructions || om.offeringProcedures.tourInstructions),
    team: (om.team || []).length > 0,
    valuation: Boolean(om.valuation?.methodologyNarrative || om.valuation?.concludedValue),
    recommendation: Boolean(om.recommendation?.narrative),
    propertyInfo: Boolean(om.cover.propertyName && om.cover.addressLine1),
    dealHighlights: Boolean(om.executiveSummary.offeringPrice && (om.executiveSummary.highlights || []).length > 0),
    brokerInfo: Boolean((om.team || [])[0]?.name),
  };
}

export function overallCompletenessPct(om) {
  const completion = computeCompleteness(om);
  const activeKeys = getSectionsForDocType(om.docType || 'om').map((s) => s.key);
  if (!activeKeys.length) return 0;
  const done = activeKeys.filter((key) => completion[key]).length;
  return Math.round((done / activeKeys.length) * 100);
}
