import { formatMonthYear } from '../../../lib/format.js';

export default function OfferingProceduresPage({ om }) {
  const p = om.offeringProcedures || {};

  return (
    <div className="fp-page">
      <div className="fp-title">Offering Procedures</div>
      <div className="fp-gold-rule" />
      {p.offerDeadline && (
        <div className="stat-grid" style={{ gridTemplateColumns: '1fr', marginBottom: 16 }}>
          <div className="stat-box">
            <div className="label">Offer Deadline</div>
            <div className="value">{formatMonthYear(p.offerDeadline)}</div>
          </div>
        </div>
      )}
      {p.loiInstructions && (
        <>
          <div className="fp-subhead" style={{ marginTop: 0 }}>
            Submitting a Letter of Intent
          </div>
          <p className="fp-narrative">{p.loiInstructions}</p>
        </>
      )}
      {p.tourInstructions && (
        <>
          <div className="fp-subhead">Scheduling a Property Tour</div>
          <p className="fp-narrative">{p.tourInstructions}</p>
        </>
      )}
      {p.dataRoomInstructions && (
        <>
          <div className="fp-subhead">Data Room Access</div>
          <p className="fp-narrative">{p.dataRoomInstructions}</p>
        </>
      )}
      {p.dataRoomLink && (
        <p className="fp-narrative">
          <strong>Data Room:</strong> {p.dataRoomLink}
        </p>
      )}
    </div>
  );
}
