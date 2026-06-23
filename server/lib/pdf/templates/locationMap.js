import { pageShell, headerBar, buildTheme } from './layout.js';
import { esc } from '../helpers/format.js';

function mapBlock(uri, theme, height, placeholderText) {
  return uri
    ? `<img src="${uri}" style="width:100%; height:${height}in; object-fit:cover; border-radius:8px; border:1px solid ${theme.cardBorder};" />`
    : `<div style="width:100%; height:${height}in; background:${theme.statBoxBg}; border-radius:8px; display:flex; align-items:center; justify-content:center; color:${theme.mutedColor}; font-size:11px; text-align:center; padding:0 1in;">${placeholderText}</div>`;
}

export function buildPages(om, ctx) {
  const theme = ctx.theme || buildTheme(om.branding);
  const { cover } = om;
  const addressLine = [cover.formattedAddress || cover.addressLine1, [cover.city, cover.state].filter(Boolean).join(', '), cover.zip]
    .filter(Boolean)
    .join(', ');
  const placeholder = 'Map preview unavailable. Configure GOOGLE_MAPS_API_KEY and a valid property address to display nearby amenities and demand drivers here.';

  const inner = `
    ${headerBar(cover.propertyName, 'Location & Amenities')}
    <div class="section-title">Location &amp; Amenities</div>
    <div class="section-subtitle">${esc(addressLine) || 'Address not provided'}</div>
    <div class="gold-rule"></div>
    <div class="subhead" style="margin-top:0;">Street View</div>
    ${mapBlock(ctx.streetMapUri, theme, 3.7, placeholder)}
    <div class="subhead">Regional Overview</div>
    ${mapBlock(ctx.regionalMapUri, theme, 2.3, placeholder)}
  `;
  return [pageShell(inner)];
}
