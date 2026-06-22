import { pageShell, headerBar, GOLD, NAVY } from './layout.js';
import { esc, escOrDash } from '../helpers/format.js';
import { toDataUri } from '../helpers/images.js';

export function buildPages(om, ctx) {
  const team = om.team || [];
  const cover = om.cover;
  if (!team.length) {
    return [
      pageShell(`
      ${headerBar(cover.propertyName, 'Meet the Team')}
      <div class="section-title">Meet the Team</div>
      <div class="gold-rule"></div>
      <div class="narrative">No team members provided.</div>
    `),
    ];
  }
  return team.map((m, i) => {
    const headshotUri = toDataUri(om.id, m.headshot);
    const inner = `
      ${headerBar(cover.propertyName, 'Meet the Team', i > 0)}
      <div class="section-title">Meet the Team</div>
      <div class="gold-rule"></div>
      <div style="display:flex; flex:1; min-height:0; border-radius:8px; overflow:hidden; border:1px solid #E7E9EC;">
        <div style="flex:0 0 40%; position:relative;">
          ${
            headshotUri
              ? `<img src="${headshotUri}" style="width:100%; height:100%; object-fit:cover; display:block;" />`
              : `<div style="width:100%; height:100%; background:#F2F3F5;"></div>`
          }
          <div style="position:absolute; left:0; top:0; bottom:0; width:6px; background:${GOLD};"></div>
        </div>
        <div style="flex:1; padding:26px 28px; display:flex; flex-direction:column;">
          <div style="font-size:22px; font-weight:700; color:${NAVY};">${escOrDash(m.name)}</div>
          <div style="font-size:13px; color:#8A8D93; margin-bottom:14px;">${escOrDash(m.title)}</div>
          <div style="display:flex; gap:18px; font-size:10.5px; color:#33363D; margin-bottom:18px; padding-bottom:14px; border-bottom:1px solid #E7E9EC;">
            ${m.phone ? `<span>${esc(m.phone)}</span>` : ''}
            ${m.email ? `<span>${esc(m.email)}</span>` : ''}
          </div>
          <div class="narrative" style="flex:1; overflow:hidden;">${esc(m.bio) || 'No bio provided.'}</div>
        </div>
      </div>
    `;
    return pageShell(inner);
  });
}
