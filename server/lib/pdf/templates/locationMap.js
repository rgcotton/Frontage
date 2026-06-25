import { flowSection, headerBar, buildTheme } from './layout.js';
import { esc } from '../helpers/format.js';

function mapBlock(uri, height, cardBorder) {
  if (!uri) return '';
  return `<img src="${uri}" style="width:100%; height:${height}in; object-fit:cover; border-radius:8px; border:1px solid ${cardBorder};" />`;
}

export function buildPages(om, ctx) {
  const theme = ctx.theme || buildTheme(om.branding);
  const { cover } = om;

  if (!ctx.streetMapUri && !ctx.regionalMapUri) return [];

  const addressLine = [cover.formattedAddress || cover.addressLine1, [cover.city, cover.state].filter(Boolean).join(', '), cover.zip]
    .filter(Boolean)
    .join(', ');

  const streetBlock = ctx.streetMapUri
    ? `<div class="subhead" style="margin-top:0;">Street View</div>${mapBlock(ctx.streetMapUri, 3.7, theme.cardBorder)}`
    : '';
  const regionalBlock = ctx.regionalMapUri
    ? `<div class="subhead">Regional Overview</div>${mapBlock(ctx.regionalMapUri, 2.3, theme.cardBorder)}`
    : '';

  const inner = `
    ${headerBar(cover.propertyName, 'Location & Amenities')}
    <div class="section-title">Location &amp; Amenities</div>
    ${addressLine ? `<div class="section-subtitle">${esc(addressLine)}</div>` : ''}
    <div class="gold-rule"></div>
    ${streetBlock}
    ${regionalBlock}
  `;
  return [flowSection(inner)];
}
