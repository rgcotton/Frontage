import { flowSection, headerBar, resolveTheme } from './layout.js';
import { esc, formatCurrency, formatPercent, filterStats } from '../helpers/format.js';

export function buildPages(om, ctx) {
  const theme = ctx.theme || resolveTheme(om.branding);
  const { executiveSummary, cover } = om;
  const stats = filterStats([
    ['Offering Price', executiveSummary.offeringPrice, formatCurrency],
    ['Cap Rate', executiveSummary.capRate, formatPercent],
    ['NOI', executiveSummary.noi, formatCurrency],
  ]);
  const highlights = (executiveSummary.highlights || []).filter(Boolean);

  if (!stats.length && !highlights.length && !executiveSummary.narrative) return [];

  const narrativeHtml = executiveSummary.narrative
    ? `<div class="subhead" style="margin-top:0;">Investment Overview</div><div class="narrative">${esc(executiveSummary.narrative)}</div>`
    : '';

  const bodyHtml = stats.length
    ? `<div class="two-col">
        <div class="col" style="flex:0 0 2.1in; display:flex; flex-direction:column; gap:10px;">
          ${stats.map(([label, value]) => bigStat(label, value, theme)).join('')}
        </div>
        <div class="col">${narrativeHtml}</div>
      </div>`
    : narrativeHtml;

  const overviewInner = `
    ${theme.components?.headerBar ? theme.components.headerBar(cover.propertyName, 'Executive Summary', theme.tokens, false) : headerBar(cover.propertyName, 'Executive Summary')}
    <div class="section-title">Executive Summary</div>
    <div class="gold-rule"></div>
    ${bodyHtml}
  `;
  const pages = [flowSection(overviewInner)];
  if (highlights.length) {
    pages.push(flowSection(`
      <div class="subhead" style="margin-top:0;">Investment Highlights</div>
      <ul class="bullet-list">${highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
    `));
  }
  return pages;
}

function bigStat(label, value, theme) {
  return `<div style="background:${theme.primaryColor}; border-radius:8px; padding:14px 13px; border-left:4px solid ${theme.accentColor};">
    <div style="font-size:9px; text-transform:uppercase; letter-spacing:0.5px; color:rgba(255,255,255,0.65); margin-bottom:6px;">${esc(label)}</div>
    <div style="font-size:24px; font-weight:700; color:#fff;">${value}</div>
  </div>`;
}
