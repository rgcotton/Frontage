import { formatMonthYear } from '../../../lib/format.js';

export default function OfferingProceduresPage({ om }) {
  const p = om.offeringProcedures || {};

  return (
    <div className="fp-page">
      <div className="fp-title">Offering Procedures</div>
      <div className="fp-gold-rule" />
      <div className="stat-grid" style={{ gridTemplateColumns: '1fr', marginBottom: 16 }}>
        <div className="stat-box">
          <div className="label">Offer Deadline</div>
          <div className="value">{p.offerDeadline ? formatMonthYear(p.offerDeadline) : 'To be determined'}</div>
        </div>
      </div>
      <div className="fp-subhead" style={{ marginTop: 0 }}>
        Submitting a Letter of Intent
      </div>
      <p className="fp-narrative">{p.loiInstructions || 'Contact the brokerage team listed in this Offering Memorandum to submit a Letter of Intent.'}</p>
      <div className="fp-subhead">Scheduling a Property Tour</div>
      <p className="fp-narrative">{p.tourInstructions || 'Contact the brokerage team to arrange a property tour.'}</p>
      <div className="fp-subhead">Data Room Access</div>
      <p className="fp-narrative">{p.dataRoomInstructions || 'Data room access details will be provided upon execution of a confidentiality agreement.'}</p>
      {p.dataRoomLink && (
        <p className="fp-narrative">
          <strong>Data Room:</strong> {p.dataRoomLink}
        </p>
      )}
    </div>
  );
}
