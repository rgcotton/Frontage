import { esc, formatCurrency, formatPercent, formatNumber, filterStats } from '../helpers/format.js';
import { googleMapsSearchUrl, buildAddressString } from '../../maps.js';

export default {
  key: 'institutional',
  label: 'Institutional',
  tokens: {
    primaryColor: '#1A2B4C',
    accentColor: '#C9A227',
    pageBg: '#FFFFFF',
    textColor: '#33363D',
    mutedColor: '#8A8D93',
    statBoxBg: '#F2F3F5',
    tableStripe: '#F7F8F9',
    cardBorder: '#E7E9EC',
    totalRowBg: '#FFFFFF',
    headingFont: "'Libre Franklin', sans-serif",
    bodyFont: "'Inter', sans-serif",
    titleSize: '21px',
    headingWeight: 700,
  },
  fonts: { heading: 'Libre Franklin', body: 'Inter' },
  components: {
    /**
     * Pill-style header bar: property name in navy pill (white text),
     * section label right-aligned in accent color.
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
     * Section heading: title in primaryColor at titleSize/headingWeight,
     * gold rule bar below, optional subtitle in mutedColor.
     */
    sectionHeading(title, subtitle, t) {
      const titleHtml = `<div class="section-title">${esc(title || '')}</div>`;
      const ruleHtml = `<div class="gold-rule"></div>`;
      const subtitleHtml = subtitle
        ? `<div class="section-subtitle">${esc(subtitle)}</div>`
        : '';
      return `${titleHtml}${ruleHtml}${subtitleHtml}`;
    },

    /**
     * Stat box: light gray background, label in muted uppercase, value in primaryColor bold.
     */
    statBox(label, value, t) {
      return `<div class="stat-box">
  <div class="label">${esc(String(label || ''))}</div>
  <div class="value">${esc(String(value || ''))}</div>
</div>`;
    },

    /**
     * CSS for .pdf-table and related classes.
     * Navy header, zebra stripes, total-row with top border.
     */
    tableCss(t) {
      const primary = (t && t.primaryColor) || '#1A2B4C';
      const stripe = (t && t.tableStripe) || '#F7F8F9';
      const border = (t && t.cardBorder) || '#E7E9EC';
      const text = (t && t.textColor) || '#33363D';
      const totalBg = (t && t.totalRowBg) || '#FFFFFF';
      return `
table.pdf-table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
table.pdf-table th {
  background: ${primary};
  color: #fff;
  text-align: left;
  padding: 5px 6px;
  font-size: 8.5px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 700;
}
table.pdf-table td { padding: 4px 6px; border-bottom: 1px solid ${border}; color: ${text}; }
table.pdf-table tr:nth-child(even) td { background: ${stripe}; }
table.pdf-table tr.total-row td { font-weight: 700; color: ${primary}; border-top: 2px solid ${primary}; background: ${totalBg}; }`;
    },

    /**
     * CSS for .comp-card and related classes.
     * 1px cardBorder border, 8px border-radius, photo 0.8in height.
     */
    compCardCss(t) {
      const border = (t && t.cardBorder) || '#E7E9EC';
      const primary = (t && t.primaryColor) || '#1A2B4C';
      const muted = (t && t.mutedColor) || '#8A8D93';
      const text = (t && t.textColor) || '#33363D';
      const statBg = (t && t.statBoxBg) || '#F2F3F5';
      return `
.card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.comp-card { border: 1px solid ${border}; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
.comp-card .photo { width: 100%; height: 0.8in; object-fit: cover; background: ${statBg}; display: block; }
.comp-card .photo-placeholder { width: 100%; height: 0.8in; background: ${statBg}; }
.comp-card .body { padding: 8px 9px; flex: 1; }
.comp-card .body .addr { font-weight: 700; color: ${primary}; font-size: 11.5px; margin-bottom: 6px; }
.comp-card .field-row { display: flex; justify-content: space-between; font-size: 9.5px; padding: 2px 0; border-bottom: 1px dashed ${border}; }
.comp-card .field-row .l { color: ${muted}; }
.comp-card .field-row .v { font-weight: 600; color: ${text}; text-align: right; }
.comp-card .notes { font-size: 9px; color: ${muted}; margin-top: 6px; font-style: italic; }`;
    },

    /**
     * Full-bleed cover page.
     * - Background: cover photo with dark gradient overlay, or navy gradient.
     * - Top: "OFFERING MEMORANDUM" badge in accent bg / navy text.
     * - Bottom-left: property type, name, address, tagline.
     * - Stat strip near bottom (translucent dark bar with 4 stat cells).
     * - Disclaimer text at very bottom.
     */
    coverPage(om, ctx, t) {
      // Safe fallback for minimal args (e.g., from tests)
      const cover = (om && om.cover) || {};
      const executiveSummary = (om && om.executiveSummary) || {};
      const overview = (om && om.overview) || {};

      const primary = (t && t.primaryColor) || '#1A2B4C';
      const accent = (t && t.accentColor) || '#C9A227';

      const bgStyle = (ctx && ctx.coverPhotoUri)
        ? `background-image: linear-gradient(180deg, rgba(17,32,59,0.25) 0%, rgba(17,32,59,0.55) 55%, rgba(17,32,59,0.92) 100%), url('${ctx.coverPhotoUri}'); background-size: cover; background-position: center;`
        : `background: linear-gradient(135deg, ${primary} 0%, #0c1830 100%);`;

      const addressLine = [
        cover.formattedAddress || cover.addressLine1,
        [cover.city, cover.state].filter(Boolean).join(', '),
        cover.zip,
      ].filter(Boolean).join(' • ');

      const mapsUrl = googleMapsSearchUrl(cover.formattedAddress || buildAddressString(cover));
      const addressHtml = mapsUrl
        ? `<a class="pdf-link" href="${mapsUrl}">${esc(addressLine)}</a>`
        : esc(addressLine);

      const stats = filterStats([
        ['Offering Price', executiveSummary.offeringPrice, formatCurrency],
        ['Cap Rate', executiveSummary.capRate, formatPercent],
        ['NOI', executiveSummary.noi, formatCurrency],
        ['Square Footage', overview.squareFootage, (v) => `${formatNumber(v)} SF`],
      ]);

      const statStripHtml = stats.length
        ? `<div style="position:absolute; left:0; right:0; bottom:0.85in; padding:0 0.6in;">
  <div style="display:flex; background:rgba(255,255,255,0.08); border-top:1px solid rgba(255,255,255,0.25); border-bottom:1px solid rgba(255,255,255,0.25);">
    ${stats.map(([label, value], i) => `<div style="flex:1; padding:16px 18px; ${i > 0 ? 'border-left:1px solid rgba(255,255,255,0.2);' : ''}">
      <div style="font-size:8.5px; text-transform:uppercase; letter-spacing:0.5px; color:rgba(255,255,255,0.6); margin-bottom:5px;">${esc(label)}</div>
      <div style="font-size:18px; font-weight:700; color:#fff;">${esc(value)}</div>
    </div>`).join('')}
  </div>
</div>`
        : '';

      return `
<div style="position:absolute; inset:0; ${bgStyle}"></div>
<div style="position:absolute; left:0.6in; right:0.6in; top:0.7in;">
  <div style="display:inline-block; background:${accent}; color:${primary}; font-size:10px; font-weight:700; letter-spacing:1.5px; padding:7px 14px; border-radius:3px;">OFFERING MEMORANDUM</div>
</div>
<div style="position:absolute; left:0.6in; right:0.6in; bottom:2.55in; color:#fff;">
  ${cover.propertyType ? `<div style="font-size:11px; font-weight:700; letter-spacing:1.5px; color:${accent}; margin-bottom:10px; text-transform:uppercase;">${esc(cover.propertyType)}</div>` : ''}
  <div style="font-size:38px; font-weight:700; line-height:1.1; margin-bottom:12px;">${esc(cover.propertyName) || 'Untitled Property'}</div>
  <div style="font-size:14px; opacity:0.92;">${addressHtml}</div>
  ${cover.tagline ? `<div style="font-size:13px; opacity:0.78; font-style:italic; margin-top:6px;">${esc(cover.tagline)}</div>` : ''}
</div>
${statStripHtml}
<div style="position:absolute; left:0.6in; right:0.6in; bottom:0.4in; color:rgba(255,255,255,0.65); font-size:7.5px; line-height:1.4;">
  This Offering Memorandum has been prepared solely for informational purposes and is strictly confidential. It is intended for review by the recipient only and may not be reproduced or distributed without the prior written consent of the broker of record. The information contained herein has been obtained from sources believed to be reliable but has not been independently verified.
</div>`;
    },

    /**
     * CSS for page chrome: footer, header bar, section title/subtitle,
     * gold rule, and stat boxes.
     */
    pageChromeCss(t) {
      const primary = (t && t.primaryColor) || '#1A2B4C';
      const accent = (t && t.accentColor) || '#C9A227';
      const muted = (t && t.mutedColor) || '#8A8D93';
      const border = (t && t.cardBorder) || '#E7E9EC';
      const statBg = (t && t.statBoxBg) || '#F2F3F5';
      const titleSize = (t && t.titleSize) || '21px';
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
  border-top: 1px solid ${border};
  padding-top: 4px;
  letter-spacing: 0.2px;
}
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
  background: ${primary};
  padding: 5px 10px;
  border-radius: 3px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.pdf-header-bar .section-name {
  font-size: 10.5px;
  font-weight: 700;
  color: ${accent};
  letter-spacing: 0.6px;
  text-transform: uppercase;
}
.section-title { font-size: ${titleSize}; font-weight: ${headingWeight}; color: ${primary}; margin-bottom: 4px; }
.section-subtitle { font-size: 12px; color: ${muted}; margin-bottom: 10px; }
.gold-rule { width: 54px; height: 3px; background: ${accent}; margin-bottom: 11px; flex-shrink: 0; }
.stat-grid { display: grid; grid-template-columns: repeat(var(--cols, 3), 1fr); gap: 8px; }
.stat-box { background: ${statBg}; border-radius: 6px; padding: 9px 11px; }
.stat-box .label { font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.4px; color: ${muted}; margin-bottom: 4px; }
.stat-box .value { font-size: 17px; font-weight: 700; color: ${primary}; line-height: 1.2; }
.subhead { font-size: 12px; font-weight: ${headingWeight}; color: ${primary}; margin-bottom: 6px; margin-top: 11px; }`;
    },
  },
};
