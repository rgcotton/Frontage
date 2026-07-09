import { esc } from '../helpers/format.js';
import { buildFontFaceCss } from '../fonts/manifest.js';
import { resolveTheme } from '../themes/index.js';

export const NAVY = '#1A2B4C';
export const NAVY_DARK = '#11203B';
export const GOLD = '#C9A227';
export const CHARCOAL = '#33363D';
export const LIGHT_GRAY = '#F2F3F5';
export const MUTED = '#8A8D93';

const BACKGROUND_PRESETS = {
  white: {
    pageBg: '#FFFFFF',
    textColor: '#33363D',
    mutedColor: '#8A8D93',
    statBoxBg: '#F2F3F5',
    tableStripe: '#F7F8F9',
    cardBorder: '#E7E9EC',
    totalRowBg: '#FFFFFF',
  },
  lightGray: {
    pageBg: '#F2F3F5',
    textColor: '#33363D',
    mutedColor: '#6B6E74',
    statBoxBg: '#FFFFFF',
    tableStripe: '#E7E9EC',
    cardBorder: '#D8DADE',
    totalRowBg: '#F2F3F5',
  },
  darkNavy: {
    pageBg: '#11203B',
    textColor: '#F2F3F5',
    mutedColor: '#A7AEBD',
    statBoxBg: 'rgba(255,255,255,0.08)',
    tableStripe: 'rgba(255,255,255,0.05)',
    cardBorder: 'rgba(255,255,255,0.18)',
    totalRowBg: '#11203B',
  },
};

export const FONT_PRESETS = {
  modern: {
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    headingFont: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    bodyFont: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    headingWeight: 700,
    titleSize: '21px',
  },
  classic: {
    fontFamily: "Georgia, 'Times New Roman', Times, serif",
    headingFont: "Georgia, 'Times New Roman', Times, serif",
    bodyFont: "Georgia, 'Times New Roman', Times, serif",
    headingWeight: 700,
    titleSize: '21px',
  },
  bold: {
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    headingFont: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    bodyFont: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    headingWeight: 800,
    titleSize: '24px',
  },
  'elegant-serif': {
    headingFont: "Georgia, 'Times New Roman', serif",
    bodyFont: "'Palatino Linotype', Palatino, Georgia, serif",
    headingWeight: 700,
    titleSize: '21px',
  },
  'geometric-sans': {
    headingFont: "'Trebuchet MS', Helvetica, Arial, sans-serif",
    bodyFont: "'Trebuchet MS', Arial, Helvetica, sans-serif",
    headingWeight: 700,
    titleSize: '21px',
  },
};

export function buildTheme(branding = {}) {
  // Backward-compat alias: returns the resolved theme's tokens merged with the theme object
  // so legacy callers that expect a flat token object still work.
  const resolved = resolveTheme(branding);
  return { ...resolved, ...resolved.tokens };
}

// ── Legacy CSS functions (used as fallbacks when theme has no components) ──────

function legacyPageChromeCss(t) {
  return `
.pdf-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 13px;
  flex-shrink: 0;
}
.pdf-header-bar .prop-name {
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: ${t.primaryColor};
  padding: 5px 10px;
  border-radius: 3px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.pdf-header-bar .section-name {
  font-size: 10.5px;
  font-weight: 700;
  color: ${t.accentColor};
  letter-spacing: 0.6px;
  text-transform: uppercase;
}
.section-title { font-size: ${t.titleSize}; font-weight: ${t.headingWeight}; color: ${t.primaryColor}; margin-bottom: 4px; }
.section-subtitle { font-size: 12px; color: ${t.mutedColor}; margin-bottom: 10px; }
.gold-rule { width: 54px; height: 3px; background: ${t.accentColor}; margin-bottom: 11px; flex-shrink: 0; }
.stat-grid { display: grid; grid-template-columns: repeat(var(--cols, 3), 1fr); gap: 8px; }
.stat-box { background: ${t.statBoxBg}; border-radius: 6px; padding: 9px 11px; }
.stat-box .label { font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.4px; color: ${t.mutedColor}; margin-bottom: 4px; }
.stat-box .value { font-size: 17px; font-weight: 700; color: ${t.primaryColor}; line-height: 1.2; }
.subhead { font-size: 12px; font-weight: ${t.headingWeight}; color: ${t.primaryColor}; margin-bottom: 6px; margin-top: 11px; }`;
}

function legacyTableCss(t) {
  return `
table.pdf-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
table.pdf-table th {
  background: ${t.primaryColor};
  color: #fff;
  text-align: left;
  padding: 5px 6px;
  font-size: 8.5px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 700;
}
table.pdf-table td { padding: 4px 6px; border-bottom: 1px solid ${t.cardBorder}; color: ${t.textColor}; }
table.pdf-table tr:nth-child(even) td { background: ${t.tableStripe}; }
table.pdf-table tr.total-row td { font-weight: 700; color: ${t.primaryColor}; border-top: 2px solid ${t.primaryColor}; background: ${t.totalRowBg}; }`;
}

