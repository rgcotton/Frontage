import { pageShell, buildTheme } from './layout.js';
import { esc, escOrDash, formatCurrency, formatPercent, formatNumber } from '../helpers/format.js';
import { toDataUri } from '../helpers/images.js';

const PHOTO_H = 4.4; // in, 40% of the 11in page
const STATS_TOP = PHOTO_H;
const STATS_H = 1.15;
const BOTTOM_TOP = STATS_TOP + STATS_H;
const FOOTER_H = 0.45;
const FOOTER_TOP = 11 - FOOTER_H;
const LEFT_COL_W_PCT = 55;

export function buildPages(om, ctx) {
  const theme = ctx.theme || buildTheme(om.branding);
  const { cover, overview, executiveSummary, team } = om;
  const addressLine = [cover.formattedAddress || cover.addressLine1, [cover.city, cover.state].filter(Boolean).join(', '), cover.zip]
    .filter(Boolean)
    .join(', ');
  const highlights = (executiveSummary.highlights || []).filter(Boolean).slice(0, 5);
  const primary = (team || [])[0];
  const headshotUri = toDataUri(om.id, primary?.headshot);

  const stats = [
    ['Price', formatCurrency(executiveSummary.offeringPrice)],
    ['Cap Rate', formatPercent(executiveSummary.capRate)],
    ['NOI', formatCurrency(executiveSummary.noi)],
    ['Square Footage', overview.squareFootage ? `${formatNumber(overview.squareFootage)} SF` : '—'],
    ['Occupancy', overview.occupancyPct ? formatPercent(overview.occupancyPct) : '—'],
  ];

  const photoBg = ctx.coverPhotoUri
    ? `background-image: linear-gradient(180deg, rgba(17,32,59,0.05) 0%, rgba(17,32,59,0.25) 55%, rgba(17,32,59,0.88) 100%), url('${ctx.coverPhotoUri}'); background-size: cover; background-position: center;`
    : `background: linear-gradient(135deg, ${theme.primaryColor} 0%, #0c1830 100%);`;

  const statsCells = stats
    .map(
      ([label, value], i) => `
    <div style="flex:1; padding:0 14px; ${i > 0 ? `border-left:2px solid ${theme.accentColor};` : ''} text-align:center;">
      <div style="font-size:9.5px; text-transform:uppercase; letter-spacing:0.6px; color:rgba(255,255,255,0.62); margin-bottom:8px;">${esc(label)}</div>
      <div style="font-size:23px; font-weight:700; color:#fff; line-height:1;">${value}</div>
    </div>`
    )
    .join('');

  const highlightsHtml = highlights.length
    ? highlights
        .map(
          (h) =>
            `<li style="position:relative; padding-left:18px; font-size:12px; line-height:1.6; margin-bottom:11px; color:${theme.textColor};"><span style="position:absolute; left:0; top:6px; width:7px; height:7px; border-radius:50%; background:${theme.accentColor};"></span>${esc(h)}</li>`
        )
        .join('')
    : `<li style="font-size:12px; color:${theme.mutedColor};">No highlights provided.</li>`;

  const brokerageName = escOrDash(cover.brokerageName || primary?.name);
  const brokerageWebsite = esc(cover.brokerageWebsite || cover.tagline || '');

  const hasLogo = Boolean(ctx.brokerLogoUri);
  const logoBlock = hasLogo
    ? `<div style="background:#fff; border-radius:8px; padding:10px 16px; display:inline-block;"><img src="${ctx.brokerLogoUri}" style="max-width:1.7in; max-height:0.6in; object-fit:contain; display:block;" /></div>`
    : '';

  const inner = `
    <div style="position:absolute; left:0; right:0; top:0; height:${PHOTO_H}in; ${photoBg}"></div>
    <div style="position:absolute; left:0.55in; right:0.55in; bottom:${11 - PHOTO_H + 0.35}in;">
      ${cover.propertyType ? `<div style="font-size:11px; font-weight:700; letter-spacing:1.4px; color:${theme.accentColor}; text-transform:uppercase; margin-bottom:8px;">${esc(cover.propertyType)}</div>` : ''}
      <div style="font-size:36px; font-weight:700; color:#fff; line-height:1.1;">${esc(cover.propertyName) || 'Untitled Property'}</div>
      <div style="font-size:13px; color:rgba(255,255,255,0.88); margin-top:6px;">${esc(addressLine)}</div>
    </div>

    <div style="position:absolute; left:0; right:0; top:${STATS_TOP}in; height:${STATS_H}in; background:${theme.primaryColor}; display:flex; align-items:center; padding:0 0.5in;">
      ${statsCells}
    </div>

    <div style="position:absolute; left:0; width:${LEFT_COL_W_PCT}%; top:${BOTTOM_TOP}in; bottom:${FOOTER_H}in; padding:0.45in 0.4in 0.4in 0.55in; display:flex; flex-direction:column;">
      <div style="font-size:13.5px; font-weight:700; letter-spacing:0.6px; color:${theme.accentColor}; text-transform:uppercase; margin-bottom:8px;">Investment Highlights</div>
      <div style="width:46px; height:3px; background:${theme.accentColor}; margin-bottom:16px;"></div>
      <ul style="list-style:none; margin-bottom:16px;">${highlightsHtml}</ul>
      <div style="border-top:1px solid ${theme.cardBorder}; padding-top:14px; flex:1; min-height:0; overflow:hidden; display:flex; align-items:center;">
        <div style="font-size:11.5px; line-height:1.8; color:${theme.textColor}; white-space:pre-wrap;">${esc(overview.description) || 'No property description provided.'}</div>
      </div>
    </div>

    <div style="position:absolute; left:${LEFT_COL_W_PCT}%; right:0; top:${BOTTOM_TOP}in; bottom:${FOOTER_H}in; background:${theme.primaryColor}; display:flex; flex-direction:column; align-items:center; text-align:center; justify-content:${hasLogo ? 'space-between' : 'center'}; padding:0.4in 0.35in;">
      <div style="display:flex; flex-direction:column; align-items:center;">
        ${
          headshotUri
            ? `<img src="${headshotUri}" style="width:1.5in; height:1.5in; border-radius:50%; object-fit:cover; border:3px solid ${theme.accentColor};" />`
            : `<div style="width:1.5in; height:1.5in; border-radius:50%; background:rgba(255,255,255,0.12); border:3px solid ${theme.accentColor};"></div>`
        }
        <div style="font-size:21px; font-weight:700; color:#fff; margin-top:18px;">${escOrDash(primary?.name)}</div>
        <div style="font-size:12.5px; color:${theme.accentColor}; margin-top:5px; font-weight:600;">${escOrDash(primary?.title)}</div>
        <div style="width:36px; height:1px; background:rgba(255,255,255,0.25); margin:16px 0;"></div>
        <div style="font-size:11px; color:#fff; line-height:1.7;">
          ${primary?.phone ? `<div>${esc(primary.phone)}</div>` : ''}
          ${primary?.email ? `<div>${esc(primary.email)}</div>` : ''}
          ${!primary?.phone && !primary?.email ? `<div style="color:rgba(255,255,255,0.6);">Contact the brokerage team</div>` : ''}
        </div>
      </div>
      ${logoBlock}
    </div>

    <div style="position:absolute; left:0; right:0; top:${FOOTER_TOP}in; height:${FOOTER_H}in; background:${theme.accentColor}; display:flex; align-items:center; justify-content:space-between; padding:0 0.5in;">
      <div style="font-size:12.5px; font-weight:700; color:#fff;">${brokerageName}</div>
      <div style="font-size:10.5px; color:rgba(255,255,255,0.9);">${brokerageWebsite}</div>
    </div>
  `;
  return [pageShell(inner)];
}
