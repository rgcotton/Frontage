import { pageShell, headerBar, NAVY, GOLD } from './layout.js';
import { esc, formatCurrency, formatPercent } from '../helpers/format.js';

export function buildPages(om, ctx) {
  const { executiveSummary, cover } = om;
  const stats = [
    ['Offering Price', formatCurrency(executiveSummary.offeringPrice)],
    ['Cap Rate', formatPercent(executiveSummary.capRate)],
    ['NOI', formatCurrency(executiveSummary.noi)],
  ];
  const highlights = (executiveSummary.highlights || []).filter(Boolean);

  const inner = `
    ${headerBar(cover.propertyName, 'Executive Summary')}
    <div class="section-title">Executive Summary</div>
    <div class="gold-rule"></div>
    <div class="two-col">
      <div class="col" style="flex:0 0 2.1in; display:flex; flex-direction:column; gap:14px;">
        ${stats.map(([label, value]) => bigStat(label, value)).join('')}
      </div>
      <div class="col">
        <div class="subhead" style="margin-top:0;">Investment Overview</div>
        <div class="narrative">${esc(executiveSummary.narrative) || 'No summary provided.'}</div>
        ${
          highlights.length
            ? `<div class="subhead">Investment Highlights</div>
        <ul class="bullet-list">${highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>`
            : ''
        }
      </div>
    </div>
  `;
  return [pageShell(inner)];
}

function bigStat(label, value) {
  return `<div style="background:${NAVY}; border-radius:8px; padding:20px 18px; border-left:4px solid ${GOLD};">
    <div style="font-size:9px; text-transform:uppercase; letter-spacing:0.5px; color:rgba(255,255,255,0.65); margin-bottom:8px;">${esc(label)}</div>
    <div style="font-size:24px; font-weight:700; color:#fff;">${value}</div>
  </div>`;
}
