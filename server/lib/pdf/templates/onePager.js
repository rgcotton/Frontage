import { pageShell, buildTheme } from './layout.js';
import { esc, formatCurrency, formatPercent, formatNumber } from '../helpers/format.js';
import { toDataUri } from '../helpers/images.js';

const PHOTO_H = 4.4; // in, 40% of the 11in page
const STATS_TOP = PHOTO_H;
const STATS_H = 1.15;
const BOTTOM_TOP = STATS_TOP + STATS_H;
const FOOTER_H = 0.45;
const FOOTER_TOP = 11 - FOOTER_H;
const LEFT_COL_W_PCT = 55;
const DESCRIPTION_MAX_CHARS = 320;

// One consistent type scale used everywhere on this page, instead of ad-hoc
// one-off font sizes per element.
const TYPE = {
  micro: '9px', // stat labels
  small: '10.5px', // support copy, contact info, footer subtext, eyebrow tag
  base: '12px', // body copy (description, highlight support)
  label: '13px', // address line, broker title, highlight headline
  section: '15.5px', // section headers, brokerage name
  name: '19px', // broker name
  stat: '24px', // stat values
  display: '34px', // property name
};

function splitHighlight(text) {
  const match = text.match(/^(.+?[.!?])\s+(.+)$/);
  if (match) return { headline: match[1].replace(/[.!?]$/, ''), support: match[2] };
  return { headline: text, support: '' };
}

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

function checkBadge(accentColor) {
  return `<div style="flex:0 0 17px; width:17px; height:17px; border-radius:50%; background:${accentColor}; display:flex; align-items:center; justify-content:center; margin-top:1px;">
    <svg width="9" height="9" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.2 11.7L13 4.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>`;
}

