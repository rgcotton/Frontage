import { pageShell, headerBar } from './layout.js';
import { esc, formatNumber, formatPercent, formatCurrency } from '../helpers/format.js';

export function buildPages(om, ctx) {
  const { market, cover } = om;
  const demo = [
    ['Population', market.population ? formatNumber(market.population) : '—'],
    ['Median Income', market.medianIncome ? formatCurrency(market.medianIncome) : '—'],
    ['Daytime Population', market.daytimePopulation ? formatNumber(market.daytimePopulation) : '—'],
    ['Traffic Count', market.trafficCount ? `${formatNumber(market.trafficCount)} VPD` : '—'],
  ];
  const trends = [
    ['Submarket Vacancy', market.submarketVacancyRate ? formatPercent(market.submarketVacancyRate) : '—'],
    ['Asking Rents', market.askingRents || '—'],
    ['Absorption Trends', market.absorptionTrends || '—'],
  ];

  const inner = `
    ${headerBar(cover.propertyName, 'Market Overview')}
    <div class="section-title">Market Overview</div>
    ${market.marketName ? `<div class="section-subtitle">${esc(market.marketName)}</div>` : ''}
    <div class="gold-rule"></div>
    <div class="narrative" style="margin-bottom:18px;">${esc(market.narrative) || 'No market narrative provided.'}</div>
    <div class="subhead" style="margin-top:0;">Demographics</div>
    <div class="stat-grid" style="--cols:4; margin-bottom:18px;">
      ${demo.map(([label, value]) => `<div class="stat-box"><div class="label">${esc(label)}</div><div class="value" style="font-size:15px;">${esc(value)}</div></div>`).join('')}
    </div>
    <div class="subhead">Submarket Trends</div>
    <div class="stat-grid" style="--cols:3;">
      ${trends.map(([label, value]) => `<div class="stat-box"><div class="label">${esc(label)}</div><div class="value" style="font-size:13px;">${esc(value)}</div></div>`).join('')}
    </div>
  `;
  return [pageShell(inner)];
}
