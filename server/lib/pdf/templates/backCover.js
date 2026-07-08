import { pageShell, resolveTheme } from './layout.js';
import { esc } from '../helpers/format.js';

export function buildPages(om, ctx) {
  const theme = ctx.theme || resolveTheme(om.branding);
  const { cover, team } = om;
  const primaryContact = (team || [])[0];
  const logoBlock = ctx.brokerLogoUri
    ? `<img src="${ctx.brokerLogoUri}" style="max-width:2.6in; max-height:1.1in; object-fit:contain;" />`
    : `<div style="font-size:20px; font-weight:700; color:#fff; letter-spacing:1px;">${esc(cover.propertyName) || 'Brokerage'}</div>`;

  const contactLines = primaryContact
    ? [primaryContact.name, primaryContact.title, [primaryContact.phone, primaryContact.email].filter(Boolean).join('  •  ')].filter(Boolean)
    : [];

  // Use the theme's primaryColor as the gradient start so every theme's back
  // cover matches its brand colour rather than always showing hardcoded navy.
  const primaryColor = theme.primaryColor || '#1A2B4C';
  const accent = theme.accentColor || '#C9A227';

  // Darken the gradient end slightly: for dark primaries we stay very dark;
  // for lighter primaries we blend toward a mid-dark tone.
  const gradientEnd = theme.tokens?.pageBg === '#FFFFFF' ? '#1a1a2e' : '#0c1830';

  const coverBg = ctx.coverPhotoUri
    ? `background-image: linear-gradient(160deg, ${primaryColor}ee 0%, ${gradientEnd} 100%), url('${ctx.coverPhotoUri}'); background-size: cover; background-position: center;`
    : `background: linear-gradient(160deg, ${primaryColor} 0%, ${gradientEnd} 100%);`;

  const inner = `
    <div style="position:absolute; inset:0; ${coverBg}"></div>
    <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; gap:22px; padding:1.8in 1in 0.5in; text-align:center;">
      ${logoBlock}
      <div style="width:48px; height:2px; background:${accent};"></div>
      ${
        contactLines.length
          ? `<div style="color:#fff;">
        ${contactLines.map((l, i) => `<div style="font-size:${i === 0 ? 15 : 12}px; ${i === 0 ? 'font-weight:700;' : 'opacity:0.8;'} margin-bottom:4px;">${esc(l)}</div>`).join('')}
      </div>`
          : ''
      }
      <div style="color:rgba(255,255,255,0.55); font-size:8px; line-height:1.6; max-width:5.5in; margin-top:18px;">
        This Offering Memorandum is confidential and is intended solely for the use of the recipient to evaluate the potential acquisition of the property described herein. It shall not be copied, reproduced, or distributed to any other party at any time without the prior written consent of the broker of record. The information contained herein has been obtained from sources deemed reliable but is not guaranteed as to accuracy or completeness, and is subject to errors, omissions, change of price, prior sale, or withdrawal without notice.
      </div>
    </div>
  `;
  return [pageShell(inner)];
}
