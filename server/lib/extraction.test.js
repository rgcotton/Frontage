import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from './store.js';
import { parseExtractionResponse, buildOmPatchFromExtraction, stripHtmlToText } from './extraction.js';

test('parseExtractionResponse parses plain JSON', () => {
  const result = parseExtractionResponse('{"propertyName": "Sunset Plaza"}');
  assert.equal(result.propertyName, 'Sunset Plaza');
});

test('parseExtractionResponse strips markdown code fences', () => {
  const result = parseExtractionResponse('```json\n{"propertyName": "Sunset Plaza"}\n```');
  assert.equal(result.propertyName, 'Sunset Plaza');
});

test('parseExtractionResponse throws a clear error on unparseable text', () => {
  assert.throws(() => parseExtractionResponse('not json at all'));
});

test('buildOmPatchFromExtraction maps cover fields and preserves untouched ones', () => {
  const om = emptyOm('id1');
  om.cover.tagline = 'Existing tagline';
  const { patch } = buildOmPatchFromExtraction(om, { propertyName: 'Sunset Plaza', city: 'Tampa', propertyType: 'Retail' });
  assert.equal(patch.cover.propertyName, 'Sunset Plaza');
  assert.equal(patch.cover.city, 'Tampa');
  assert.equal(patch.cover.propertyType, 'Retail');
  assert.equal(patch.cover.tagline, 'Existing tagline', 'untouched cover fields must be preserved, not wiped');
});

test('buildOmPatchFromExtraction ignores a propertyType that is not in the allowed list', () => {
  const om = emptyOm('id1');
  const { patch } = buildOmPatchFromExtraction(om, { propertyType: 'Spaceport' });
  assert.equal(patch.cover.propertyType, '', 'an invalid enum value must not be written into the field');
});

test('buildOmPatchFromExtraction maps overview fields including the new leaseType', () => {
  const om = emptyOm('id1');
  const { patch, autofilledFields } = buildOmPatchFromExtraction(om, { squareFootage: 12000, yearBuilt: 1998, leaseType: 'NNN' });
  assert.equal(patch.overview.squareFootage, 12000);
  assert.equal(patch.overview.yearBuilt, 1998);
  assert.equal(patch.overview.leaseType, 'NNN');
  assert.ok(autofilledFields.includes('overview.leaseType'));
});

test('buildOmPatchFromExtraction maps executiveSummary fields and highlights', () => {
  const om = emptyOm('id1');
  const { patch } = buildOmPatchFromExtraction(om, { offeringPrice: 5000000, capRate: 6.5, highlights: ['Fully leased', 'Below-market rents'] });
  assert.equal(patch.executiveSummary.offeringPrice, 5000000);
  assert.equal(patch.executiveSummary.capRate, 6.5);
  assert.deepEqual(patch.executiveSummary.highlights, ['Fully leased', 'Below-market rents']);
});

test('buildOmPatchFromExtraction maps tenants into financials.rentRoll with generated ids', () => {
  const om = emptyOm('id1');
  const { patch } = buildOmPatchFromExtraction(om, {
    tenants: [{ tenantName: 'Acme Corp', sf: 2000, monthlyRent: 4000, leaseType: 'NNN' }],
  });
  assert.equal(patch.financials.rentRoll.length, 1);
  assert.equal(patch.financials.rentRoll[0].tenantName, 'Acme Corp');
  assert.equal(patch.financials.rentRoll[0].sf, 2000);
  assert.ok(patch.financials.rentRoll[0].id, 'each rent roll row needs a generated id');
});

test('buildOmPatchFromExtraction maps broker info into a new team entry', () => {
  const om = emptyOm('id1');
  const { patch } = buildOmPatchFromExtraction(om, { brokerName: 'Jane Doe', brokerEmail: 'jane@example.com' });
  assert.equal(patch.team[0].name, 'Jane Doe');
  assert.equal(patch.team[0].email, 'jane@example.com');
});

test('buildOmPatchFromExtraction only marks fields with real extracted values as autofilled', () => {
  const om = emptyOm('id1');
  const { autofilledFields } = buildOmPatchFromExtraction(om, { propertyName: 'Sunset Plaza', capRate: null, noi: '' });
  assert.ok(autofilledFields.includes('cover.propertyName'));
  assert.ok(!autofilledFields.includes('executiveSummary.capRate'));
  assert.ok(!autofilledFields.includes('executiveSummary.noi'));
});

test('stripHtmlToText removes scripts, styles, and tags, leaving readable text', () => {
  const html = '<html><head><style>.x{color:red}</style></head><body><script>alert(1)</script><h1>Sunset Plaza</h1><p>1,200&nbsp;SF&amp;up</p></body></html>';
  const text = stripHtmlToText(html);
  assert.ok(!text.includes('alert(1)'));
  assert.ok(!text.includes('color:red'));
  assert.ok(text.includes('Sunset Plaza'));
  assert.ok(text.includes('1,200 SF&up'));
});

test('buildOmPatchFromExtraction leaves everything blank when nothing was extracted', () => {
  const om = emptyOm('id1');
  const { patch, autofilledFields } = buildOmPatchFromExtraction(om, {});
  assert.deepEqual(autofilledFields, []);
  assert.equal(patch.cover.propertyName, '');
});