function legacyCompCardCss(t) {
  return `
.card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.comp-card { border: 1px solid ${t.cardBorder}; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
.comp-card .photo { width: 100%; height: 0.8in; object-fit: cover; background: ${t.statBoxBg}; display: block; }
.comp-card .photo-placeholder { width: 100%; height: 0.8in; background: ${t.statBoxBg}; }
.comp-card .body { padding: 8px 9px; flex: 1; }
.comp-card .body .addr { font-weight: 700; color: ${t.primaryColor}; font-size: 11.5px; margin-bottom: 6px; }
.comp-card .field-row { display: flex; justify-content: space-between; font-size: 9.5px; padding: 2px 0; border-bottom: 1px dashed ${t.cardBorder}; }
.comp-card .field-row .l { color: ${t.mutedColor}; }
.comp-card .field-row .v { font-weight: 600; color: ${t.textColor}; text-align: right; }
.comp-card .notes { font-size: 9px; color: ${t.mutedColor}; margin-top: 6px; font-style: italic; }`;
}

function buildSharedCss(theme) {
  // Accept both full resolved theme objects and legacy flat token objects
  const t = (theme && theme.tokens) ? theme.tokens : (theme || buildTheme());
  // Ensure we have font properties, falling back to legacy defaults
  const fontFamily = t.fontFamily || `'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif`;
  return `
${buildFontFaceCss()}
@page { margin: 0.38in 0.42in; size: 8.5in 11in; background-color: ${t.pageBg}; }
@page fixed-page { margin: 0; size: 8.5in 11in; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { font-family: ${fontFamily}; color: ${t.textColor}; background: ${t.pageBg}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.pdf-page {
  page: fixed-page;
  width: 8.5in;
  height: 11in;
  position: relative;
  overflow: hidden;
  page-break-after: always;
  background: ${t.pageBg};
}
.pdf-page:last-child { page-break-after: auto; }
.pdf-page-content {
  position: absolute;
  inset: 0;
  padding: 0.38in 0.42in 0.38in;
  display: flex;
  flex-direction: column;
}
.pdf-footer {
  position: absolute;
  left: 0.6in;
  right: 0.6in;
  bottom: 0.22in;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 8px;
  color: ${t.mutedColor};
  border-top: 1px solid ${t.cardBorder};
  padding-top: 4px;
  letter-spacing: 0.2px;
}
.two-col { display: flex; gap: 17px; flex: 1; min-height: 0; break-inside: avoid; page-break-inside: avoid; }
.two-col .col { flex: 1; min-width: 0; }
.bullet-list { list-style: none; break-inside: avoid; page-break-inside: avoid; }
.bullet-list li { position: relative; padding-left: 16px; font-size: 10.5px; line-height: 1.5; margin-bottom: 6px; color: ${t.textColor}; }
.bullet-list li::before { content: ''; position: absolute; left: 0; top: 6px; width: 5px; height: 5px; border-radius: 50%; background: ${t.accentColor}; }
.narrative { font-size: 10.5px; line-height: 1.6; color: ${t.textColor}; white-space: pre-wrap; }
.pdf-link { color: inherit; text-decoration: underline; text-decoration-color: currentColor; }
.pdf-flow-body {
  width: 100%;
  padding: 0;
  background: ${t.pageBg};
}
.pdf-flow-section {
  margin-bottom: 0.18in;
}
.pdf-flow-section .pdf-header-bar {
  break-after: avoid;
  page-break-after: avoid;
}
.pdf-flow-section .section-title {
  break-after: avoid;
  page-break-after: avoid;
}
.pdf-flow-section .gold-rule {
  break-after: avoid;
  page-break-after: avoid;
}
.pdf-flow-section .subhead {
  break-after: avoid;
  page-break-after: avoid;
}
.pdf-flow-body + .pdf-page {
  break-before: page;
  page-break-before: always;
}
table.pdf-table tr {
  break-inside: avoid;
  page-break-inside: avoid;
}
.comp-card {
  break-inside: avoid;
  page-break-inside: avoid;
}
/* Theme component overrides — do NOT re-specify structural print rules (break-inside, page-break-inside) already defined above */
${theme && theme.components ? theme.components.tableCss(t) : legacyTableCss(t)}
${theme && theme.components ? theme.components.compCardCss(t) : legacyCompCardCss(t)}
${theme && theme.components ? theme.components.pageChromeCss(t) : legacyPageChromeCss(t)}
`;
}

export function pageShell(innerHtml, extraClass = '') {
  return `<section class="pdf-page ${extraClass}"><div class="pdf-page-content">${innerHtml}</div></section>`;
}

export function flowSection(innerHtml, breakBefore = false) {
  const style = breakBefore ? ' style="break-before:page; page-break-before:always;"' : '';
  return `<div class="pdf-flow-section"${style}>${innerHtml}</div>`;
}

export function headerBar(propertyName, sectionLabel, continued = false) {
  return `<div class="pdf-header-bar">
    <span class="prop-name">${esc(propertyName || 'Offering Memorandum')}</span>
    <span class="section-name">${esc(sectionLabel)}${continued ? ' (Continued)' : ''}</span>
  </div>`;
}

export function footerHtml(propertyName) {
  return `<div class="pdf-footer">
    <span>Confidential Offering Memorandum &mdash; ${esc(propertyName || 'Property')}</span>
    <span>Strictly Private &amp; Confidential</span>
  </div>`;
}

export function buildDocument(bodyHtml, theme) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>${buildSharedCss(theme)}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

// Re-export for section templates to import from one place
export { resolveTheme } from '../themes/index.js';
