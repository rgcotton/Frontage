import { pageShell, buildTheme, buildDocument } from './layout.js';
import { esc, formatCurrency, formatPercent, formatNumber } from '../helpers/format.js';
import { toDataUri } from '../helpers/images.js';

const PHOTO_H = 4.4;
const STATS_TOP = PHOTO_H;
const FOOTER_H = 0.45;
const FOOTER_TOP = 11 - FOOTER_H;
const LEFT_COL_W_PCT = 72;
const MAX_POIS = 4;
const MAX_HIGHLIGHTS = 4;
export const PX_PER_IN = 96;

const BASE_TYPE = { micro: 9, small: 10.5, base: 12, label: 13, section: 15.5, name: 19, stat: 24, display: 34 };
function makeType(scale = 1) {
  return Object.fromEntries(Object.entries(BASE_TYPE).map(([k, v]) => [k, `${+(v * scale).toFixed(2)}px`]));
}
// Scale a px value
function sp(n, s) { return `${Math.round(n * s)}px`; }
// Scale an inches value
function si(n, s) { return `${+(n * s).toFixed(4)}in`; }

function splitHighlight(text) {
  const match = text.match(/^(.+?[.!?])\s+(.+)$/);
  if (match) return { headline: match[1].replace(/[.!?]$/, ''), support: match[2] };
  return { headline: text, support: '' };
}

function checkBadge(accentColor, s) {
  const sz = Math.round(17 * s);
  return `<div style="flex:0 0 ${sz}px; width:${sz}px; height:${sz}px; border-radius:50%; background:${accentColor}; display:flex; align-items:center; justify-content:center; margin-top:${sp(1, s)};">
    <svg width="${Math.round(9*s)}" height="${Math.round(9*s)}" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.2 11.7L13 4.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>`;
}

function pinIcon(accentColor) {
  return `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${accentColor}"/><circle cx="12" cy="9" r="2.5" fill="#fff"/></svg>`;
}

// Inner content builders — shared by buildPages and buildMeasurementHtml

function buildHighlightsInner(highlights, theme, T, s) {
  return highlights
    .map((h, i) => {
      const { headline, support } = splitHighlight(h);
      return `<div style="display:flex; gap:${sp(9, s)}; align-items:flex-start; padding:${sp(3, s)} 0; ${i < highlights.length - 1 ? `border-bottom:1px solid ${theme.cardBorder};` : ''}">
        ${checkBadge(theme.accentColor, s)}
        <div>
          <div style="font-size:${T.label}; font-weight:700; color:${theme.primaryColor}; line-height:1.2;">${esc(headline)}</div>
          ${support ? `<div style="font-size:${T.small}; color:${theme.mutedColor}; line-height:1.25; margin-top:${sp(1, s)};">${esc(support)}</div>` : ''}
        </div>
      </div>`;
    })
    .join('');
}

function buildPoisInner(pois, theme, T, s) {
  return pois
    .map(
      (p, i) => `<div style="display:flex; align-items:center; gap:${sp(8, s)}; padding:${sp(3, s)} 0; ${i < pois.length - 1 ? `border-bottom:1px solid ${theme.cardBorder};` : ''}">
        ${pinIcon(theme.accentColor)}
        <div style="flex:1; font-size:${T.label}; font-weight:600; color:${theme.textColor};">${esc(p.name)}</div>
        <div style="font-size:${T.label}; font-weight:700; color:${theme.accentColor}; white-space:nowrap;">${typeof p.driveTimeMinutes === 'number' ? `${p.driveTimeMinutes} min` : ''}</div>
      </div>`
    )
    .join('');
}

function buildBrokerInner(primary, headshotUri, hasLogo, logoBlock, theme, T, s) {
  const avatarSize = sp(48, s);
  const avatarEl = (() => {
    if (headshotUri) {
      return `<img src="${headshotUri}" style="width:${avatarSize}; height:${avatarSize}; border-radius:50%; object-fit:cover; border:2px solid ${theme.accentColor};" />`;
    }
    const initials = primary?.name
      ? primary.name.trim().split(/\s+/).map((w) => w[0].toUpperCase()).slice(0, 2).join('')
      : '';
    if (!initials) return '';
    return `<div style="width:${avatarSize}; height:${avatarSize}; border-radius:50%; background:${theme.primaryColor}; border:2px solid ${theme.accentColor}; display:flex; align-items:center; justify-content:center; font-size:${sp(16, s)}; font-weight:700; color:#fff; letter-spacing:${sp(1, s)};">${initials}</div>`;
  })();
  return `
    ${avatarEl}
    ${primary?.name ? `<div style="font-size:${T.base}; font-weight:700; color:#fff; margin-top:${sp(8, s)};">${esc(primary.name)}</div>` : ''}
    ${primary?.title ? `<div style="font-size:${T.small}; color:${theme.accentColor}; margin-top:${sp(2, s)}; font-weight:600;">${esc(primary.title)}</div>` : ''}
    <div style="width:${sp(28, s)}; height:1px; background:rgba(255,255,255,0.25); margin:${sp(8, s)} 0;"></div>
    <div style="font-size:${T.micro}; color:#fff; line-height:1.6;">
      ${primary?.phone ? `<div>${esc(primary.phone)}</div>` : ''}
      ${primary?.email ? `<div>${esc(primary.email)}</div>` : ''}
    </div>
    ${hasLogo ? `<div style="margin-top:${si(0.15, s)};">${logoBlock}</div>` : ''}
  `;
}

