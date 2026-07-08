import { flowSection, headerBar, resolveTheme } from './layout.js';
import { esc } from '../helpers/format.js';
import { toDataUri } from '../helpers/images.js';

export function buildPages(om, ctx) {
  const theme = ctx.theme || resolveTheme(om.branding);
  const team = om.team || [];
  const cover = om.cover;
  if (!team.length) return [];

  const cards = team
    .map((m, i) => {
      const headshotUri = toDataUri(om.id, m.headshot);
      const marginStyle = i < team.length - 1 ? 'margin-bottom:12px;' : '';
      const textContent = `
        <div style="flex:1; padding:18px 20px; display:flex; flex-direction:column;">
          ${m.name ? `<div style="font-size:18px; font-weight:700; color:${theme.primaryColor};">${esc(m.name)}</div>` : ''}
          ${m.title ? `<div style="font-size:12px; color:${theme.mutedColor}; margin-bottom:8px;">${esc(m.title)}</div>` : ''}
          <div style="display:flex; gap:13px; font-size:10px; color:${theme.textColor}; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid ${theme.cardBorder};">
            ${m.phone ? `<span>${esc(m.phone)}</span>` : ''}
            ${m.email ? `<span>${esc(m.email)}</span>` : ''}
          </div>
          ${m.bio ? `<div class="narrative">${esc(m.bio)}</div>` : ''}
        </div>`;

      if (headshotUri) {
        return `<div style="display:flex; min-height:2in; border-radius:8px; overflow:hidden; border:1px solid ${theme.cardBorder}; ${marginStyle} break-inside:avoid; page-break-inside:avoid;">
          <div style="flex:0 0 35%; position:relative;">
            <img src="${headshotUri}" style="width:100%; height:100%; object-fit:cover; display:block;" />
            <div style="position:absolute; left:0; top:0; bottom:0; width:6px; background:${theme.accentColor};"></div>
          </div>
          ${textContent}
        </div>`;
      }
      return `<div style="display:flex; min-height:1.4in; border-radius:8px; overflow:hidden; border:1px solid ${theme.cardBorder}; border-left:6px solid ${theme.accentColor}; ${marginStyle} break-inside:avoid; page-break-inside:avoid;">
        ${textContent}
      </div>`;
    })
    .join('');

  const inner = `
    ${theme.components?.headerBar ? theme.components.headerBar(cover.propertyName, 'Meet the Team', theme.tokens, false) : headerBar(cover.propertyName, 'Meet the Team')}
    <div class="section-title">Meet the Team</div>
    <div class="gold-rule"></div>
    ${cards}
  `;
  return [flowSection(inner)];
}
