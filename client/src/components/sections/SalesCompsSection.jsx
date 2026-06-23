import FileUpload from '../FileUpload.jsx';
import FilePreview from '../FilePreview.jsx';
import AiGenerateButton from '../AiGenerateButton.jsx';
import CustomAiInstructions from '../CustomAiInstructions.jsx';
import { CurrencyInput, PercentInput, SquareFeetInput } from '../inputs/FormattedInputs.jsx';

let nextId = 1;
function makeId() {
  return `comp-${Date.now()}-${nextId++}`;
}

export default function SalesCompsSection({ value, onChange, omId, om, onUpdateOm }) {
  const comps = value || [];

  function update(id, field, val) {
    onChange(comps.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
  }

  function addComp() {
    onChange([
      ...comps,
      { id: makeId(), address: '', saleDate: '', salePrice: '', pricePerSF: '', capRate: '', squareFeet: '', notes: '', photo: null },
    ]);
  }

  function removeComp(id) {
    onChange(comps.filter((c) => c.id !== id));
  }

  return (
    <div className="section-form">
      <h2>Sales Comparables</h2>
      <p className="section-hint">Recently sold comparable properties to support pricing.</p>

      <CustomAiInstructions
        value={om.aiInstructions?.salesComps}
        onChange={(text) => onUpdateOm({ aiInstructions: { ...om.aiInstructions, salesComps: text } })}
      />

      {comps.map((c, i) => (
        <div className="repeat-card" key={c.id}>
          <div className="repeat-card-header">
            <span>Comp {i + 1}</span>
          </div>
          <div className="field">
            <label>Address</label>
            <input type="text" value={c.address} onChange={(e) => update(c.id, 'address', e.target.value)} />
          </div>
          <div className="field-row cols-3">
            <div className="field">
              <label>Sale Date</label>
              <input type="date" value={c.saleDate} onChange={(e) => update(c.id, 'saleDate', e.target.value)} />
            </div>
            <div className="field">
              <label>Sale Price</label>
              <CurrencyInput value={c.salePrice} onChange={(v) => update(c.id, 'salePrice', v)} placeholder="$4,200,000" />
            </div>
            <div className="field">
              <label>Price / SF</label>
              <CurrencyInput value={c.pricePerSF} onChange={(v) => update(c.id, 'pricePerSF', v)} placeholder="$210" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Cap Rate</label>
              <PercentInput value={c.capRate} onChange={(v) => update(c.id, 'capRate', v)} placeholder="6.2%" />
            </div>
            <div className="field">
              <label>Square Feet</label>
              <SquareFeetInput value={c.squareFeet} onChange={(v) => update(c.id, 'squareFeet', v)} placeholder="20,000 SF" />
            </div>
          </div>
          <div className="field">
            <div className="field-label-row">
              <label>Notes</label>
              <AiGenerateButton omId={omId} kind="salesCompAnalysis" extra={{ compId: c.id }} om={om} onResult={(result) => update(c.id, 'notes', result)} label="Generate Pricing Analysis" />
            </div>
            <textarea value={c.notes} onChange={(e) => update(c.id, 'notes', e.target.value)} placeholder="Anything notable about this comp — condition, buyer profile, financing terms…" />
          </div>
          <div className="field">
            <label>Photo</label>
            <FileUpload omId={omId} accept="image/*" onUploaded={(refs) => update(c.id, 'photo', refs[0])} />
            {c.photo && <FilePreview files={[c.photo]} onRemove={() => update(c.id, 'photo', null)} />}
          </div>
          <button type="button" className="btn-danger-text" onClick={() => removeComp(c.id)}>
            Remove comp
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm add-row-btn" onClick={addComp}>
        + Add Sales Comp
      </button>
    </div>
  );
}