// params shape:
//   scaleFactor     – uniform scale for fonts and padding (default 1)
//   statsHOverride  – override computed statsH in inches (default null → auto)
//   cardBases       – { 'highlights': px, 'deal-summary': px, 'drive-times': px }
//   cardJustify     – { 'highlights': 'space-between'|'flex-start', 'drive-times': ... }
//   highlightsOverride – trimmed highlights array (for item-dropping)
//   poisOverride       – trimmed pois array (for item-dropping)
export function buildPages(om, ctx, params = {}) {
  const {
    scaleFactor = 1,
    statsHOverride = null,
    cardBases = {},
    cardJustify = {},
    highlightsOverride = null,
    poisOverride = null,
  } = params;
  const s = scaleFactor;
  const T = makeType(s);

  const theme = ctx.theme || buildTheme(om.branding);
  const { cover, overview, executiveSummary, team } = om;
  const addressLine = [cover.formattedAddress || cover.addressLine1, [cover.city, cover.state].filter(Boolean).join(', '), cover.zip]
    .filter(Boolean)
    .join(', ');

  const allHighlights = cover.onePagerHighlights
    ? cover.onePagerHighlights.split('\n').map((x) => x.trim()).filter(Boolean).slice(0, MAX_HIGHLIGHTS)
    : (executiveSummary.highlights || []).filter(Boolean).slice(0, MAX_HIGHLIGHTS);
  const highlights = highlightsOverride ?? allHighlights;

  const allPois = (om.driveTimePois || []).slice(0, MAX_POIS);
  const pois = poisOverride ?? allPois;

  const primary = (team || [])[0];
  const headshotUri = toDataUri(om.id, primary?.headshot);

  const rawStats = [
    ['Price', executiveSummary.offeringPrice, () => formatCurrency(executiveSummary.offeringPrice)],
    ['Cap Rate', executiveSummary.capRate, () => formatPercent(executiveSummary.capRate)],
    ['NOI', executiveSummary.noi, () => formatCurrency(executiveSummary.noi)],
    ['Square Footage', overview.squareFootage, () => `${formatNumber(overview.squareFootage)} SF`],
    ['Occupancy', overview.occupancyPct, () => formatPercent(overview.occupancyPct)],
  ];
  const stats = rawStats.filter(([, raw]) => Boolean(raw)).map(([label, , display]) => [label, display()]);
  const naturalStatsH = stats.length <= 2 ? 0.8 : 0.95;
  const statsH = statsHOverride !== null ? statsHOverride : naturalStatsH;
  const bottomTop = stats.length ? STATS_TOP + statsH : STATS_TOP;

  const photoBg = ctx.coverPhotoUri
    ? `background-image: linear-gradient(180deg, rgba(17,32,59,0.05) 0%, rgba(17,32,59,0.25) 55%, rgba(17,32,59,0.88) 100%), url('${ctx.coverPhotoUri}'); background-size: cover; background-position: center;`
    : `background: linear-gradient(135deg, ${theme.primaryColor} 0%, #0c1830 100%);`;

  const statsCells = stats
    .map(
      ([label, value], i) => `
      <div style="flex:1; padding:0 ${sp(14, s)}; ${i > 0 ? `border-left:1.5px solid rgba(255,255,255,0.3);` : ''} text-align:center;">
        <div style="font-size:${T.micro}; text-transform:uppercase; letter-spacing:${+(0.6*s).toFixed(2)}px; color:rgba(255,255,255,0.62); margin-bottom:${sp(7, s)};">${esc(label)}</div>
        <div style="font-size:${T.stat}; font-weight:700; color:#fff; line-height:1;">${esc(value)}</div>
      </div>`
    )
    .join('');

  const highlightsInner = highlights.length ? buildHighlightsInner(highlights, theme, T, s) : '';
  const poisInner = pois.length ? buildPoisInner(pois, theme, T, s) : '';

  const brokerageNameRaw = cover.brokerageName || primary?.name;
  const brokerageName = brokerageNameRaw ? esc(brokerageNameRaw) : '';
  const brokerageWebsite = esc(cover.brokerageWebsite || cover.tagline || '');
  const hasLogo = Boolean(ctx.brokerLogoUri);
  const logoBlock = hasLogo ? `<img src="${ctx.brokerLogoUri}" style="max-width:1.7in; max-height:0.6in; object-fit:contain; display:block;" />` : '';

  // Card flex styles: use explicit basis when provided (extra-space mode),
  // otherwise size to content (natural or scale-down mode).
  const cardFlexStyle = (key, fallback) => {
    const basis = cardBases[key];
    return basis !== undefined
      ? `flex-basis:${basis.toFixed(1)}px; flex-grow:0; flex-shrink:0;`
      : fallback;
  };
  const cardJustifyStyle = (key) => cardJustify[key] ?? 'flex-start';

  const cardPad = `${si(0.14, s)} ${si(0.2, s)}`;
  const cardBase = (key) => `background:${theme.statBoxBg}; border:1px solid ${theme.cardBorder}; border-top:3px solid ${theme.accentColor}; border-radius:8px; padding:${cardPad}; display:flex; flex-direction:column;`;

  const highlightsCard = highlightsInner
    ? `<div style="${cardBase('highlights')} ${cardFlexStyle('highlights', 'flex:0 1 auto; min-height:0;')} justify-content:${cardJustifyStyle('highlights')}; overflow:hidden;">
        <div style="font-size:${T.section}; font-weight:700; letter-spacing:${+(0.5*s).toFixed(2)}px; color:${theme.primaryColor}; text-transform:uppercase; margin-bottom:${sp(5, s)};">Investment Highlights</div>
        ${highlightsInner}
      </div>`
    : '';

  // Drive-times: POI rows are direct flex children so space-between distributes between them
  const driveTimesCard = poisInner
    ? `<div style="${cardBase('drive-times')} ${cardFlexStyle('drive-times', 'flex:0 0 auto;')} justify-content:${cardJustifyStyle('drive-times')};">
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:${sp(4, s)};">
          <div style="font-size:${T.section}; font-weight:700; letter-spacing:${+(0.5*s).toFixed(2)}px; color:${theme.primaryColor}; text-transform:uppercase;">Drive Times</div>
          <div style="font-size:${T.micro}; color:${theme.mutedColor}; text-transform:uppercase; letter-spacing:${+(0.4*s).toFixed(2)}px;">From Property</div>
        </div>
        ${poisInner}
      </div>`
    : '';

  const dealSummaryCard = cover.onePagerDealSummary
    ? `<div style="${cardBase('deal-summary')} ${cardFlexStyle('deal-summary', 'flex:0 0 auto;')} justify-content:flex-start;">
        <div style="font-size:${T.section}; font-weight:700; letter-spacing:${+(0.5*s).toFixed(2)}px; color:${theme.primaryColor}; text-transform:uppercase; margin-bottom:${sp(5, s)};">Deal Summary</div>
        <div style="font-size:${T.base}; color:${theme.textColor}; line-height:1.45;">${esc(cover.onePagerDealSummary)}</div>
      </div>`
    : '';

  const brokerInner = buildBrokerInner(primary, headshotUri, hasLogo, logoBlock, theme, T, s);

  const inner = `
    <div style="position:absolute; left:0; right:0; top:0; height:${PHOTO_H}in; ${photoBg}"></div>
    <div style="position:absolute; left:0.55in; right:0.55in; bottom:${11 - PHOTO_H + 0.35}in;">
      ${cover.propertyType ? `<div style="font-size:${T.small}; font-weight:700; letter-spacing:1.4px; color:${theme.accentColor}; text-transform:uppercase; margin-bottom:${sp(8, s)};">${esc(cover.propertyType)}</div>` : ''}
      <div style="font-size:${T.display}; font-weight:700; color:#fff; line-height:1.1;">${esc(cover.propertyName) || 'Untitled Property'}</div>
      ${cover.tagline ? `<div style="font-size:${T.label}; font-weight:600; font-style:italic; color:${theme.accentColor}; margin-top:${sp(8, s)};">${esc(cover.tagline)}</div>` : ''}
      <div style="font-size:${T.label}; color:rgba(255,255,255,0.88); margin-top:${sp(6, s)};">${esc(addressLine)}</div>
    </div>

    ${stats.length
      ? `<div style="position:absolute; left:0; right:0; top:${STATS_TOP}in; height:${statsH}in; background:${theme.primaryColor}; border-top:3px solid ${theme.accentColor}; display:flex; align-items:center; padding:0 ${si(0.5, s)};">
          ${statsCells}
        </div>`
      : ''}

    <div style="position:absolute; left:0; right:0; top:${bottomTop}in; bottom:${FOOTER_H}in; display:flex; flex-direction:row; overflow:hidden;">
      <div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:${si(0.1, s)}; padding:${si(0.25, s)}; overflow:hidden;">
        ${dealSummaryCard}
        ${highlightsCard}
        <div style="flex:1; min-height:0;"></div>
        ${driveTimesCard}
      </div>
      <div style="flex:0 0 ${100 - LEFT_COL_W_PCT}%; background:${theme.primaryColor}; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:${si(0.2, s)}; box-sizing:border-box;">
        ${brokerInner}
      </div>
    </div>

    <div style="position:absolute; left:0; right:0; top:${FOOTER_TOP}in; height:${FOOTER_H}in; background:${theme.accentColor}; display:flex; align-items:center; justify-content:space-between; padding:0 0.5in;">
      <div style="font-size:${T.label}; font-weight:700; color:#fff;">${brokerageName}</div>
      <div style="font-size:${T.small}; color:rgba(255,255,255,0.9);">${brokerageWebsite}</div>
    </div>
  `;
  return [pageShell(inner)];
}

