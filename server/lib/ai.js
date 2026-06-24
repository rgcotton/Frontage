import Anthropic from '@anthropic-ai/sdk';

export const MODEL = 'claude-sonnet-4-6';
let client = null;

export function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

function fmt(value, fallback = 'not provided') {
  return value && String(value).trim() ? String(value).trim() : fallback;
}

const STYLE_RULES =
  'Be concise and punchy. Lead with the single most important point, not comprehensive coverage. Use short declarative sentences. Cut filler, hedging, and corporate speak. Never use an em dash anywhere in your output; use a period, comma, or "and" instead.';

const PROMPT_BUILDERS = {
  executiveSummaryNarrative(om) {
    const { cover, overview, executiveSummary, financials, market } = om;
    return {
      system: `You are a commercial real estate analyst writing the executive summary narrative for an institutional-quality Offering Memorandum. Write in a confident, professional CRE tone. Return 2-3 tight paragraphs of plain text only, no headings, no markdown, no bullet points. ${STYLE_RULES}`,
      user: `Write the executive summary narrative for this offering.

Property: ${fmt(cover.propertyName)} (${fmt(cover.propertyType)})
Address: ${fmt(cover.addressLine1)}, ${fmt(cover.city)}, ${fmt(cover.state)} ${fmt(cover.zip)}
Year Built: ${fmt(overview.yearBuilt)}
Square Footage: ${fmt(overview.squareFootage)}
Occupancy: ${fmt(overview.occupancyPct)}
Description: ${fmt(overview.description)}

Offering Price: ${fmt(executiveSummary.offeringPrice)}
Cap Rate: ${fmt(executiveSummary.capRate)}
NOI: ${fmt(executiveSummary.noi)}
Gross Income: ${fmt(financials.grossIncome)}
Operating Expenses: ${fmt(financials.operatingExpenses)}

Market: ${fmt(market.marketName)}
Market Notes: ${fmt(market.narrative)}`,
    };
  },
  investmentHighlights(om) {
    const { cover, overview, executiveSummary, financials, market } = om;
    return {
      system: `You are a commercial real estate analyst drafting investment highlights for an Offering Memorandum. Return ONLY a JSON array of 4 to 6 short strings (no other text, no markdown fences). Each string is one punchy, specific investment highlight under 14 words, leading with the most important fact. ${STYLE_RULES}`,
      user: `Generate investment highlights for this offering.

Property: ${fmt(cover.propertyName)} (${fmt(cover.propertyType)})
Address: ${fmt(cover.city)}, ${fmt(cover.state)}
Year Built: ${fmt(overview.yearBuilt)}
Square Footage: ${fmt(overview.squareFootage)}
Occupancy: ${fmt(overview.occupancyPct)}
Offering Price: ${fmt(executiveSummary.offeringPrice)}
Cap Rate: ${fmt(executiveSummary.capRate)}
NOI: ${fmt(executiveSummary.noi)}
Gross Income: ${fmt(financials.grossIncome)}
Operating Expenses: ${fmt(financials.operatingExpenses)}
Market: ${fmt(market.marketName)}
Market Notes: ${fmt(market.narrative)}`,
    };
  },
  marketNarrative(om) {
    const { cover, market } = om;
    return {
      system: `You are a commercial real estate analyst writing the submarket narrative section of an Offering Memorandum. Return 2 tight paragraphs of plain text only, no headings, no markdown. ${STYLE_RULES}`,
      user: `Write the market overview narrative for this submarket.

Property Location: ${fmt(cover.city)}, ${fmt(cover.state)}
Market / Submarket Name: ${fmt(market.marketName)}
Population: ${fmt(market.population)}
Median Household Income: ${fmt(market.medianIncome)}
Daytime Population: ${fmt(market.daytimePopulation)}
Traffic Count: ${fmt(market.trafficCount)}
Submarket Vacancy Rate: ${fmt(market.submarketVacancyRate)}
Asking Rents: ${fmt(market.askingRents)}
Absorption Trends: ${fmt(market.absorptionTrends)}
Existing Notes: ${fmt(market.narrative)}`,
    };
  },
  salesCompAnalysis(om, { compId } = {}) {
    const comp = (om.salesComps || []).find((c) => c.id === compId);
    if (!comp) {
      const err = new Error('Sales comp not found');
      err.status = 400;
      throw err;
    }
    const others = (om.salesComps || []).filter((c) => c.id !== compId);
    return {
      system: `You are a commercial real estate analyst writing a pricing narrative for a sales comparable in an Offering Memorandum. Return exactly one tight paragraph of plain text only, no headings, no markdown. ${STYLE_RULES}`,
      user: `Write a one-paragraph pricing analysis for this sales comparable, in the context of the subject property and other comps.

Subject Property: ${fmt(om.cover.propertyName)} (${fmt(om.cover.propertyType)}) in ${fmt(om.cover.city)}, ${fmt(om.cover.state)}
Subject Offering Price: ${fmt(om.executiveSummary.offeringPrice)}
Subject Cap Rate: ${fmt(om.executiveSummary.capRate)}

This Comp:
Address: ${fmt(comp.address)}
Sale Date: ${fmt(comp.saleDate)}
Sale Price: ${fmt(comp.salePrice)}
Price/SF: ${fmt(comp.pricePerSF)}
Cap Rate: ${fmt(comp.capRate)}
Square Feet: ${fmt(comp.squareFeet)}

Other Comps for Context: ${others.map((c) => `${fmt(c.address)} at ${fmt(c.salePrice)}, ${fmt(c.capRate)} cap`).join('; ') || 'none'}`,
    };
  },
  propertyDescription(om) {
    const { cover, overview } = om;
    return {
      system: `You are a commercial real estate analyst writing the property description for an Offering Memorandum. Return 1-2 tight paragraphs of plain text only, no headings, no markdown. ${STYLE_RULES}`,
      user: `Write a professional property description from these specs.

Property: ${fmt(cover.propertyName)} (${fmt(cover.propertyType)})
Address: ${fmt(cover.addressLine1)}, ${fmt(cover.city)}, ${fmt(cover.state)} ${fmt(cover.zip)}
Year Built: ${fmt(overview.yearBuilt)}
Square Footage: ${fmt(overview.squareFootage)}
Lot Size: ${fmt(overview.lotSize)}
Occupancy: ${fmt(overview.occupancyPct)}
Zoning: ${fmt(overview.zoning)}
Parking: ${fmt(overview.parking)}
Existing Notes: ${fmt(overview.description)}`,
    };
  },
  valuationMethodologyNarrative(om) {
    const { cover, overview, valuation } = om;
    return {
      system: `You are a commercial real estate appraiser writing the valuation methodology narrative for a Broker Opinion of Value. Return 1-2 tight paragraphs of plain text only, no headings, no markdown. ${STYLE_RULES}`,
      user: `Write the valuation methodology narrative for this opinion of value.

Property: ${fmt(cover.propertyName)} (${fmt(cover.propertyType)})
Address: ${fmt(cover.addressLine1)}, ${fmt(cover.city)}, ${fmt(cover.state)} ${fmt(cover.zip)}
Year Built: ${fmt(overview.yearBuilt)}
Square Footage: ${fmt(overview.squareFootage)}

Valuation Approach: ${fmt(valuation.methodologyApproach)}
Concluded Value: ${fmt(valuation.concludedValue)}
Effective Date: ${fmt(valuation.valueEffectiveDate)}
Basis of Value Note: ${fmt(valuation.valueBasisNote)}`,
    };
  },
  brokerRecommendationNarrative(om) {
    const { cover, executiveSummary, valuation, recommendation } = om;
    return {
      system: `You are a commercial real estate broker writing the bottom-line recommendation section of a Broker Opinion of Value. Return 1 tight paragraph of plain text only, no headings, no markdown. ${STYLE_RULES}`,
      user: `Write the broker recommendation narrative for this property.

Property: ${fmt(cover.propertyName)} (${fmt(cover.propertyType)}) in ${fmt(cover.city)}, ${fmt(cover.state)}
Concluded Value: ${fmt(valuation.concludedValue)}
Valuation Approach: ${fmt(valuation.methodologyApproach)}
Current Offering Price (if any): ${fmt(executiveSummary.offeringPrice)}
Recommended Action: ${fmt(recommendation.recommendedAction)}`,
    };
  },
};

