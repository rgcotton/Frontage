import { pageShell, headerBar } from './layout.js';
import { esc } from '../helpers/format.js';

export function buildPages(om, ctx) {
  const { cover } = om;
  const addressLine = [cover.formattedAddress || cover.addressLine1, [cover.city, cover.state].filter(Boolean).join(', '), cover.zip]
    .filter(Boolean)
    .join(', ');
  const mapBlock = ctx.staticMapUri
    ? `<img src="${ctx.staticMapUri}" style="width:100%; height:5.6in; object-fit:cover; border-radius:8px; border:1px solid #E7E9EC;" />`
    : `<div style="width:100%; height:5.6in; background:#F2F3F5; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#8A8D93; font-size:11px; text-align:center; padding:0 1in;">Map preview unavailable. Configure GOOGLE_MAPS_API_KEY and a valid property address to display nearby amenities and demand drivers here.</div>`;

  const inner = `
    ${headerBar(cover.propertyName, 'Location & Amenities')}
    <div class="section-title">Location &amp; Amenities</div>
    <div class="section-subtitle">${esc(addressLine) || 'Address not provided'}</div>
    <div class="gold-rule"></div>
    ${mapBlock}
  `;
  return [pageShell(inner)];
}
