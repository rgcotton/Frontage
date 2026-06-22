import { pageShell, NAVY, GOLD } from './layout.js';
import { esc, formatCurrency, formatPercent, formatNumber } from '../helpers/format.js';

export function buildPages(om, ctx) {
  const { cover, executiveSummary, overview } = om;
  const addressLine = [
    cover.formattedAddress || cover.addressLine1,
    [cover.city, cover.state].filter(Boolean).join(', '),
    cover.zip,
  ]
    .filter(Boolean)
    .join(' • ');

  const bgStyle = ctx.coverPhotoUri
    ? `background-image: linear-gradient(180deg, rgba(17,32,59,0.25) 0%, rgba(17,32,59,0.55) 55%, rgba(17,32,59,0.92) 100%), url('${ctx.coverPhotoUri}'); background-size: cover; background-position: center;`
    : `background: linear-gradient(135deg, ${NAVY} 0%, #0c1830 100%);`;

  const sfDisplay = overview.squareFootage ? `${formatNumber(overview.squareFootage)} SF` : '—';

  const inner = `
    <div style="position:absolute; inset:0; ${bgStyle}"></div>
    <div style="position:absolute; left:0.6in; right:0.6in; top:0.7in;">
      <div style="display:inline-block; background:${GOLD}; color:${NAVY}; font-size:10px; font-weight:700; letter-spacing:1.5px; padding:7px 14px; border-radius:3px;">OFFERING MEMORANDUM</div>
    </div>
    <div style="position:absolute; left:0.6in; right:0.6in; bottom:2.55in; color:#fff;">
      ${cover.propertyType ? `<div style="font-size:11px; font-weight:700; letter-spacing:1.5px; color:${GOLD}; margin-bottom:10px; text-transform:uppercase;">${esc(cover.propertyType)}</div>` : ''}
      <div style="font-size:38px; font-weight:700; line-height:1.1; margin-bottom:12px;">${esc(cover.propertyName) || 'Untitled Property'}</div>
      <div style="font-size:14px; opacity:0.92;">${esc(addressLine)}</div>
      ${cover.tagline ? `<div style="font-size:13px; opacity:0.78; font-style:italic; margin-top:6px;">${esc(cover.tagline)}</div>` : ''}
    </div>
    <div style="position:absolute; left:0; right:0; bottom:0.85in; padding:0 0.6in;">
      <div style="display:flex; background:rgba(255,255,255,0.08); border-top:1px solid rgba(255,255,255,0.25); border-bottom:1px solid rgba(255,255,255,0.25);">
        ${statCell('Offering Price', formatCurrency(executiveSummary.offeringPrice), false)}
        ${statCell('Cap Rate', formatPercent(executiveSummary.capRate), true)}
        ${statCell('NOI', formatCurrency(executiveSummary.noi), true)}
        ${statCell('Square Footage', sfDisplay, true)}
      </div>
    </div>
    <div style="position:absolute; left:0.6in; right:0.6in; bottom:0.4in; color:rgba(255,255,255,0.65); font-size:7.5px; line-height:1.4;">
      This Offering Memorandum has been prepared solely for informational purposes and is strictly confidential. It is intended for review by the recipient only and may not be reproduced or distributed without the prior written consent of the broker of record. The information contained herein has been obtained from sources believed to be reliable but has not been independently verified.
    </div>
  `;
  return [pageShell(inner)];
}

function statCell(label, value, divider) {
  return `<div style="flex:1; padding:16px 18px; ${divider ? 'border-left:1px solid rgba(255,255,255,0.2);' : ''}">
    <div style="font-size:8.5px; text-transform:uppercase; letter-spacing:0.5px; color:rgba(255,255,255,0.6); margin-bottom:5px;">${label}</div>
    <div style="font-size:18px; font-weight:700; color:#fff;">${value}</div>
  </div>`;
}
