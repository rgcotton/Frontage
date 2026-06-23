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

test('custom instructions for an unrelated section are not appended', () => {
  const om = emptyOm('test-id');
  om.aiInstructions.market = 'This belongs to the market section, not executive summary.';
  const { user } = buildPrompt('executiveSummaryNarrative', om, {});
  assert.ok(!user.includes('This belongs to the market section'), 'instructions from a different section should not leak into this prompt');
});
