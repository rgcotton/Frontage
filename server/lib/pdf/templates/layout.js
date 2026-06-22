import { esc } from '../helpers/format.js';

export const NAVY = '#1A2B4C';
export const NAVY_DARK = '#11203B';
export const GOLD = '#C9A227';
export const CHARCOAL = '#33363D';
export const LIGHT_GRAY = '#F2F3F5';
export const MUTED = '#8A8D93';

const SHARED_CSS = `
@page { margin: 0; size: 8.5in 11in; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${CHARCOAL}; }
.pdf-page {
  width: 8.5in;
  height: 11in;
  position: relative;
  overflow: hidden;
  page-break-after: always;
  background: #fff;
}
.pdf-page:last-child { page-break-after: auto; }
.pdf-page-content {
  position: absolute;
  inset: 0;
  padding: 0.55in 0.6in 0.55in;
  display: flex;
  flex-direction: column;
}
.pdf-footer {
  position: absolute;
  left: 0.6in;
  right: 0.6in;
  bottom: 0.32in;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 8px;
  color: ${MUTED};
  border-top: 1px solid #E7E9EC;
  padding-top: 6px;
  letter-spacing: 0.2px;
}
.pdf-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  flex-shrink: 0;
}
.pdf-header-bar .prop-name {
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: ${NAVY};
  padding: 7px 14px;
  border-radius: 3px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.pdf-header-bar .section-name {
  font-size: 10.5px;
  font-weight: 700;
  color: ${GOLD};
  letter-spacing: 0.6px;
  text-transform: uppercase;
}
.section-title { font-size: 21px; font-weight: 700; color: ${NAVY}; margin-bottom: 6px; }
.section-subtitle { font-size: 12px; color: ${MUTED}; margin-bottom: 14px; }
.gold-rule { width: 54px; height: 3px; background: ${GOLD}; margin-bottom: 16px; flex-shrink: 0; }
.stat-grid { display: grid; grid-template-columns: repeat(var(--cols, 3), 1fr); gap: 12px; }
.stat-box { background: ${LIGHT_GRAY}; border-radius: 6px; padding: 13px 15px; }
.stat-box .label { font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.4px; color: ${MUTED}; margin-bottom: 6px; }
.stat-box .value { font-size: 17px; font-weight: 700; color: ${NAVY}; line-height: 1.2; }
table.pdf-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
table.pdf-table th {
  background: ${NAVY};
  color: #fff;
  text-align: left;
  padding: 7px 9px;
  font-size: 8.5px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 700;
}
table.pdf-table td { padding: 6px 9px; border-bottom: 1px solid #E7E9EC; color: ${CHARCOAL}; }
table.pdf-table tr:nth-child(even) td { background: #F7F8F9; }
table.pdf-table tr.total-row td { font-weight: 700; color: ${NAVY}; border-top: 2px solid ${NAVY}; background: #fff; }
.card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.comp-card { border: 1px solid #E7E9EC; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
.comp-card .photo { width: 100%; height: 1.15in; object-fit: cover; background: ${LIGHT_GRAY}; display: block; }
.comp-card .photo-placeholder { width: 100%; height: 1.15in; background: ${LIGHT_GRAY}; }
.comp-card .body { padding: 11px 13px; flex: 1; }
.comp-card .body .addr { font-weight: 700; color: ${NAVY}; font-size: 11.5px; margin-bottom: 8px; }
.comp-card .field-row { display: flex; justify-content: space-between; font-size: 9.5px; padding: 3px 0; border-bottom: 1px dashed #E7E9EC; }
.comp-card .field-row .l { color: ${MUTED}; }
.comp-card .field-row .v { font-weight: 600; color: ${CHARCOAL}; text-align: right; }
.comp-card .notes { font-size: 9px; color: ${MUTED}; margin-top: 8px; font-style: italic; }
.two-col { display: flex; gap: 24px; flex: 1; min-height: 0; }
.two-col .col { flex: 1; min-width: 0; }
.bullet-list { list-style: none; }
.bullet-list li { position: relative; padding-left: 16px; font-size: 10.5px; line-height: 1.5; margin-bottom: 8px; color: ${CHARCOAL}; }
.bullet-list li::before { content: ''; position: absolute; left: 0; top: 6px; width: 5px; height: 5px; border-radius: 50%; background: ${GOLD}; }
.narrative { font-size: 10.5px; line-height: 1.6; color: ${CHARCOAL}; white-space: pre-wrap; }
.subhead { font-size: 12px; font-weight: 700; color: ${NAVY}; margin-bottom: 8px; margin-top: 16px; }
`;

export function pageShell(innerHtml, extraClass = '') {
  return `<section class="pdf-page ${extraClass}"><div class="pdf-page-content">${innerHtml}</div></section>`;
}

export function headerBar(propertyName, sectionLabel, continued = false) {
  return `<div class="pdf-header-bar">
    <span class="prop-name">${esc(propertyName || 'Offering Memorandum')}</span>
    <span class="section-name">${esc(sectionLabel)}${continued ? ' (Continued)' : ''}</span>
  </div>`;
}

export function footerHtml(pageNumber, totalPages, propertyName) {
  return `<div class="pdf-footer">
    <span>Confidential Offering Memorandum &mdash; ${esc(propertyName || 'Property')}</span>
    <span>Page ${pageNumber} of ${totalPages}</span>
  </div>`;
}

export function buildDocument(bodyHtml) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>${SHARED_CSS}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}
