import { pageShell, buildTheme } from './layout.js';
import { esc, escOrDash, formatCurrency, formatPercent, formatNumber } from '../helpers/format.js';

export function buildPages(om, ctx) {
  const theme = ctx.theme || buildTheme(om.branding);
  const { cover, overview, executiveSummary, team } = om;
  const addressLine = [cover.formattedAddress || cover.addressLine1, [cover.city, cover.state].filter(Boolean).join(', '), cover.zip]
    .filter(Boolean)
    .join(', ');
  const highlights = (executiveSummary.highlights || []).filter(Boolean).slice(0, 3);
  const primary = (team || [])[0];

  const stats = [
    ['Price', formatCurrency(executiveSummary.offeringPrice)],
    ['Cap Rate', formatPercent(executiveSummary.capRate)],
    ['NOI', formatCurrency(executiveSummary.noi)],
    ['Square Footage', overview.squareFootage ? `${formatNumber(overview.squareFootage)} SF` : '—'],
    ['Occupancy', overview.occupancyPct ? formatPercent(overview.occupancyPct) : '—'],
  ];

  const photoBand = ctx.coverPhotoUri
    ? `background-image: linear-gradient(180deg, rgba(17,32,59,0.05) 0%, rgba(17,32,59,0.35) 100%), url('${ctx.coverPhotoUri}'); background-size: cover; background-position: center;`
    : `background: linear-gradient(135deg, ${theme.primaryColor} 0%, #0c1830 100%);`;

  const inner = `
    <div style="position:absolute; left:0; right:0; top:0; height:3.4in; ${photoBand}"></div>
    <div style="position:absolute; left:0.6in; right:0.6in; top:3.55in;">
      ${cover.propertyType ? `<div style="font-size:9.5px; font-weight:700; letter-spacing:1.2px; color:${theme.accentColor}; text-transform:uppercase; margin-bottom:6px;">${esc(cover.propertyType)}</div>` : ''}
      <div style="font-size:25px; font-weight:700; color:${theme.primaryColor}; line-height:1.15;">${esc(cover.propertyName) || 'Untitled Property'}</div>
      <div style="font-size:11px; color:${theme.mutedColor}; margin-top:4px;">${esc(addressLine)}</div>
    </div>
    <div style="position:absolute; left:0.6in; right:0.6in; top:4.65in;">
      <div class="stat-grid" style="--cols:5;">
        ${stats.map(([label, value]) => `<div class="stat-box"><div class="label">${label}</div><div class="value" style="font-size:14px;">${value}</div></div>`).join('')}
      </div>
    </div>
    <div style="position:absolute; left:0.6in; right:0.6in; top:5.95in;">
      <div class="subhead" style="margin-top:0;">Investment Highlights</div>
      <ul class="bullet-list">${highlights.map((h) => `<li>${esc(h)}</li>`).join('') || '<li>No highlights provided.</li>'}</ul>
    </div>
    <div style="position:absolute; left:0.6in; right:0.6in; bottom:0.55in; border-top:1px solid ${theme.cardBorder}; padding-top:14px;">
      <div style="font-size:13px; font-weight:700; color:${theme.primaryColor};">${escOrDash(primary?.name)}</div>
      <div style="font-size:10px; color:${theme.mutedColor};">${[primary?.title, primary?.phone, primary?.email].filter(Boolean).join('  •  ') || 'Contact the brokerage team for more information.'}</div>
    </div>
  `;
  return [pageShell(inner)];
}