// Renders the left-column cards in a plain flow layout (no page constraints) so
// Puppeteer can measure their natural scroll heights before the real render.
export function buildMeasurementHtml(om, ctx) {
  const theme = ctx.theme || buildTheme(om.branding);
  const { cover, executiveSummary, team } = om;
  const T = makeType(1);
  const s = 1;

  const allHighlights = cover.onePagerHighlights
    ? cover.onePagerHighlights.split('\n').map((x) => x.trim()).filter(Boolean).slice(0, MAX_HIGHLIGHTS)
    : (executiveSummary.highlights || []).filter(Boolean).slice(0, MAX_HIGHLIGHTS);
  const pois = (om.driveTimePois || []).slice(0, MAX_POIS);
  const primary = (team || [])[0];
  const headshotUri = toDataUri(om.id, primary?.headshot);
  const hasLogo = Boolean(ctx.brokerLogoUri);
  const logoBlock = hasLogo ? `<img src="${ctx.brokerLogoUri}" style="max-width:1.7in; max-height:0.6in; object-fit:contain; display:block;" />` : '';

  const highlightsInner = allHighlights.length ? buildHighlightsInner(allHighlights, theme, T, s) : '';
  const poisInner = pois.length ? buildPoisInner(pois, theme, T, s) : '';
  const brokerInner = buildBrokerInner(primary, headshotUri, hasLogo, logoBlock, theme, T, s);

  const cardPad = `0.14in 0.2in`;
  const cardBase = `background:${theme.statBoxBg}; border:1px solid ${theme.cardBorder}; border-top:3px solid ${theme.accentColor}; border-radius:8px; padding:${cardPad}; display:flex; flex-direction:column;`;

  const leftColW = Math.round(816 * LEFT_COL_W_PCT / 100);
  const rightColW = 816 - leftColW;

  const body = `
    <div style="display:flex; width:816px;">
      <div style="width:${leftColW}px; display:flex; flex-direction:column; gap:0.1in; padding:0.25in;">
        ${cover.onePagerDealSummary
          ? `<div data-measure="deal-summary" style="${cardBase}">
              <div style="font-size:${T.section}; font-weight:700; letter-spacing:0.5px; color:${theme.primaryColor}; text-transform:uppercase; margin-bottom:5px;">Deal Summary</div>
              <div style="font-size:${T.base}; color:${theme.textColor}; line-height:1.45;">${esc(cover.onePagerDealSummary)}</div>
            </div>`
          : ''}
        ${highlightsInner
          ? `<div data-measure="highlights" style="${cardBase}">
              <div style="font-size:${T.section}; font-weight:700; letter-spacing:0.5px; color:${theme.primaryColor}; text-transform:uppercase; margin-bottom:5px;">Investment Highlights</div>
              ${highlightsInner}
            </div>`
          : ''}
        ${poisInner
          ? `<div data-measure="drive-times" style="${cardBase}">
              <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
                <div style="font-size:${T.section}; font-weight:700; letter-spacing:0.5px; color:${theme.primaryColor}; text-transform:uppercase;">Drive Times</div>
                <div style="font-size:${T.micro}; color:${theme.mutedColor}; text-transform:uppercase; letter-spacing:0.4px;">From Property</div>
              </div>
              ${poisInner}
            </div>`
          : ''}
      </div>
      <div data-measure="broker-col" style="width:${rightColW}px; padding:0.2in; display:flex; flex-direction:column; align-items:center;">
        ${brokerInner}
      </div>
    </div>
  `;
  return buildDocument(body, theme);
}
