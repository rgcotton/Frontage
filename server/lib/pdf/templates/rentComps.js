import { pageShell, headerBar } from './layout.js';
import { esc, escOrDash, formatNumber } from '../helpers/format.js';
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
  const comps = om.rentComps || [];
  const cover = om.cover;
  if (!comps.length) {
    return [
      pageShell(`
      ${headerBar(cover.propertyName, 'Rent Comparables')}
      <div class="section-title">Rent Comparables</div>
      <div class="gold-rule"></div>
      <div class="narrative">No rent comparables provided.</div>
    `),
    ];
  }
  const pages = [];
  for (let i = 0; i < comps.length; i += COMPS_PER_PAGE) {
    const slice = comps.slice(i, i + COMPS_PER_PAGE);
    const isFirst = i === 0;
    const cards = slice
      .map(
        (c) => `<div class="comp-card">
      <div class="body" style="padding-top:14px;">
        <div class="addr">${addressLink(c.address)}</div>
        ${fieldRows([
          ['Tenant', c.tenant],
          ['Rent / SF', c.rentPerSF],
          ['Lease Term', c.leaseTerm],
          ['Square Feet', c.squareFeet, (v) => `${formatNumber(v)} SF`],
          ['Lease Type', c.leaseType],
        ])}
      </div>
    </div>`
      )
      .join('');
    const inner = `
      ${headerBar(cover.propertyName, 'Rent Comparables', !isFirst)}
      <div class="section-title">Rent Comparables</div>
      <div class="gold-rule"></div>
      <div class="card-grid">${cards}</div>
    `;
    pages.push(pageShell(inner));
  }
  return pages;
}
