import { esc, formatCurrency, formatPercent, formatNumber, filterStats } from '../helpers/format.js';
import { googleMapsSearchUrl, buildAddressString } from '../../maps.js';

export default {
  key: 'minimal',
  label: 'Minimal',
  tokens: {
    primaryColor: '#111111',
    accentColor: '#2563EB',
    pageBg: '#FFFFFF',
    textColor: '#111111',
    mutedColor: '#888888',
    statBoxBg: 'transparent',
    tableStripe: 'transparent',
    cardBorder: '#DDDDDD',
    totalRowBg: '#FFFFFF',
    headingFont: "'Inter', sans-serif",
    bodyFont: "'Inter', sans-serif",
    titleSize: '20px',
    headingWeight: 700,
  },
  fonts: { heading: 'Inter', body: 'Inter' },
  components: {
    /**
     * Hairline header: 0.5px #DDDDDD top rule; property name left in Inter 8px
     * 600 muted uppercase; section label right in Inter 8px 400 muted.
     * No background fill anywhere.
     */
    headerBar(propertyName, sectionLabel, t, continued) {
      const name = esc(propertyName || 'Offering Memorandum');
      const label = esc(sectionLabel || '');
      const suffix = continued ? ' (Continued)' : '';
      return `<div class="pdf-header-bar">
  <span class="prop-name">${name}</span>
  <span class="section-name">${label}${suffix}</span>
</div>`;
    },

    /**
     * Section heading: Inter 700 20px near-black title; NO rule below, just
     * 8px bottom margin; optional subtitle Inter 400 11px muted.
     * No decorative elements.
     */
    sectionHeading(title, subtitle, t) {
      const titleHtml = `<div class="section-title">${esc(title || '')}</div>`;
      const subtitleHtml = subtitle
        ? `<div class="section-subtitle">${esc(subtitle)}</div>`
        : '';
      return `${titleHtml}${subtitleHtml}`;
    },

    /**
     * Stat box: no background, no border box. Label Inter 600 8px uppercase
     * letter-spaced muted. Value accent color 22px Inter 700. 0.5px bottom
     * line #DDDDDD at the bottom of the stat area.
     */
    statBox(label, value, t) {
      return `<div class="stat-box">
  <div class="label">${esc(String(label || ''))}</div>
  <div class="value">${esc(String(value || ''))}</div>
</div>`;
    },

    /**
     * CSS for .pdf-table: NO header bg — header cells Inter 600 9px uppercase
     * muted, 0.5px bottom border in primaryColor; row dividers 0.5px #EBEBEB;
     * NO zebra stripe; total-row Inter 700 primaryColor, 0.5px accent top border.
     */
    tableCss(t) {
      const primary = (t && t.primaryColor) || '#111111';
      const accent = (t && t.accentColor) || '#2563EB';
      const muted = (t && t.mutedColor) || '#888888';
      const text = (t && t.textColor) || '#111111';
      const totalBg = (t && t.totalRowBg) || '#FFFFFF';
      return `
table.pdf-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
table.pdf-table th {
  background: transparent;
  color: ${muted};
  text-align: left;
  padding: 5px 6px;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 600;
  border-bottom: 0.5px solid ${primary};
}
table.pdf-table td { padding: 4px 6px; border-bottom: 0.5px solid #EBEBEB; color: ${text}; background: transparent; }
table.pdf-table tr:nth-child(even) td { background: transparent; }
table.pdf-table tr.total-row td { font-weight: 700; color: ${primary}; border-top: 0.5px solid ${accent}; background: ${totalBg}; }`;
    },

    /**
     * CSS for .comp-card: border 0.5px #DDDDDD; no radius; no shadow;
     * no background fill.
     */
    compCardCss(t) {
      const primary = (t && t.primaryColor) || '#111111';
      const muted = (t && t.mutedColor) || '#888888';
      const text = (t && t.textColor) || '#111111';
      const border = (t && t.cardBorder) || '#DDDDDD';
      return `
.card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.comp-card { border: 0.5px solid ${border}; border-radius: 0; overflow: hidden; display: flex; flex-direction: column; box-shadow: none; }
.comp-card .photo { width: 100%; height: 0.8in; object-fit: cover; background: transparent; display: block; }
.comp-card .photo-placeholder { width: 100%; height: 0.8in; background: transparent; }
.comp-card .body { padding: 8px 9px; flex: 1; }
.comp-card .body .addr { font-weight: 700; color: ${primary}; font-size: 11.5px; margin-bottom: 6px; }
.comp-card .field-row { display: flex; justify-content: space-between; font-size: 9.5px; padding: 2px 0; border-bottom: 0.5px solid ${border}; }
.comp-card .field-row .l { color: ${muted}; }
.comp-card .field-row .v { font-weight: 600; color: ${text}; text-align: right; }
.comp-card .notes { font-size: 9px; color: ${muted}; margin-top: 6px; font-style: italic; }`;
    },

    /**
     * Minimal white cover page.
     * - White background; thin 0.5px horizontal accent rule at full width (top).
     * - Property name Inter 700 42px near-black at top-left (~0.7in from top).
     * - Address Inter 400 14px muted below.
     * - Center of page: photo band 3.5in × 1.5in centered, if photo exists.
     * - Bottom-left: brokerage name Inter 400 10px muted.
     * - 0.5px horizontal #DDDDDD rule at very bottom as footer.
     * - NO stat strip on cover.
     */
    coverPage(om, ctx, t) {
      const cover = (om && om.cover) || {};

      const primary = (t && t.primaryColor) || '#111111';
      const accent = (t && t.accentColor) || '#2563EB';
      const muted = (t && t.mutedColor) || '#888888';

      const addressLine = [
        cover.formattedAddress || cover.addressLine1,
        [cover.city, cover.state].filter(Boolean).join(', '),
        cover.zip,
      ].filter(Boolean).join(' • ');

      const mapsUrl = googleMapsSearchUrl(cover.formattedAddress || buildAddressString(cover));
      const addressHtml = mapsUrl
        ? `<a class="pdf-link" href="${mapsUrl}" style="color:${muted}; text-decoration:none;">${esc(addressLine)}</a>`
        : esc(addressLine);

      const brokerageName = (om && om.brokerage && om.brokerage.name) ? esc(om.brokerage.name) : '';

      const photoHtml = (ctx && ctx.coverPhotoUri)
        ? `<div style="position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:3.5in; height:1.5in;">
  <img src="${ctx.coverPhotoUri}" style="width:100%; height:100%; object-fit:cover; display:block;" />
</div>`
        : '';

      return `
<div style="position:absolute; inset:0; background:#FFFFFF;"></div>
<div style="position:absolute; left:0.6in; right:0.6in; top:0; height:0.5px; background:${accent};"></div>
<div style="position:absolute; left:0.6in; right:0.6in; top:0.7in;">
  ${cover.propertyType ? `<div style="font-size:9px; font-weight:600; letter-spacing:1.5px; color:${muted}; margin-bottom:10px; text-transform:uppercase; font-family:'Inter', sans-serif;">${esc(cover.propertyType)}</div>` : ''}
  <div style="font-size:42px; font-weight:700; line-height:1.1; color:${primary}; margin-bottom:10px; font-family:'Inter', sans-serif;">${esc(cover.propertyName) || 'Untitled Property'}</div>
  ${addressLine ? `<div style="font-size:14px; color:${muted}; font-family:'Inter', sans-serif;">${addressHtml}</div>` : ''}
  ${cover.tagline ? `<div style="font-size:12px; color:${muted}; font-style:italic; margin-top:8px; font-family:'Inter', sans-serif;">${esc(cover.tagline)}</div>` : ''}
</div>
${photoHtml}
${brokerageName ? `<div style="position:absolute; left:0.6in; bottom:0.5in; color:${muted}; font-size:10px; font-family:'Inter', sans-serif;">${brokerageName}</div>` : ''}
<div style="position:absolute; left:0.6in; right:0.6in; bottom:0.3in; height:0.5px; background:#DDDDDD;"></div>`;
    },

    /**
     * CSS for page chrome: footer with 0.5px #DDDDDD top rule, Inter 400 8px
     * muted; header bar with 0.5px #DDDDDD top hairline, no background fill;
     * section-title Inter 700 20px near-black; .gold-rule hidden;
     * stat box transparent with accent value, 0.5px bottom line #DDDDDD.
     */
    pageChromeCss(t) {
      const primary = (t && t.primaryColor) || '#111111';
      const accent = (t && t.accentColor) || '#2563EB';
      const muted = (t && t.mutedColor) || '#888888';
      const titleSize = (t && t.titleSize) || '20px';
      const headingWeight = (t && t.headingWeight) || 700;
      return `
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
  border-top: 0.5px solid #DDDDDD;
  padding-top: 4px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  letter-spacing: 0.2px;
}
.pdf-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 13px;
  flex-shrink: 0;
  border-top: 0.5px solid #DDDDDD;
  padding-top: 5px;
}
.pdf-header-bar .prop-name {
  font-size: 8px;
  font-weight: 600;
  color: ${muted};
  letter-spacing: 0.8px;
  text-transform: uppercase;
  font-family: 'Inter', sans-serif;
}
.pdf-header-bar .section-name {
  font-size: 8px;
  font-weight: 400;
  color: ${muted};
  font-family: 'Inter', sans-serif;
}
.section-title {
  font-size: ${titleSize};
  font-weight: ${headingWeight};
  color: ${primary};
  margin-bottom: 8px;
  font-family: 'Inter', sans-serif;
}
.section-subtitle { font-size: 11px; color: ${muted}; margin-bottom: 10px; font-family: 'Inter', sans-serif; font-weight: 400; }
.gold-rule { display: none; }
.stat-grid { display: grid; grid-template-columns: repeat(var(--cols, 3), 1fr); gap: 8px; }
.stat-box { background: transparent; border-bottom: 0.5px solid #DDDDDD; padding: 8px 0 6px 0; }
.stat-box .label { font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; color: ${muted}; margin-bottom: 4px; font-weight: 600; font-family: 'Inter', sans-serif; }
.stat-box .value { font-size: 22px; font-weight: 700; color: ${accent}; line-height: 1.2; font-family: 'Inter', sans-serif; }
.subhead { font-size: 12px; font-weight: ${headingWeight}; color: ${primary}; margin-bottom: 6px; margin-top: 11px; font-family: 'Inter', sans-serif; }`;
    },
  },
};
