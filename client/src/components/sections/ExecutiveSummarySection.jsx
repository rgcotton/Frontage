import AiGenerateButton from '../AiGenerateButton.jsx';

export default function ExecutiveSummarySection({ value, onChange, omId }) {
  function set(field, val) {
    onChange({ ...value, [field]: val });
  }

  function setHighlight(i, val) {
    const next = [...value.highlights];
    next[i] = val;
    set('highlights', next);
  }

  function addHighlight() {
    set('highlights', [...(value.highlights || []), '']);
  }

  function removeHighlight(i) {
    set('highlights', value.highlights.filter((_, idx) => idx !== i));
  }

  return (
    <div className="section-form">
      <h2>Executive Summary</h2>
      <p className="section-hint">The narrative pitch and headline investment metrics.</p>

      <div className="field-row cols-3">
        <div className="field">
          <label>Offering Price</label>
          <input type="text" value={value.offeringPrice} onChange={(e) => set('offeringPrice', e.target.value)} placeholder="$5,000,000" />
        </div>
        <div className="field">
          <label>Cap Rate</label>
          <input type="text" value={value.capRate} onChange={(e) => set('capRate', e.target.value)} placeholder="6.5%" />
        </div>
        <div className="field">
          <label>NOI</label>
          <input type="text" value={value.noi} onChange={(e) => set('noi', e.target.value)} placeholder="$325,000" />
        </div>
      </div>

      <div className="field">
        <div className="field-label-row">
          <label>Summary Narrative</label>
          <AiGenerateButton omId={omId} kind="executiveSummaryNarrative" onResult={(result) => set('narrative', result)} />
        </div>
        <textarea value={value.narrative} onChange={(e) => set('narrative', e.target.value)} placeholder="Summarize the investment opportunity in a few compelling paragraphs…" />
      </div>

      <hr className="divider" />

      <div className="field-label-row" style={{ marginBottom: 12 }}>
        <div className="subsection-title" style={{ marginBottom: 0 }}>
          Investment Highlights
        </div>
        <AiGenerateButton omId={omId} kind="investmentHighlights" onResult={(result) => set('highlights', result)} label="Generate Highlights" />
      </div>
      <div className="list-rows">
        {(value.highlights || []).map((h, i) => (
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
