import { flowSection, headerBar, buildTheme } from './layout.js';
import { esc, escOrDash } from '../helpers/format.js';

export function buildPages(om, ctx) {
  const theme = ctx.theme || buildTheme(om.branding);
  const { recommendation: r, cover } = om;

  if (!r.recommendedAction && !r.narrative) return [];

  const inner = `
    ${headerBar(cover.propertyName, 'Recommendation')}
    <div class="section-title">Broker Recommendation</div>
    <div class="gold-rule"></div>
    ${
      r.recommendedAction
        ? `<div class="stat-grid" style="--cols:1; margin-bottom:18px;"><div class="stat-box"><div class="label">Recommended Action</div><div class="value">${escOrDash(r.recommendedAction)}</div></div></div>`
        : ''
    }
    ${r.narrative ? `<div class="narrative">${esc(r.narrative)}</div>` : ''}
  `;
  return [flowSection(inner)];
}
