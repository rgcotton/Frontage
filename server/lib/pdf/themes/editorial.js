import { esc, formatCurrency, formatPercent, formatNumber, filterStats } from '../helpers/format.js';
import { googleMapsSearchUrl, buildAddressString } from '../../maps.js';

export default {
  key: 'editorial',
  label: 'Editorial',
  tokens: {
    primaryColor: '#1C1C1C',
    accentColor: '#8B4513',
    pageBg: '#FFFFFF',
    textColor: '#1C1C1C',
    mutedColor: '#7A7A7A',
    statBoxBg: 'transparent',
    tableStripe: 'transparent',
    cardBorder: '#C8A882',
    totalRowBg: '#FFFFFF',
    headingFont: "'Source Serif 4', serif",
    bodyFont: "'Inter', sans-serif",
    titleSize: '22px',
    headingWeight: 700,
  },
  fonts: { heading: 'Source Serif 4', body: 'Inter' },
  components: {
    /**
     * Hairline rule header: thin accent top rule, property name left in muted
     * Inter 9px uppercase, section label right in Source Serif 4 italic 11px.
     */
    headerBar(propertyName, sectionLabel, t, continued) {
      const name = esc(propertyName || 'Offering Memorandum');
      const label = esc(sectionLabel || '');
      const suffix = continued ? ' (Continued)' : '';
      const accent = (t && t.accentColor) || '#8B4513';
      const muted = (t && t.mutedColor) || '#7A7A7A';
      const primary = (t && t.primaryColor) || '#1C1C1C';
      return `<div class="pdf-header-bar">
  <span class="prop-name">${name}</span>
  <span class="section-name">${label}${suffix}</span>
</div>`;
    },

    /**
     * Section heading: Source Serif 4 700 22px near-black; thin 1px accent
     * hairline rule below title; optional muted subtitle. No gold-rule block.
     */
    sectionHeading(title, subtitle, t) {
      const titleHtml = `<div class="section-title">${esc(title || '')}</div>`;
      const subtitleHtml = subtitle
        ? `<div class="section-subtitle">${esc(subtitle)}</div>`
        : '';
      return `${titleHtml}${subtitleHtml}`;
    },

    /**
     * Stat box: no background fill; 2px solid left accent border; padding-left
     * 10px; label Inter 600 8px uppercase muted; value Source Serif 4 700 20px.
     */
    statBox(label, value, t) {
      return `<div class="stat-box">
  <div class="label">${esc(String(label || ''))}</div>
  <div class="value">${esc(String(value || ''))}</div>
</div>`;
    },

    /**
     * CSS for .pdf-table: no header fill — 1.5px bottom border on th;
     * no zebra stripe; 0.5px row separators; total-row bold with accent top border.
     */
    tableCss(t) {
      const primary = (t && t.primaryColor) || '#1C1C1C';
      const accent = (t && t.accentColor) || '#8B4513';
      const muted = (t && t.mutedColor) || '#7A7A7A';
      const text = (t && t.textColor) || '#1C1C1C';
      const totalBg = (t && t.totalRowBg) || '#FFFFFF';
      return `
table.pdf-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
table.pdf-table th {
  background: transparent;
  color: ${primary};
  text-align: left;
  padding: 5px 6px;
  font-size: 8.5px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 700;
  border-bottom: 1.5px solid ${primary};
}
table.pdf-table td { padding: 4px 6px; border-bottom: 0.5px solid #E0E0E0; color: ${text}; background: transparent; }
table.pdf-table tr:nth-child(even) td { background: transparent; }
table.pdf-table tr.total-row td { font-weight: 700; color: ${primary}; border-top: 1.5px solid ${accent}; background: ${totalBg}; }`;
    },

    /**
     * CSS for .comp-card: no border-radius (sharp corners); 2px left border
     * in accent; no shadow.
     */
    compCardCss(t) {
      const accent = (t && t.accentColor) || '#8B4513';
      const primary = (t && t.primaryColor) || '#1C1C1C';
      const muted = (t && t.mutedColor) || '#7A7A7A';
      const text = (t && t.textColor) || '#1C1C1C';
      const statBg = (t && t.statBoxBg) || 'transparent';
      const border = (t && t.cardBorder) || '#C8A882';
      return `
.card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.comp-card { border: none; border-left: 2px solid ${accent}; border-radius: 0; overflow: hidden; display: flex; flex-direction: column; box-shadow: none; }
.comp-card .photo { width: 100%; height: 0.8in; object-fit: cover; background: #F5F5F5; display: block; }
.comp-card .photo-placeholder { width: 100%; height: 0.8in; background: #F5F5F5; }
.comp-card .body { padding: 8px 9px; flex: 1; }
.comp-card .body .addr { font-weight: 700; color: ${primary}; font-size: 11.5px; margin-bottom: 6px; }
.comp-card .field-row { display: flex; justify-content: space-between; font-size: 9.5px; padding: 2px 0; border-bottom: 0.5px solid #E0E0E0; }
.comp-card .field-row .l { color: ${muted}; }
.comp-card .field-row .v { font-weight: 600; color: ${text}; text-align: right; }
.comp-card .notes { font-size: 9px; color: ${muted}; margin-top: 6px; font-style: italic; }`;
    },

    /**
     * Full-bleed editorial cover page.
     * - Background: full-bleed photo with bottom-heavy gradient (70% → 90% dark), or fallback dark gradient.
     * - Title set low-left in large Source Serif 4.
     * - NO stat strip on cover — short accent divider line + subtitle tagline instead.
     * - Property type in small caps.
     * - Brokerage name bottom-right in small white caps.
     * - Thin 2px accent horizontal line across the very bottom edge.
     */
    coverPage(om, ctx, t) {
      const cover = (om && om.cover) || {};
      const executiveSummary = (om && om.executiveSummary) || {};

      const primary = (t && t.primaryColor) || '#1C1C1C';
      const accent = (t && t.accentColor) || '#8B4513';

      const bgStyle = (ctx && ctx.coverPhotoUri)
        ? `background-image: linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.30) 45%, rgba(0,0,0,0.88) 100%), url('${ctx.coverPhotoUri}'); background-size: cover; background-position: center;`
        : `background: linear-gradient(160deg, #2a2a2a 0%, #111111 100%);`;

      const addressLine = [
        cover.formattedAddress || cover.addressLine1,
        [cover.city, cover.state].filter(Boolean).join(', '),
        cover.zip,
      ].filter(Boolean).join(' • ');

      const mapsUrl = googleMapsSearchUrl(cover.formattedAddress || buildAddressString(cover));
      const addressHtml = mapsUrl
        ? `<a class="pdf-link" href="${mapsUrl}">${esc(addressLine)}</a>`
        : esc(addressLine);

      const brokerageName = (om && om.brokerage && om.brokerage.name) ? esc(om.brokerage.name) : '';

      return `
<div style="position:absolute; inset:0; ${bgStyle}"></div>
<div style="position:absolute; left:0.6in; right:0.6in; bottom:1.0in; color:#fff;">
  ${cover.propertyType ? `<div style="font-size:10px; font-weight:600; letter-spacing:2px; color:rgba(255,255,255,0.75); margin-bottom:14px; text-transform:uppercase; font-family:'Inter', sans-serif;">${esc(cover.propertyType)}</div>` : ''}
  <div style="border-top: 1.5px solid ${accent}; width: 40px; margin-bottom: 14px;"></div>
  <div style="font-size:42px; font-weight:700; line-height:1.1; margin-bottom:14px; font-family:'Source Serif 4', serif;">${esc(cover.propertyName) || 'Untitled Property'}</div>
  ${addressLine ? `<div style="font-size:13px; opacity:0.85; font-family:'Inter', sans-serif;">${addressHtml}</div>` : ''}
  ${cover.tagline ? `<div style="font-size:12px; opacity:0.70; font-style:italic; margin-top:8px; font-family:'Source Serif 4', serif;">${esc(cover.tagline)}</div>` : ''}
</div>
${brokerageName ? `<div style="position:absolute; right:0.6in; bottom:0.45in; color:rgba(255,255,255,0.7); font-size:8.5px; letter-spacing:1.5px; text-transform:uppercase; font-family:'Inter', sans-serif;">${brokerageName}</div>` : ''}
<div style="position:absolute; left:0; right:0; bottom:0; height:2px; background:${accent};"></div>`;
    },

    /**
     * CSS for page chrome: footer with NO top rule — just muted left/right text;
     * header bar with hairline accent top rule; section title in Source Serif 4;
     * gold-rule hidden; editorial stat box (no background, left accent border).
     */
    pageChromeCss(t) {
      const primary = (t && t.primaryColor) || '#1C1C1C';
      const accent = (t && t.accentColor) || '#8B4513';
      const muted = (t && t.mutedColor) || '#7A7A7A';
      const titleSize = (t && t.titleSize) || '22px';
      const headingWeight = (t && t.headingWeight) || 700;
      return `
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;500;600;700&display=swap');
.pdf-footer {
  position: absolute;
  left: 0.6in;
  right: 0.6in;
  bottom: 0.22in;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 8px;
  color: ${muted};
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.2px;
}
.pdf-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 13px;
  flex-shrink: 0;
  border-top: 0.5px solid ${accent};
  padding-top: 5px;
}
.pdf-header-bar .prop-name {
  font-size: 9px;
  font-weight: 600;
  color: ${muted};
  letter-spacing: 0.8px;
  text-transform: uppercase;
  font-family: 'Inter', sans-serif;
}
.pdf-header-bar .section-name {
  font-size: 11px;
  font-weight: 400;
  font-style: italic;
  color: ${primary};
  font-family: 'Source Serif 4', serif;
}
.section-title {
  font-size: ${titleSize};
  font-weight: ${headingWeight};
  color: ${primary};
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${accent};
  font-family: 'Source Serif 4', serif;
}
.section-subtitle { font-size: 12px; color: ${muted}; margin-bottom: 12px; font-family: 'Inter', sans-serif; }
.gold-rule { display: none; }
.stat-grid { display: grid; grid-template-columns: repeat(var(--cols, 3), 1fr); gap: 8px; }
.stat-box { background: transparent; border-left: 2px solid ${accent}; padding: 7px 0 7px 10px; }
.stat-box .label { font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; color: ${muted}; margin-bottom: 4px; font-weight: 600; font-family: 'Inter', sans-serif; }
.stat-box .value { font-size: 20px; font-weight: 700; color: ${primary}; line-height: 1.2; font-family: 'Source Serif 4', serif; }
.subhead { font-size: 12px; font-weight: ${headingWeight}; color: ${primary}; margin-bottom: 6px; margin-top: 11px; font-family: 'Source Serif 4', serif; }`;
    },
  },
};
