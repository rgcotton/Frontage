import { pageShell, headerBar, buildTheme } from './layout.js';
import { esc } from '../helpers/format.js';

export function buildPages(om, entries) {
  const theme = buildTheme(om.branding);

  const rows = entries
    .map(
      (e, i) => `
    <div style="display:flex; align-items:center; padding:15px 0; border-bottom:1px solid ${theme.cardBorder};">
      <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; color:${theme.accentColor}; width:38px; flex-shrink:0;">${String(e.number ?? i + 1).padStart(2, '0')}</div>
      <div style="flex:1; font-size:13.5px; font-weight:600; color:${theme.primaryColor};">${esc(e.label)}</div>
    </div>`
    )
    .join('');

  const inner = `
    ${headerBar(om.cover.propertyName, 'Table of Contents')}
    <div class="section-title">Document Contents</div>
    <div class="gold-rule"></div>
    <div style="margin-top:8px;">${rows}</div>
    <div style="margin-top:auto; padding-top:24px; border-top:1px solid ${theme.cardBorder}; font-size:8.5px; color:${theme.mutedColor}; line-height:1.6;">
      This document is strictly confidential and intended solely for the named recipient. All information has been obtained from sources believed reliable but is not guaranteed as to accuracy or completeness.
    </div>
  `;
  return [pageShell(inner)];
}
