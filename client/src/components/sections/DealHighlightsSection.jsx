import AiGenerateButton from '../AiGenerateButton.jsx';
import CustomAiInstructions from '../CustomAiInstructions.jsx';
import { CurrencyInput, PercentInput } from '../inputs/FormattedInputs.jsx';

export default function DealHighlightsSection({ omId, om, onUpdateOm }) {
  const executiveSummary = om.executiveSummary || {};
  const highlights = executiveSummary.highlights || [];

  function set(field, val) {
    onUpdateOm({ executiveSummary: { ...om.executiveSummary, [field]: val } });
  }

  function setHighlight(i, val) {
    const next = [...highlights];
    next[i] = val;
    set('highlights', next);
  }

  function addHighlight() {
    set('highlights', [...highlights, '']);
  }

  function removeHighlight(i) {
    set('highlights', highlights.filter((_, idx) => idx !== i));
  }

  return (
    <div className="section-form">
      <h2>Deal Highlights</h2>
      <p className="section-hint">The price, key return metrics, and investment highlights shown on the One Pager.</p>

      <CustomAiInstructions
        value={om.aiInstructions?.executiveSummary}
        onChange={(text) => onUpdateOm({ aiInstructions: { ...om.aiInstructions, executiveSummary: text } })}
      />

      <div className="field-row cols-3">
        <div className="field">
          <label>Offering Price</label>
          <CurrencyInput value={executiveSummary.offeringPrice} onChange={(v) => set('offeringPrice', v)} placeholder="$5,000,000" />
        </div>
        <div className="field">
          <label>Cap Rate</label>
          <PercentInput value={executiveSummary.capRate} onChange={(v) => set('capRate', v)} placeholder="6.5%" />
        </div>
        <div className="field">
          <label>NOI</label>
          <CurrencyInput value={executiveSummary.noi} onChange={(v) => set('noi', v)} placeholder="$325,000" />
        </div>
      </div>

      <hr className="divider" />

      <div className="field-label-row" style={{ marginBottom: 12 }}>
        <div className="subsection-title" style={{ marginBottom: 0 }}>
          Investment Highlights
        </div>
        <AiGenerateButton omId={omId} kind="investmentHighlights" om={om} onResult={(result) => set('highlights', result)} label="Generate Highlights" />
      </div>
      <div className="list-rows">
        {highlights.map((h, i) => (
          <div className="list-row" key={i}>
            <input type="text" value={h} onChange={(e) => setHighlight(i, e.target.value)} placeholder="e.g. 100% leased to investment-grade tenants" />
            <button type="button" className="btn-danger-text" onClick={() => removeHighlight(i)}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-ghost btn-sm add-row-btn" onClick={addHighlight}>
        + Add Highlight
      </button>
    </div>
  );
}
