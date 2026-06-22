import { pageShell, headerBar } from './layout.js';
import { esc, formatNumber, formatPercent } from '../helpers/format.js';
import { toDataUri } from '../helpers/images.js';

export function buildPages(om, ctx) {
  const { overview, cover } = om;
  const isMultifamily = cover.propertyType === 'Multifamily';

  const stats = [
    ['Year Built', overview.yearBuilt || '—'],
    ['Square Footage', overview.squareFootage ? `${formatNumber(overview.squareFootage)} SF` : '—'],
    ['Lot Size', overview.lotSize || '—'],
    ['Occupancy', overview.occupancyPct ? formatPercent(overview.occupancyPct) : '—'],
    ['Zoning', overview.zoning || '—'],
    ['Parking', overview.parking || '—'],
  ];
  if (isMultifamily) stats.splice(3, 0, ['Units', overview.units || '—']);
  const cols = stats.length % 3 === 0 ? 3 : 4;

  const photos = (overview.photos || [])
    .map((f) => toDataUri(om.id, f))
    .filter(Boolean)
    .slice(0, 6);

  const photoGridHtml = photos.length
    ? `<div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:16px;">
        ${photos.map((p) => `<img src="${p}" style="width:100%; height:1.35in; object-fit:cover; border-radius:5px;" />`).join('')}
      </div>`
    : '';

  const inner = `
    ${headerBar(cover.propertyName, 'Property Overview')}
    <div class="section-title">Property Overview</div>
    <div class="gold-rule"></div>
    ${photoGridHtml}
    <div class="stat-grid" style="--cols:${cols}; margin-bottom:16px;">
      ${stats.map(([label, value]) => `<div class="stat-box"><div class="label">${esc(label)}</div><div class="value">${esc(value)}</div></div>`).join('')}
    </div>
    <div class="subhead" style="margin-top:0;">Description</div>
    <div class="narrative" style="flex:1; overflow:hidden;">${esc(overview.description) || 'No description provided.'}</div>
  `;
  return [pageShell(inner)];
}