export const AI_KINDS = Object.keys(PROMPT_BUILDERS);

// Maps each AI "kind" to the section key used for that section's Custom AI Instructions box.
const KIND_SECTION_MAP = {
  executiveSummaryNarrative: 'executiveSummary',
  investmentHighlights: 'executiveSummary',
  marketNarrative: 'market',
  salesCompAnalysis: 'salesComps',
  propertyDescription: 'overview',
  valuationMethodologyNarrative: 'valuation',
  brokerRecommendationNarrative: 'recommendation',
};

// `extra.liveAiInstructions`, when present, is the client's current (possibly
// not-yet-autosaved) aiInstructions object. The autosave PUT is debounced, so a
// broker who types instructions and immediately clicks "Generate" can otherwise
// hit the server before the persisted `om` reflects what they just typed.
function readInstructions(om, extra, key) {
  const source = extra.liveAiInstructions || om.aiInstructions || {};
  const value = source[key];
  return value && value.trim() ? value.trim() : null;
}

// The "cover" box (shown as the top-level Property Info instructions on the
// One Pager, and as the Cover Page instructions on the OM/BOV) applies to every
// AI generation call for the document, not just a single section.
function appendCustomInstructions(userPrompt, om, kind, extra = {}) {
  const sectionKey = KIND_SECTION_MAP[kind];
  const parts = [];
  if (sectionKey) {
    const sectionInstructions = readInstructions(om, extra, sectionKey);
    if (sectionInstructions) parts.push(`For this section specifically: ${sectionInstructions}`);
  }
  if (sectionKey !== 'cover') {
    const topLevelInstructions = readInstructions(om, extra, 'cover');
    if (topLevelInstructions) parts.push(`For the document overall: ${topLevelInstructions}`);
  }
  if (!parts.length) return userPrompt;
  return `${userPrompt}\n\nBroker's custom instructions, follow these closely:\n${parts.join('\n')}`;
}

