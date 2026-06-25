import { flowSection, headerBar } from './layout.js';
import { esc, formatMonthYear, normalizeUrl } from '../helpers/format.js';

export function buildPages(om, ctx) {
  const { offeringProcedures: p, cover } = om;
  if (!p.offerDeadline && !p.loiInstructions && !p.tourInstructions && !p.dataRoomInstructions && !p.dataRoomLink) return [];
  const inner = `
    ${headerBar(cover.propertyName, 'Offering Procedures')}
    <div class="section-title">Offering Procedures</div>
    <div class="gold-rule"></div>
    ${
      p.offerDeadline
        ? `<div class="stat-grid" style="--cols:1; margin-bottom:18px;">
      <div class="stat-box"><div class="label">Offer Deadline</div><div class="value">${formatMonthYear(p.offerDeadline)}</div></div>
    </div>`
        : ''
    }
    ${p.loiInstructions ? `<div class="subhead" style="margin-top:0;">Submitting a Letter of Intent</div><div class="narrative">${esc(p.loiInstructions)}</div>` : ''}
    ${p.tourInstructions ? `<div class="subhead">Scheduling a Property Tour</div><div class="narrative">${esc(p.tourInstructions)}</div>` : ''}
    ${p.dataRoomInstructions ? `<div class="subhead">Data Room Access</div><div class="narrative">${esc(p.dataRoomInstructions)}</div>` : ''}
    ${p.dataRoomLink ? `<div class="narrative" style="margin-top:8px;"><strong>Data Room:</strong> <a class="pdf-link" href="${normalizeUrl(p.dataRoomLink)}">${esc(p.dataRoomLink)}</a></div>` : ''}
  `;
  return [flowSection(inner)];
}
