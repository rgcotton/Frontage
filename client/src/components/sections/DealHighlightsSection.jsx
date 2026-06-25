import AiGenerateButton from '../AiGenerateButton.jsx';
import CustomAiInstructions from '../CustomAiInstructions.jsx';
import AutofilledTag from '../AutofilledTag.jsx';
import { clearAutofilled } from '../../lib/autofill.js';
import { CurrencyInput, PercentInput } from '../inputs/FormattedInputs.jsx';

export default function DealHighlightsSection({ omId, om, onUpdateOm }) {
  const executiveSummary = om.executiveSummary || {};
  const highlights = executiveSummary.highlights || [];

  function setCover(field, val) {
    onUpdateOm({ cover: { ...om.cover, [field]: val } });
  }

  function set(field, val) {
    onUpdateOm({ executiveSummary: { ...om.executiveSummary, [field]: val } });
    clearAutofilled(om, onUpdateOm, `executiveSummary.${field}`);
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
          <div className="field-label-row">
            <label>Offering Price</label>
            <AutofilledTag om={om} field="executiveSummary.offeringPrice" />
          </div>
          <CurrencyInput value={executiveSummary.offeringPrice} onChange={(v) => set('offeringPrice', v)} placeholder="$5,000,000" />
        </div>
        <div className="field">
          <div className="field-label-row">
            <label>Cap Rate</label>
            <AutofilledTag om={om} field="executiveSummary.capRate" />
          </div>
          <PercentInput value={executiveSummary.capRate} onChange={(v) => set('capRate', v)} placeholder="6.5%" />
        </div>
        <div className="field">
          <div className="field-label-row">
            <label>NOI</label>
            <AutofilledTag om={om} field="executiveSummary.noi" />
          </div>
          <CurrencyInput value={executiveSummary.noi} onChange={(v) => set('noi', v)} placeholder="$325,000" />
        </div>
      </div>

      <hr className="divider" />

      <div className="field-label-row" style={{ marginBottom: 12 }}>
        <div className="subsection-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          Investment Highlights
          <AutofilledTag om={om} field="executiveSummary.highlights" />
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

      <hr className="divider" />

      <div className="field-label-row" style={{ marginBottom: 8 }}>
        <div className="subsection-title" style={{ marginBottom: 0 }}>Deal Summary</div>
        <AiGenerateButton
          omId={omId}
          kind="onePagerDealSummary"
          om={om}
          onResult={(result) => setCover('onePagerDealSummary', result)}
          label="Generate Deal Summary"
        />
      </div>
      <div className="field">
        <p className="section-hint" style={{ marginTop: 0 }}>2–3 sentences leading with what makes this deal unique. Shown on the One Pager above the highlights.</p>
        <textarea
          rows={3}
          value={om.cover?.onePagerDealSummary || ''}
          onChange={(e) => setCover('onePagerDealSummary', e.target.value)}
          placeholder="e.g. Westside Plaza delivers day-one cash flow from a 100% NNN-leased strip center at one of Overland Park's busiest signalized corners."
        />
      </div>

      <div className="field-label-row" style={{ marginBottom: 8 }}>
        <div className="subsection-title" style={{ marginBottom: 0 }}>One Pager Highlights</div>
        <AiGenerateButton
          omId={omId}
          kind="onePagerHighlights"
          om={om}
          onResult={(result) => setCover('onePagerHighlights', result)}
          label="Generate Highlights"
        />
      </div>
      <div className="field">
        <p className="section-hint" style={{ marginTop: 0 }}>4 bullet points, one per line. Overrides the Investment Highlights list above when set. Leave blank to use the list above.</p>
        <textarea
          rows={5}
          value={om.cover?.onePagerHighlights || ''}
          onChange={(e) => setCover('onePagerHighlights', e.target.value)}
          placeholder={"100% occupied with NNN leases, zero landlord exposure\nSignalized corner location with 42,000 VPD traffic count\nStaggered lease expirations reduce rollover risk\nStrong in-place NOI with 5.75% cap rate"}
        />
      </div>
    </div>
  );
}
