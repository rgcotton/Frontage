import { pageShell, headerBar, buildTheme } from './layout.js';
import { esc, escOrDash, formatCurrency, formatMonthYear } from '../helpers/format.js';

export function buildPages(om, ctx) {
  const theme = ctx.theme || buildTheme(om.branding);
  const { valuation: v, cover } = om;

  const inner = `
    ${headerBar(cover.propertyName, 'Valuation')}
    <div class="section-title">Valuation Methodology &amp; Conclusion</div>
    <div class="gold-rule"></div>
    <div class="stat-grid" style="--cols:3; margin-bottom:18px;">
      <div class="stat-box"><div class="label">Approach</div><div class="value" style="font-size:14px;">${escOrDash(v.methodologyApproach)}</div></div>
      <div class="stat-box"><div class="label">Concluded Value</div><div class="value">${formatCurrency(v.concludedValue)}</div></div>
      <div class="stat-box"><div class="label">Effective Date</div><div class="value" style="font-size:14px;">${v.valueEffectiveDate ? formatMonthYear(v.valueEffectiveDate) : '—'}</div></div>
    </div>
    <div class="subhead" style="margin-top:0;">Methodology</div>
    <div class="narrative">${esc(v.methodologyNarrative) || 'No methodology narrative provided.'}</div>
    ${v.valueBasisNote ? `<div class="subhead">Basis of Value</div><div class="narrative">${esc(v.valueBasisNote)}</div>` : ''}
  `;
  return [pageShell(inner)];
}
