import { pageShell, headerBar } from './layout.js';
import { esc, escOrDash, formatCurrency, formatPercent, formatMonthYear, formatNumber } from '../helpers/format.js';
import { toDataUri } from '../helpers/images.js';
import { googleMapsSearchUrl } from '../../maps.js';

function addressLink(address) {
  const text = escOrDash(address);
  const url = address ? googleMapsSearchUrl(address) : null;
  return url ? `<a class="pdf-link" href="${url}">${text}</a>` : text;
}

function fieldRows(rows) {
  const present = rows.filter(([, value]) => Boolean(value));
  return present
    .map(
      ([label, value, formatFn = esc], i) =>
        `<div class="field-row"${i === present.length - 1 ? ' style="border-bottom:none;"' : ''}><span class="l">${label}</span><span class="v">${formatFn(value)}</span></div>`
    )
    .join('');
}

const COMPS_PER_PAGE = 4;

export function buildPages(om, ctx) {
  const comps = om.salesComps || [];
  const cover = om.cover;
  if (!comps.length) return [];
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
          <div class="addr">${addressLink(c.address)}</div>
          ${fieldRows([
            ['Sale Date', c.saleDate, formatMonthYear],
            ['Sale Price', c.salePrice, formatCurrency],
            ['Price / SF', c.pricePerSF, formatCurrency],
            ['Cap Rate', c.capRate, formatPercent],
            ['Square Feet', c.squareFeet, (v) => `${formatNumber(v)} SF`],
          ])}
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
