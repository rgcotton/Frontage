import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-6';
let client = null;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

function fmt(value, fallback = 'not provided') {
  return value && String(value).trim() ? String(value).trim() : fallback;
}

const PROMPT_BUILDERS = {
  executiveSummaryNarrative(om) {
    const { cover, overview, executiveSummary, financials, market } = om;
    return {
      system:
        'You are a commercial real estate analyst writing the executive summary narrative for an institutional-quality Offering Memorandum. Write in a confident, professional CRE tone. Return 2-3 tight paragraphs of plain text only — no headings, no markdown, no bullet points.',
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
      system:
        'You are a commercial real estate analyst drafting investment highlights for an Offering Memorandum. Return ONLY a JSON array of 4 to 6 short strings (no other text, no markdown fences). Each string should be one punchy, specific investment highlight under 18 words.',
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
      system:
        'You are a commercial real estate analyst writing the submarket narrative section of an Offering Memorandum. Return 2 tight paragraphs of plain text only — no headings, no markdown.',
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
      system:
        'You are a commercial real estate analyst writing a pricing narrative for a sales comparable in an Offering Memorandum. Return exactly one tight paragraph of plain text only — no headings, no markdown.',
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

Other Comps for Context: ${others.map((c) => `${fmt(c.address)} — ${fmt(c.salePrice)} at ${fmt(c.capRate)} cap`).join('; ') || 'none'}`,
    };
  },
  propertyDescription(om) {
    const { cover, overview } = om;
    return {
      system:
        'You are a commercial real estate analyst writing the property description for an Offering Memorandum. Return 1-2 tight paragraphs of plain text only — no headings, no markdown.',
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
};

export const AI_KINDS = Object.keys(PROMPT_BUILDERS);

export async function generateAiContent(kind, om, extra = {}) {
  const builder = PROMPT_BUILDERS[kind];
  if (!builder) {
    const err = new Error(`Unknown AI generation kind: ${kind}`);
    err.status = 400;
    throw err;
  }

  const anthropic = getClient();
  if (!anthropic) {
    const err = new Error('ANTHROPIC_API_KEY is not set. Add it to server/.env and restart the server.');
    err.status = 503;
    throw err;
  }

  const { system, user } = builder(om, extra);

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
        .map((l) => l.replace(/^[-•*\d.()\s]+/, '').trim())
        .filter(Boolean);
    }
  }

  return text;
}
