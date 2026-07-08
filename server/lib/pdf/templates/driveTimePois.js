import { flowSection, headerBar, resolveTheme } from './layout.js';
import { esc } from '../helpers/format.js';

export function buildPages(om, ctx) {
  const theme = ctx.theme || resolveTheme(om.branding);
  const { cover } = om;
  const pois = om.driveTimePois || [];
  if (!pois.length) return [];

  const rows = pois
    .map(
      (p) => `<tr>
      <td>${esc(p.name) || '—'}</td>
      <td>${esc(p.category) || '—'}</td>
      <td>${esc(p.address) || '—'}</td>
      <td style="text-align:right; font-weight:700;">${typeof p.driveTimeMinutes === 'number' ? `${p.driveTimeMinutes} min` : ''}</td>
    </tr>`
    )
    .join('');

  const inner = `
    ${theme.components?.headerBar ? theme.components.headerBar(cover.propertyName, 'Drive Times & Points of Interest', theme.tokens, false) : headerBar(cover.propertyName, 'Drive Times & Points of Interest')}
    <div class="section-title">Drive Times &amp; Points of Interest</div>
    <div class="gold-rule"></div>
    <table class="pdf-table">
      <thead><tr><th>Point of Interest</th><th>Category</th><th>Address</th><th style="text-align:right;">Drive Time</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  return [flowSection(inner)];
}
