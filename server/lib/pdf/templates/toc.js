import { pageShell, headerBar, buildTheme } from './layout.js';
import { esc } from '../helpers/format.js';

export function buildPages(om, entries) {
  const theme = buildTheme(om.branding);
  const rows = entries
    .map(
      (e, i) => `
    <div style="display:flex; align-items:baseline; padding:14px 0; border-bottom:1px solid ${theme.cardBorder};">
      <div style="font-size:11px; color:${theme.primaryColor}; font-weight:700; width:30px;">${String(i + 1).padStart(2, '0')}</div>
      <div style="flex:1; font-size:13px; color:${theme.textColor}; font-weight:600;">${esc(e.label)}</div>
      <div style="font-size:13px; color:${theme.accentColor}; font-weight:700;">${e.startPage}</div>
    </div>`
    )
    .join('');

  const inner = `
    ${headerBar(om.cover.propertyName, 'Table of Contents')}
    <div class="section-title">Table of Contents</div>
    <div class="gold-rule"></div>
    <div style="margin-top:10px;">${rows}</div>
  `;
  return [pageShell(inner)];
}
