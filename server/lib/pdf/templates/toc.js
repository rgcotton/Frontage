import { pageShell, headerBar, NAVY, GOLD } from './layout.js';
import { esc } from '../helpers/format.js';

export function buildPages(om, entries) {
  const rows = entries
    .map(
      (e, i) => `
    <div style="display:flex; align-items:baseline; padding:14px 0; border-bottom:1px solid #E7E9EC;">
      <div style="font-size:11px; color:${NAVY}; font-weight:700; width:30px;">${String(i + 1).padStart(2, '0')}</div>
      <div style="flex:1; font-size:13px; color:#33363D; font-weight:600;">${esc(e.label)}</div>
      <div style="font-size:13px; color:${GOLD}; font-weight:700;">${e.startPage}</div>
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
