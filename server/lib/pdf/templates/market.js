import { flowSection, headerBar } from './layout.js';
import { esc, formatNumber, formatPercent, formatCurrency, filterStats } from '../helpers/format.js';

function statGrid(rawRows, cols, valueFontSize) {
  const rows = filterStats(rawRows);
  if (!rows.length) return '';
  return `<div class="stat-grid" style="--cols:${cols}; margin-bottom:13px;">
      ${rows.map(([label, value]) => `<div class="stat-box"><div class="label">${esc(label)}</div><div class="value" style="font-size:${valueFontSize}px;">${esc(value)}</div></div>`).join('')}
    </div>`;
}

export function buildPages(om, ctx) {
  const { market, cover } = om;
  const demoHtml = statGrid(
    [
      ['Population', market.population, formatNumber],
      ['Median Income', market.medianIncome, formatCurrency],
      ['Daytime Population', market.daytimePopulation, formatNumber],
      ['Traffic Count', market.trafficCount, (v) => `${formatNumber(v)} VPD`],
    ],
    4,
    15
  );
  const trendsHtml = statGrid(
    [
      ['Submarket Vacancy', market.submarketVacancyRate, formatPercent],
      ['Asking Rents', market.askingRents, String],
      ['Absorption Trends', market.absorptionTrends, String],
    ],
    3,
    13
  );

  if (!demoHtml && !trendsHtml && !market.narrative && !market.marketName) return [];

  const inner = `
    ${headerBar(cover.propertyName, 'Market Overview')}
    <div class="section-title">Market Overview</div>
    ${market.marketName ? `<div class="section-subtitle">${esc(market.marketName)}</div>` : ''}
    <div class="gold-rule"></div>
    ${market.narrative ? `<div class="narrative" style="margin-bottom:13px;">${esc(market.narrative)}</div>` : ''}
    ${demoHtml ? `<div class="subhead" style="margin-top:0;">Demographics</div>${demoHtml}` : ''}
    ${trendsHtml ? `<div class="subhead">Submarket Trends</div>${trendsHtml}` : ''}
  `;
  return [flowSection(inner)];
}