export function buildPages(om, ctx) {
  const theme = ctx.theme || buildTheme(om.branding);
  const { cover, overview, executiveSummary, team } = om;
  const addressLine = [cover.formattedAddress || cover.addressLine1, [cover.city, cover.state].filter(Boolean).join(', '), cover.zip]
    .filter(Boolean)
    .join(', ');
  const highlights = (executiveSummary.highlights || []).filter(Boolean).slice(0, 4);
  const primary = (team || [])[0];
  const headshotUri = toDataUri(om.id, primary?.headshot);
  const descriptionText = truncateText(overview.description, DESCRIPTION_MAX_CHARS);

  const rawStats = [
    ['Price', executiveSummary.offeringPrice, () => formatCurrency(executiveSummary.offeringPrice)],
    ['Cap Rate', executiveSummary.capRate, () => formatPercent(executiveSummary.capRate)],
    ['NOI', executiveSummary.noi, () => formatCurrency(executiveSummary.noi)],
    ['Square Footage', overview.squareFootage, () => `${formatNumber(overview.squareFootage)} SF`],
    ['Occupancy', overview.occupancyPct, () => formatPercent(overview.occupancyPct)],
  ];
  const stats = rawStats.filter(([, raw]) => Boolean(raw)).map(([label, , display]) => [label, display()]);
  const bottomTop = stats.length ? BOTTOM_TOP : STATS_TOP;

  const photoBg = ctx.coverPhotoUri
    ? `background-image: linear-gradient(180deg, rgba(17,32,59,0.05) 0%, rgba(17,32,59,0.25) 55%, rgba(17,32,59,0.88) 100%), url('${ctx.coverPhotoUri}'); background-size: cover; background-position: center;`
    : `background: linear-gradient(135deg, ${theme.primaryColor} 0%, #0c1830 100%);`;

  const statsCells = stats
    .map(
      ([label, value], i) => `
    <div style="flex:1; padding:0 14px; ${i > 0 ? `border-left:1.5px solid rgba(255,255,255,0.3);` : ''} text-align:center;">
      <div style="font-size:${TYPE.micro}; text-transform:uppercase; letter-spacing:0.6px; color:rgba(255,255,255,0.62); margin-bottom:7px;">${esc(label)}</div>
      <div style="font-size:${TYPE.stat}; font-weight:700; color:#fff; line-height:1;">${esc(value)}</div>
    </div>`
    )
    .join('');

  const highlightItems = highlights.map((h) => splitHighlight(h));
  const highlightsHtml = highlightItems.length
    ? highlightItems
        .map(
          ({ headline, support }, i) => `<div style="display:flex; gap:10px; align-items:flex-start; padding:7px 0; ${i < highlightItems.length - 1 ? `border-bottom:1px solid ${theme.cardBorder};` : ''}">
            ${checkBadge(theme.accentColor)}
            <div>
              <div style="font-size:${TYPE.label}; font-weight:700; color:${theme.primaryColor}; line-height:1.3;">${esc(headline)}</div>
              ${support ? `<div style="font-size:${TYPE.small}; color:${theme.mutedColor}; line-height:1.4; margin-top:2px;">${esc(support)}</div>` : ''}
            </div>
          </div>`
        )
        .join('')
    : '';

  const brokerageNameRaw = cover.brokerageName || primary?.name;
  const brokerageName = brokerageNameRaw ? esc(brokerageNameRaw) : '';
  const brokerageWebsite = esc(cover.brokerageWebsite || cover.tagline || '');

  const hasLogo = Boolean(ctx.brokerLogoUri);
  const logoBlock = hasLogo
    ? `<div style="background:#fff; border-radius:8px; padding:10px 16px; display:inline-block;"><img src="${ctx.brokerLogoUri}" style="max-width:1.7in; max-height:0.6in; object-fit:contain; display:block;" /></div>`
    : '';

  const inner = `
    <div style="position:absolute; left:0; right:0; top:0; height:${PHOTO_H}in; ${photoBg}"></div>
    <div style="position:absolute; left:0.55in; right:0.55in; bottom:${11 - PHOTO_H + 0.35}in;">
      ${cover.propertyType ? `<div style="font-size:${TYPE.small}; font-weight:700; letter-spacing:1.4px; color:${theme.accentColor}; text-transform:uppercase; margin-bottom:8px;">${esc(cover.propertyType)}</div>` : ''}
      <div style="font-size:${TYPE.display}; font-weight:700; color:#fff; line-height:1.1;">${esc(cover.propertyName) || 'Untitled Property'}</div>
      ${cover.tagline ? `<div style="font-size:${TYPE.label}; font-weight:600; font-style:italic; color:${theme.accentColor}; margin-top:8px;">${esc(cover.tagline)}</div>` : ''}
      <div style="font-size:${TYPE.label}; color:rgba(255,255,255,0.88); margin-top:6px;">${esc(addressLine)}</div>
    </div>

    ${
      stats.length
        ? `<div style="position:absolute; left:0; right:0; top:${STATS_TOP}in; height:${STATS_H}in; background:${theme.primaryColor}; border-top:3px solid ${theme.accentColor}; display:flex; align-items:center; padding:0 0.5in;">
      ${statsCells}
    </div>`
        : ''
    }

    <div style="position:absolute; left:0; width:${LEFT_COL_W_PCT}%; top:${bottomTop}in; bottom:${FOOTER_H}in; padding:0.4in; display:flex; flex-direction:column;">
      <div style="background:${theme.statBoxBg}; border:1px solid ${theme.cardBorder}; border-top:3px solid ${theme.accentColor}; border-radius:8px; flex:1; min-height:0; padding:0.32in 0.34in; display:flex; flex-direction:column;">
        <div style="font-size:${TYPE.section}; font-weight:700; letter-spacing:0.5px; color:${theme.primaryColor}; text-transform:uppercase; margin-bottom:14px;">Investment Highlights</div>
        ${highlightsHtml ? `<div>${highlightsHtml}</div>` : ''}
        ${
          descriptionText
            ? `<div style="${highlightsHtml ? `border-top:1px solid ${theme.cardBorder}; margin-top:14px; padding-top:14px;` : ''} flex:1; min-height:0; overflow:hidden;">
          <div style="font-size:${TYPE.base}; line-height:1.7; color:${theme.textColor}; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:4; overflow:hidden;">${esc(descriptionText)}</div>
        </div>`
            : ''
        }
      </div>
    </div>

    <div style="position:absolute; left:${LEFT_COL_W_PCT}%; right:0; top:${bottomTop}in; bottom:${FOOTER_H}in; background:${theme.primaryColor}; display:flex; flex-direction:column; align-items:center; text-align:center; justify-content:${hasLogo ? 'space-between' : 'center'}; padding:0.4in 0.35in;">
      <div style="display:flex; flex-direction:column; align-items:center;">
        ${
          headshotUri
            ? `<img src="${headshotUri}" style="width:1.5in; height:1.5in; border-radius:50%; object-fit:cover; border:3px solid ${theme.accentColor};" />`
            : `<div style="width:1.5in; height:1.5in; border-radius:50%; background:rgba(255,255,255,0.12); border:3px solid ${theme.accentColor};"></div>`
        }
        ${primary?.name ? `<div style="font-size:${TYPE.name}; font-weight:700; color:#fff; margin-top:18px;">${esc(primary.name)}</div>` : ''}
        ${primary?.title ? `<div style="font-size:${TYPE.label}; color:${theme.accentColor}; margin-top:5px; font-weight:600;">${esc(primary.title)}</div>` : ''}
        <div style="width:36px; height:1px; background:rgba(255,255,255,0.25); margin:16px 0;"></div>
        <div style="font-size:${TYPE.small}; color:#fff; line-height:1.7;">
          ${primary?.phone ? `<div>${esc(primary.phone)}</div>` : ''}
          ${primary?.email ? `<div>${esc(primary.email)}</div>` : ''}
        </div>
      </div>
      ${logoBlock}
    </div>

    <div style="position:absolute; left:0; right:0; top:${FOOTER_TOP}in; height:${FOOTER_H}in; background:${theme.accentColor}; display:flex; align-items:center; justify-content:space-between; padding:0 0.5in;">
      <div style="font-size:${TYPE.label}; font-weight:700; color:#fff;">${brokerageName}</div>
      <div style="font-size:${TYPE.small}; color:rgba(255,255,255,0.9);">${brokerageWebsite}</div>
    </div>
  `;
  return [pageShell(inner)];
}
