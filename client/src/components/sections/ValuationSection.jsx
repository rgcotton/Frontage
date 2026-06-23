import AiGenerateButton from '../AiGenerateButton.jsx';
import CustomAiInstructions from '../CustomAiInstructions.jsx';

const APPROACHES = ['Sales Comparison', 'Income Capitalization', 'Cost Approach'];

export default function ValuationSection({ value, onChange, omId, om, onUpdateOm }) {
  function set(field, val) {
    onChange({ ...value, [field]: val });
  }

  return (
    <div className="section-form">
      <h2>Valuation</h2>
      <p className="section-hint">Methodology, basis of value, and the concluded value for this opinion.</p>

      <CustomAiInstructions
        value={om.aiInstructions?.valuation}
        onChange={(text) => onUpdateOm({ aiInstructions: { ...om.aiInstructions, valuation: text } })}
      />

      <div className="field">
        <label>Valuation Approach</label>
        <select value={value.methodologyApproach} onChange={(e) => set('methodologyApproach', e.target.value)}>
          <option value="">Select approach…</option>
          {APPROACHES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <div className="field-label-row">
          <label>Methodology Narrative</label>
          <AiGenerateButton omId={omId} kind="valuationMethodologyNarrative" onResult={(result) => set('methodologyNarrative', result)} />
        </div>
        <textarea
          value={value.methodologyNarrative}
          onChange={(e) => set('methodologyNarrative', e.target.value)}
          placeholder="Explain the valuation approach and how it was applied to this property…"
        />
      </div>

      <div className="field-row cols-3">
        <div className="field">
          <label>Concluded Value</label>
          <input type="text" value={value.concludedValue} onChange={(e) => set('concludedValue', e.target.value)} placeholder="$4,750,000" />
        </div>
        <div className="field">
          <label>Effective Date</label>
          <input type="date" value={value.valueEffectiveDate} onChange={(e) => set('valueEffectiveDate', e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Basis of Value Note</label>
        <textarea
          value={value.valueBasisNote}
          onChange={(e) => set('valueBasisNote', e.target.value)}
          placeholder="Note any assumptions, limiting conditions, or basis of value definitions…"
        />
      </div>
    </div>
  );
}
