import { pageShell, headerBar } from './layout.js';
import { esc, escOrDash, formatCurrency, formatPercent, formatMonthYear, formatNumber } from '../helpers/format.js';
import { toDataUri } from '../helpers/images.js';

const COMPS_PER_PAGE = 4;

export function buildPages(om, ctx) {
  const comps = om.salesComps || [];
  const cover = om.cover;
  if (!comps.length) {
    return [
      pageShell(`
      ${headerBar(cover.propertyName, 'Sales Comparables')}
      <div class="section-title">Sales Comparables</div>
      <div class="gold-rule"></div>
      <div class="narrative">No sales comparables provided.</div>
    `),
    ];
  }
  const pages = [];
  for (let i = 0; i < comps.length; i += COMPS_PER_PAGE) {
    const slice = comps.slice(i, i + COMPS_PER_PAGE);
    const isFirst = i === 0;
    const cards = slice
      .map((c) => {
        const photoUri = toDataUri(om.id, c.photo);
        return `<div class="comp-card">
        ${photoUri ? `<img class="photo" src="${photoUri}" />` : `<div class="photo-placeholder"></div>`}
        <div class="body">
          <div class="addr">${escOrDash(c.address)}</div>
          <div class="field-row"><span class="l">Sale Date</span><span class="v">${formatMonthYear(c.saleDate)}</span></div>
          <div class="field-row"><span class="l">Sale Price</span><span class="v">${formatCurrency(c.salePrice)}</span></div>
          <div class="field-row"><span class="l">Price / SF</span><span class="v">${formatCurrency(c.pricePerSF)}</span></div>
          <div class="field-row"><span class="l">Cap Rate</span><span class="v">${formatPercent(c.capRate)}</span></div>
          <div class="field-row" style="border-bottom:none;"><span class="l">Square Feet</span><span class="v">${c.squareFeet ? `${formatNumber(c.squareFeet)} SF` : '—'}</span></div>
          ${c.notes ? `<div class="notes">${esc(c.notes)}</div>` : ''}
        </div>
      </div>`;
      })
      .join('');
    const inner = `
      ${headerBar(cover.propertyName, 'Sales Comparables', !isFirst)}
      <div class="section-title">Sales Comparables</div>
      <div class="gold-rule"></div>
      <div class="card-grid">${cards}</div>
    `;
    pages.push(pageShell(inner));
  }
  return pages;
}
