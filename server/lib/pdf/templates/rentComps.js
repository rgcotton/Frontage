import { pageShell, headerBar } from './layout.js';
import { escOrDash, formatNumber } from '../helpers/format.js';
import { googleMapsSearchUrl } from '../../maps.js';

function addressLink(address) {
  const text = escOrDash(address);
  const url = address ? googleMapsSearchUrl(address) : null;
  return url ? `<a class="pdf-link" href="${url}">${text}</a>` : text;
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
        <div class="field-row"><span class="l">Tenant</span><span class="v">${escOrDash(c.tenant)}</span></div>
        <div class="field-row"><span class="l">Rent / SF</span><span class="v">${escOrDash(c.rentPerSF)}</span></div>
        <div class="field-row"><span class="l">Lease Term</span><span class="v">${escOrDash(c.leaseTerm)}</span></div>
        <div class="field-row"><span class="l">Square Feet</span><span class="v">${c.squareFeet ? `${formatNumber(c.squareFeet)} SF` : '—'}</span></div>
        <div class="field-row" style="border-bottom:none;"><span class="l">Lease Type</span><span class="v">${escOrDash(c.leaseType)}</span></div>
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
