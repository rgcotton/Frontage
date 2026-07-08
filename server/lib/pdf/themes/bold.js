import { esc, formatCurrency, formatPercent, formatNumber, filterStats } from '../helpers/format.js';
import { googleMapsSearchUrl, buildAddressString } from '../../maps.js';

export default {
  key: 'bold',
  label: 'Bold',
  tokens: {
    primaryColor: '#0F1A2E',
    accentColor: '#E8402A',
    pageBg: '#FFFFFF',
    textColor: '#1A1A1A',
    mutedColor: '#6B6E74',
    statBoxBg: 'transparent',
    tableStripe: 'transparent',
    cardBorder: '#E7E9EC',
    totalRowBg: '#E8402A',
    headingFont: "'Space Grotesk', sans-serif",
    bodyFont: "'Space Grotesk', sans-serif",
    titleSize: '24px',
    headingWeight: 700,
  },
  fonts: { heading: 'Space Grotesk', body: 'Space Grotesk' },
  components: {
    /**
     * Bold header bar: left 6px solid accent stripe + property name in Space
     * Grotesk 700 11px on a light gray bg; section label in accent 11px 700
     * uppercase right.
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
     * Section heading: Space Grotesk 700 24px primaryColor title; below: a
     * 6px-tall × 40px-wide solid accent block (chunky rule). Optional subtitle.
     */
    sectionHeading(title, subtitle, t) {
      const accent = (t && t.accentColor) || '#E8402A';
      const titleHtml = `<div class="section-title">${esc(title || '')}</div>`;
      const ruleHtml = `<div style="width:40px; height:6px; background:${accent}; margin-bottom:11px; flex-shrink:0;"></div>`;
      const subtitleHtml = subtitle
        ? `<div class="section-subtitle">${esc(subtitle)}</div>`
        : '';
      return `${titleHtml}${ruleHtml}${subtitleHtml}`;
    },

    /**
     * Stat box: large value 28px+ Space Grotesk 700 primaryColor; NO box
     * background; accent color underline only (border-bottom 2px accent);
     * label 8px uppercase muted.
     */
    statBox(label, value, t) {
      return `<div class="stat-box">
  <div class="label">${esc(String(label || ''))}</div>
  <div class="value">${esc(String(value || ''))}</div>
</div>`;
    },

    /**
     * CSS for .pdf-table: solid primaryColor header row (NO zebra striping —
     * all rows white); row dividers 1px light gray; total-row solid accent bg
     * white text.
     */
    tableCss(t) {
      const primary = (t && t.primaryColor) || '#0F1A2E';
      const accent = (t && t.accentColor) || '#E8402A';
      const text = (t && t.textColor) || '#1A1A1A';
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
table.pdf-table td { padding: 4px 6px; border-bottom: 1px solid #E7E9EC; color: ${text}; background: #fff; }
table.pdf-table tr:nth-child(even) td { background: #fff; }
table.pdf-table tr.total-row td { font-weight: 700; color: #fff; border-top: none; background: ${accent}; }`;
    },

    /**
     * CSS for .comp-card: 0 radius; top 4px solid accent border; subtle
     * shadow 2px 2px 6px rgba(0,0,0,0.08).
     */
    compCardCss(t) {
      const accent = (t && t.accentColor) || '#E8402A';
      const primary = (t && t.primaryColor) || '#0F1A2E';
      const muted = (t && t.mutedColor) || '#6B6E74';
      const text = (t && t.textColor) || '#1A1A1A';
      return `
.card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.comp-card { border: 1px solid #E7E9EC; border-top: 4px solid ${accent}; border-radius: 0; overflow: hidden; display: flex; flex-direction: column; box-shadow: 2px 2px 6px rgba(0,0,0,0.08); }
.comp-card .photo { width: 100%; height: 0.8in; object-fit: cover; background: #F0F2F5; display: block; }
.comp-card .photo-placeholder { width: 100%; height: 0.8in; background: #F0F2F5; }
.comp-card .body { padding: 8px 9px; flex: 1; }
.comp-card .body .addr { font-weight: 700; color: ${primary}; font-size: 11.5px; margin-bottom: 6px; }
.comp-card .field-row { display: flex; justify-content: space-between; font-size: 9.5px; padding: 2px 0; border-bottom: 1px solid #E7E9EC; }
.comp-card .field-row .l { color: ${muted}; }
.comp-card .field-row .v { font-weight: 600; color: ${text}; text-align: right; }
.comp-card .notes { font-size: 9px; color: ${muted}; margin-top: 6px; font-style: italic; }`;
    },

    /**
     * SPLIT layout cover page.
     * Left 40%: solid primaryColor panel — "OFFERING MEMORANDUM" 8px white
     * caps top, property type in small accent pill, title + address + 2-3 key
     * stats stacked vertically, all white text.
     * Right 60%: full-bleed photo (no overlay). If no photo, gradient.
     */
    coverPage(om, ctx, t) {
      const cover = (om && om.cover) || {};
      const executiveSummary = (om && om.executiveSummary) || {};
      const overview = (om && om.overview) || {};

      const primary = (t && t.primaryColor) || '#0F1A2E';
      const accent = (t && t.accentColor) || '#E8402A';

      const addressLine = [
        cover.formattedAddress || cover.addressLine1,
        [cover.city, cover.state].filter(Boolean).join(', '),
        cover.zip,
      ].filter(Boolean).join(' • ');

      const mapsUrl = googleMapsSearchUrl(cover.formattedAddress || buildAddressString(cover));
      const addressHtml = mapsUrl
        ? `<a class="pdf-link" href="${mapsUrl}" style="color:rgba(255,255,255,0.85); text-decoration:none;">${esc(addressLine)}</a>`
        : esc(addressLine);

      const stats = filterStats([
        ['Offering Price', executiveSummary.offeringPrice, formatCurrency],
        ['Cap Rate', executiveSummary.capRate, formatPercent],
        ['NOI', executiveSummary.noi, formatCurrency],
        ['Square Footage', overview.squareFootage, (v) => `${formatNumber(v)} SF`],
      ]).slice(0, 3);

      const statsHtml = stats.length
        ? stats.map(([label, value]) => `<div style="margin-bottom:14px;">
    <div style="font-size:8px; text-transform:uppercase; letter-spacing:0.6px; color:rgba(255,255,255,0.6); margin-bottom:4px;">${esc(label)}</div>
    <div style="font-size:22px; font-weight:700; color:#fff; line-height:1.1;">${esc(value)}</div>
  </div>`).join('')
        : '';

      const rightStyle = (ctx && ctx.coverPhotoUri)
        ? `background-image: url('${ctx.coverPhotoUri}'); background-size: cover; background-position: center;`
        : `background: linear-gradient(135deg, #1a2f4e 0%, #0a1220 100%);`;

      return `
<div style="position:absolute; inset:0; display:flex;">
  <div style="width:40%; background:${primary}; display:flex; flex-direction:column; padding:0.55in 0.4in; box-sizing:border-box; flex-shrink:0;">
    <div style="font-size:8px; font-weight:700; letter-spacing:1.8px; color:rgba(255,255,255,0.7); text-transform:uppercase; margin-bottom:18px;">OFFERING MEMORANDUM</div>
    ${cover.propertyType ? `<div style="display:inline-block; background:${accent}; color:#fff; font-size:9px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; padding:3px 8px; margin-bottom:16px; align-self:flex-start;">${esc(cover.propertyType)}</div>` : ''}
    <div style="font-size:28px; font-weight:700; line-height:1.15; color:#fff; margin-bottom:10px;">${esc(cover.propertyName) || 'Untitled Property'}</div>
    ${addressLine ? `<div style="font-size:11px; color:rgba(255,255,255,0.78); margin-bottom:24px; line-height:1.4;">${addressHtml}</div>` : ''}
    <div style="flex:1;"></div>
    ${statsHtml}
  </div>
  <div style="flex:1; ${rightStyle}"></div>
</div>`;
    },

    /**
     * CSS for page chrome: bold header bar (6px left accent stripe + light gray
     * bg); footer with 1px accent-color left strip + muted text; section title
     * Space Grotesk 700 24px; chunky accent rule via inline div in sectionHeading;
     * .gold-rule hidden; stat box with accent border-bottom underline.
     */
    pageChromeCss(t) {
      const primary = (t && t.primaryColor) || '#0F1A2E';
      const accent = (t && t.accentColor) || '#E8402A';
      const muted = (t && t.mutedColor) || '#6B6E74';
      const titleSize = (t && t.titleSize) || '24px';
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
  border-left: 1px solid ${accent};
  padding-left: 6px;
  letter-spacing: 0.2px;
}
.pdf-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 13px;
  flex-shrink: 0;
  background: #F2F4F6;
  border-left: 6px solid ${accent};
  padding: 5px 10px 5px 8px;
}
.pdf-header-bar .prop-name {
  font-size: 11px;
  font-weight: 700;
  color: ${primary};
  letter-spacing: 0.3px;
  font-family: 'Space Grotesk', sans-serif;
}
.pdf-header-bar .section-name {
  font-size: 11px;
  font-weight: 700;
  color: ${accent};
  letter-spacing: 0.6px;
  text-transform: uppercase;
  font-family: 'Space Grotesk', sans-serif;
}
.section-title { font-size: ${titleSize}; font-weight: ${headingWeight}; color: ${primary}; margin-bottom: 6px; font-family: 'Space Grotesk', sans-serif; }
.section-subtitle { font-size: 12px; color: ${muted}; margin-bottom: 10px; }
.gold-rule { display: none; }
.stat-grid { display: grid; grid-template-columns: repeat(var(--cols, 3), 1fr); gap: 8px; }
.stat-box { background: transparent; border-bottom: 2px solid ${accent}; padding: 8px 0 6px 0; }
.stat-box .label { font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; color: ${muted}; margin-bottom: 4px; font-weight: 500; font-family: 'Space Grotesk', sans-serif; }
.stat-box .value { font-size: 28px; font-weight: 700; color: ${primary}; line-height: 1.15; font-family: 'Space Grotesk', sans-serif; }
.subhead { font-size: 12px; font-weight: ${headingWeight}; color: ${primary}; margin-bottom: 6px; margin-top: 11px; font-family: 'Space Grotesk', sans-serif; }`;
    },
  },
};