export function buildPrompt(kind, om, extra = {}) {
  const builder = PROMPT_BUILDERS[kind];
  if (!builder) {
    const err = new Error(`Unknown AI generation kind: ${kind}`);
    err.status = 400;
    throw err;
  }
  const { system, user: baseUser } = builder(om, extra);
  const user = appendCustomInstructions(baseUser, om, kind, extra);
  return { system, user };
}

export async function generateAiContent(kind, om, extra = {}) {
  const { system, user } = buildPrompt(kind, om, extra);

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
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: user }],
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

  if (kind === 'investmentHighlights') {
    try {
      const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      const arr = JSON.parse(cleaned);
      if (!Array.isArray(arr)) throw new Error('not an array');
      return arr.map((s) => String(s).trim()).filter(Boolean);
    } catch {
      return text
        .split('\n')
        .map((l) => l.replace(/^[-—•*\d.()\s]+/, '').trim())
        .filter(Boolean);
    }
  }

  return text;
}

export async function analyzeLogoColors(buffer, mimetype) {
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
      max_tokens: 256,
      system:
        'You analyze brokerage logo images for a real estate document branding tool. Return ONLY strict JSON, no markdown fences, no other text: {"primaryColor":"#RRGGBB","accentColor":"#RRGGBB"}. primaryColor is the dominant or most prominent brand color in the logo, suitable as a document primary color. accentColor is a complementary or secondary color from the logo, suitable as a highlight color. If the logo is black, white, or grayscale only, suggest a navy primaryColor and a gold accentColor instead.',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimetype, data: buffer.toString('base64') } },
            { type: 'text', text: 'Suggest a primary color and an accent color for this brokerage logo.' },
          ],
        },
      ],
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

  try {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleaned);
    const hex = /^#[0-9a-f]{6}$/i;
    if (!hex.test(parsed.primaryColor) || !hex.test(parsed.accentColor)) throw new Error('invalid colors');
    return { primaryColor: parsed.primaryColor, accentColor: parsed.accentColor };
  } catch {
    const err = new Error('Could not parse a color suggestion from the AI response.');
    err.status = 502;
    throw err;
  }
}
