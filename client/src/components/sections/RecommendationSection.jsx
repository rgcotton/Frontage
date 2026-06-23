import AiGenerateButton from '../AiGenerateButton.jsx';
import CustomAiInstructions from '../CustomAiInstructions.jsx';

const ACTIONS = ['Hold', 'List for Sale', 'Refinance', 'Other'];

export default function RecommendationSection({ value, onChange, omId, om, onUpdateOm }) {
  function set(field, val) {
    onChange({ ...value, [field]: val });
  }

  return (
    <div className="section-form">
      <h2>Recommendation</h2>
      <p className="section-hint">The broker's bottom-line recommendation based on the valuation and market analysis.</p>

      <CustomAiInstructions
        value={om.aiInstructions?.recommendation}
        onChange={(text) => onUpdateOm({ aiInstructions: { ...om.aiInstructions, recommendation: text } })}
      />

      <div className="field">
        <div className="field-label-row">
          <label>Recommendation Narrative</label>
          <AiGenerateButton omId={omId} kind="brokerRecommendationNarrative" onResult={(result) => set('narrative', result)} />
        </div>
        <textarea
          value={value.narrative}
          onChange={(e) => set('narrative', e.target.value)}
          placeholder="Summarize the recommendation and the reasoning behind it…"
        />
      </div>

      <div className="field">
        <label>Recommended Action</label>
        <select value={value.recommendedAction} onChange={(e) => set('recommendedAction', e.target.value)}>
          <option value="">Select action…</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
