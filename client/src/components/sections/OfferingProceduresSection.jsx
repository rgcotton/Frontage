import CustomAiInstructions from '../CustomAiInstructions.jsx';

export default function OfferingProceduresSection({ value, onChange, om, onUpdateOm }) {
  function set(field, val) {
    onChange({ ...value, [field]: val });
  }

  return (
    <div className="section-form">
      <h2>Offering Procedures</h2>
      <p className="section-hint">Instructions for submitting offers, scheduling tours, and accessing diligence materials.</p>

      <CustomAiInstructions
        value={om.aiInstructions?.offeringProcedures}
        onChange={(text) => onUpdateOm({ aiInstructions: { ...om.aiInstructions, offeringProcedures: text } })}
      />

      <div className="field">
        <label>Offer Deadline</label>
        <input type="date" value={value.offerDeadline} onChange={(e) => set('offerDeadline', e.target.value)} />
      </div>

      <div className="field">
        <label>Submitting a Letter of Intent</label>
        <textarea value={value.loiInstructions} onChange={(e) => set('loiInstructions', e.target.value)} placeholder="Explain how and to whom prospective buyers should submit a Letter of Intent…" />
      </div>

      <div className="field">
        <label>Scheduling a Property Tour</label>
        <textarea value={value.tourInstructions} onChange={(e) => set('tourInstructions', e.target.value)} placeholder="Explain how to request and schedule a property tour…" />
      </div>

      <div className="field">
        <label>Data Room Access Instructions</label>
        <textarea value={value.dataRoomInstructions} onChange={(e) => set('dataRoomInstructions', e.target.value)} placeholder="Explain how prospective buyers can request data room access…" />
      </div>

      <div className="field">
        <label>Data Room Link</label>
        <input type="text" value={value.dataRoomLink} onChange={(e) => set('dataRoomLink', e.target.value)} placeholder="https://dataroom.example.com/property-xyz" />
      </div>
    </div>
  );
}
