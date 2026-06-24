import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyOm } from './store.js';
import { buildPrompt } from './ai.js';

test('custom instructions for the mapped section are appended to the prompt', () => {
  const om = emptyOm('test-id');
  om.aiInstructions.executiveSummary = 'Emphasize the below-market rents.';
  const { user } = buildPrompt('executiveSummaryNarrative', om, {});
  assert.ok(user.includes('Emphasize the below-market rents.'), 'persisted custom instructions should reach the prompt');
});

test('live (not-yet-autosaved) custom instructions take priority over the persisted copy', () => {
  const om = emptyOm('test-id');
  om.aiInstructions.executiveSummary = 'Stale persisted instructions.';
  const { user } = buildPrompt('executiveSummaryNarrative', om, {
    liveAiInstructions: { executiveSummary: 'Fresh unsaved instructions.' },
  });
  assert.ok(user.includes('Fresh unsaved instructions.'), 'live instructions should reach the prompt');
  assert.ok(!user.includes('Stale persisted instructions.'), 'stale persisted instructions should not be used when live ones are present');
});

test('every AI kind with a mapped section appends that section instructions to the prompt', () => {
  const cases = [
    ['executiveSummaryNarrative', 'executiveSummary'],
    ['investmentHighlights', 'executiveSummary'],
    ['marketNarrative', 'market'],
    ['salesCompAnalysis', 'salesComps'],
    ['propertyDescription', 'overview'],
    ['valuationMethodologyNarrative', 'valuation'],
    ['brokerRecommendationNarrative', 'recommendation'],
    ['tagline', 'cover'],
  ];
  for (const [kind, sectionKey] of cases) {
    const om = emptyOm('test-id');
    om.aiInstructions[sectionKey] = `UNIQUE_MARKER_${kind}`;
    om.salesComps = [{ id: 'comp-1', address: '1 Test St' }];
    const { user } = buildPrompt(kind, om, { compId: 'comp-1' });
    assert.ok(user.includes(`UNIQUE_MARKER_${kind}`), `${kind} should include instructions from om.aiInstructions.${sectionKey}`);
  }
});

test('top-level (cover/Property Info) instructions are appended alongside section instructions', () => {
  const om = emptyOm('test-id');
  om.aiInstructions.executiveSummary = 'Highlight the renovated lobby.';
  om.aiInstructions.cover = 'Always mention this is a 1031 exchange opportunity.';
  const { user } = buildPrompt('investmentHighlights', om, {});
  assert.ok(user.includes('Highlight the renovated lobby.'), 'section instructions should still be appended');
  assert.ok(user.includes('Always mention this is a 1031 exchange opportunity.'), 'top-level instructions should also be appended');
});

test('top-level instructions alone (no section instructions) are still appended', () => {
  const om = emptyOm('test-id');
  om.aiInstructions.cover = 'Keep the tone casual.';
  const { user } = buildPrompt('investmentHighlights', om, {});
  assert.ok(user.includes('Keep the tone casual.'), 'top-level instructions should be appended even with no section-specific instructions');
});

test('live top-level instructions take priority over the persisted copy', () => {
  const om = emptyOm('test-id');
  om.aiInstructions.cover = 'Stale top-level instructions.';
  const { user } = buildPrompt('investmentHighlights', om, { liveAiInstructions: { cover: 'Fresh top-level instructions.' } });
  assert.ok(user.includes('Fresh top-level instructions.'), 'live top-level instructions should reach the prompt');
  assert.ok(!user.includes('Stale top-level instructions.'), 'stale persisted top-level instructions should not be used when live ones are present');
});

test('team (Broker Info) instructions are appended document-wide, the same way cover instructions are', () => {
  const om = emptyOm('test-id');
  om.aiInstructions.executiveSummary = 'Highlight the renovated lobby.';
  om.aiInstructions.team = 'Mention the listing broker is a certified CCIM.';
  const { user } = buildPrompt('investmentHighlights', om, {});
  assert.ok(user.includes('Highlight the renovated lobby.'), 'section instructions should still be appended');
  assert.ok(user.includes('Mention the listing broker is a certified CCIM.'), 'team/Broker Info instructions should also be appended document-wide');
});

test('team instructions alone (no section, no cover instructions) are still appended', () => {
  const om = emptyOm('test-id');
  om.aiInstructions.team = 'Keep the tone formal.';
  const { user } = buildPrompt('propertyDescription', om, {});
  assert.ok(user.includes('Keep the tone formal.'), 'team instructions should be appended even with nothing else set');
});

test('cover and team instructions can both be appended document-wide at once', () => {
  const om = emptyOm('test-id');
  om.aiInstructions.cover = 'Mention this is a 1031 exchange.';
  om.aiInstructions.team = 'Mention the broker is a certified CCIM.';
  const { user } = buildPrompt('investmentHighlights', om, {});
  assert.ok(user.includes('Mention this is a 1031 exchange.'));
  assert.ok(user.includes('Mention the broker is a certified CCIM.'));
});

test('live team instructions take priority over the persisted copy', () => {
  const om = emptyOm('test-id');
  om.aiInstructions.team = 'Stale team instructions.';
  const { user } = buildPrompt('investmentHighlights', om, { liveAiInstructions: { team: 'Fresh team instructions.' } });
  assert.ok(user.includes('Fresh team instructions.'), 'live team instructions should reach the prompt');
  assert.ok(!user.includes('Stale team instructions.'), 'stale persisted team instructions should not be used when live ones are present');
});

test('tagline prompt includes the property details needed to write one', () => {
  const om = emptyOm('test-id');
  om.cover.propertyName = 'Sunset Plaza';
  om.cover.propertyType = 'Retail';
  om.executiveSummary.offeringPrice = 2500000;
  const { user } = buildPrompt('tagline', om, {});
  assert.ok(user.includes('Sunset Plaza'));
  assert.ok(user.includes('Retail'));
  assert.ok(user.includes('2500000') || user.includes('2,500,000'));
});

test('ndaAgreement prompt includes property address, broker name, brokerage name, and the current date', () => {
  const om = emptyOm('test-id');
  om.cover.propertyName = 'Sunset Plaza';
  om.cover.addressLine1 = '123 Main St';
  om.cover.city = 'Tampa';
  om.cover.state = 'FL';
  om.cover.brokerageName = 'Cotton Commercial';
  om.team = [{ id: 't1', name: 'Jane Broker', title: '', phone: '', email: '', bio: '', headshot: null }];
  const { user } = buildPrompt('ndaAgreement', om, {});
  assert.ok(user.includes('123 Main St'));
  assert.ok(user.includes('Tampa'));
  assert.ok(user.includes('Cotton Commercial'));
  assert.ok(user.includes('Jane Broker'));
  const today = new Date().getFullYear().toString();
  assert.ok(user.includes(today), 'prompt should include the current date so the AI can reference it');
});

test('ndaAgreement system prompt asks for a concise, one-page, non-scary agreement', () => {
  const om = emptyOm('test-id');
  const { system } = buildPrompt('ndaAgreement', om, {});
  assert.ok(/concise|brief|short/i.test(system), 'system prompt should ask for conciseness');
  assert.ok(/confidential/i.test(system), 'system prompt should mention confidentiality');
});

test('custom instructions for an unrelated section are not appended', () => {
  const om = emptyOm('test-id');
  om.aiInstructions.market = 'This belongs to the market section, not executive summary.';
  const { user } = buildPrompt('executiveSummaryNarrative', om, {});
  assert.ok(!user.includes('This belongs to the market section'), 'instructions from a different section should not leak into this prompt');
});
