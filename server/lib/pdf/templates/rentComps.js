import { flowSection, headerBar, resolveTheme } from './layout.js';
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

export function buildPages(om, ctx) {
  const theme = ctx.theme || resolveTheme(om.branding);
  const comps = om.rentComps || [];
  const cover = om.cover;
  if (!comps.length) return [];

  const cards = comps
    .map(
      (c) => `<div class="comp-card">
      <div class="body" style="padding-top:10px;">
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
    ${theme.components?.headerBar ? theme.components.headerBar(cover.propertyName, 'Rent Comparables', theme.tokens, false) : headerBar(cover.propertyName, 'Rent Comparables')}
    <div class="section-title">Rent Comparables</div>
    <div class="gold-rule"></div>
    <div class="card-grid">${cards}</div>
  `;
  return [flowSection(inner)];
}
