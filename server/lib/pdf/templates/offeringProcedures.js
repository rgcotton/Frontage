import { pageShell, headerBar } from './layout.js';
import { esc, formatMonthYear, normalizeUrl } from '../helpers/format.js';

export function buildPages(om, ctx) {
  const { offeringProcedures: p, cover } = om;
  const inner = `
    ${headerBar(cover.propertyName, 'Offering Procedures')}
    <div class="section-title">Offering Procedures</div>
    <div class="gold-rule"></div>
    <div class="stat-grid" style="--cols:1; margin-bottom:18px;">
      <div class="stat-box"><div class="label">Offer Deadline</div><div class="value">${p.offerDeadline ? formatMonthYear(p.offerDeadline) : 'To be determined'}</div></div>
    </div>
    <div class="subhead" style="margin-top:0;">Submitting a Letter of Intent</div>
    <div class="narrative">${esc(p.loiInstructions) || 'Contact the brokerage team listed in this Offering Memorandum to submit a Letter of Intent.'}</div>
    <div class="subhead">Scheduling a Property Tour</div>
    <div class="narrative">${esc(p.tourInstructions) || 'Contact the brokerage team to arrange a property tour.'}</div>
    <div class="subhead">Data Room Access</div>
    <div class="narrative">${esc(p.dataRoomInstructions) || 'Data room access details will be provided upon execution of a confidentiality agreement.'}</div>
    ${p.dataRoomLink ? `<div class="narrative" style="margin-top:8px;"><strong>Data Room:</strong> <a class="pdf-link" href="${normalizeUrl(p.dataRoomLink)}">${esc(p.dataRoomLink)}</a></div>` : ''}
  `;
  return [pageShell(inner)];
}
