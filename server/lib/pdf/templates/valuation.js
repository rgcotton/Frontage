import { flowSection, headerBar, resolveTheme } from './layout.js';
import { esc, formatCurrency, formatMonthYear, filterStats } from '../helpers/format.js';

export function buildPages(om, ctx) {
  const theme = ctx.theme || resolveTheme(om.branding);
  const { valuation: v, cover } = om;
  const stats = filterStats([
    ['Approach', v.methodologyApproach, String],
    ['Concluded Value', v.concludedValue, formatCurrency],
    ['Effective Date', v.valueEffectiveDate, formatMonthYear],
  ]);

  if (!stats.length && !v.methodologyNarrative && !v.valueBasisNote) return [];

  const inner = `
    ${theme.components?.headerBar ? theme.components.headerBar(cover.propertyName, 'Valuation', theme.tokens, false) : headerBar(cover.propertyName, 'Valuation')}
    <div class="section-title">Valuation Methodology &amp; Conclusion</div>
    <div class="gold-rule"></div>
    ${
      stats.length
        ? `<div class="stat-grid" style="--cols:${stats.length}; margin-bottom:18px;">
      ${stats.map(([label, value]) => `<div class="stat-box"><div class="label">${esc(label)}</div><div class="value" style="font-size:14px;">${esc(value)}</div></div>`).join('')}
    </div>`
        : ''
    }
    ${v.methodologyNarrative ? `<div class="subhead" style="margin-top:0;">Methodology</div><div class="narrative">${esc(v.methodologyNarrative)}</div>` : ''}
    ${v.valueBasisNote ? `<div class="subhead">Basis of Value</div><div class="narrative">${esc(v.valueBasisNote)}</div>` : ''}
  `;
  return [flowSection(inner)];
}
