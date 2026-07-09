import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeCompleteness, overallCompletenessPct } from './completeness.js';

function makeOm(overrides = {}) {
  return {
    docType: 'onePager',
    cover: { propertyName: '', addressLine1: '', ...(overrides.cover || {}) },
    branding: { primaryColor: '#1A2B4C', ...(overrides.branding || {}) },
    overview: { description: '' },
    executiveSummary: { narrative: '', highlights: [], offeringPrice: '' },
    market: { narrative: '' },
    financials: { lineItems: [] },
    salesComps: [],
    rentComps: [],
    offeringProcedures: { loiInstructions: '', tourInstructions: '' },
    team: [],
    driveTimePois: [],
    valuation: {},
    recommendation: {},
    ...overrides,
  };
}

test('design section is always complete (never blocks completeness)', () => {
  const om = makeOm();
  const result = computeCompleteness(om);
  assert.strictEqual(result.design, true, 'design must always return true');
});

test('branding section is always complete (regression guard)', () => {
  const om = makeOm();
  const result = computeCompleteness(om);
  assert.strictEqual(result.branding, true, 'branding must still always return true');
});

test('overallCompletenessPct for onePager includes design in the denominator', () => {
  // onePager sections: propertyInfo, dealHighlights, driveTimePois, brokerInfo, design (5 total)
  // With propertyName+address (propertyInfo=true), broker name (brokerInfo=true), design=true always
  // dealHighlights=false, driveTimePois=false → 3/5 = 60%
  const om = makeOm({
    cover: { propertyName: 'Test', addressLine1: '123 Main' },
    team: [{ name: 'Jane' }],
  });
  const pct = overallCompletenessPct(om);
  assert.ok(typeof pct === 'number' && pct >= 0 && pct <= 100, 'must return a percentage 0–100');
  assert.strictEqual(pct, 60, 'should compute 60% for a partially-complete onePager with design section');
});
