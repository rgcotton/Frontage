import FileUpload from '../FileUpload.jsx';
import FilePreview from '../FilePreview.jsx';
import AiGenerateButton from '../AiGenerateButton.jsx';
import CustomAiInstructions from '../CustomAiInstructions.jsx';
import AutofilledTag from '../AutofilledTag.jsx';
import { clearAutofilled } from '../../lib/autofill.js';
import { SquareFeetInput, PercentInput, YearInput } from '../inputs/FormattedInputs.jsx';

export default function OverviewSection({ value, onChange, omId, om, onUpdateOm }) {
  function set(field, val) {
    onChange({ ...value, [field]: val });
    clearAutofilled(om, onUpdateOm, `overview.${field}`);
  }

  function addPhotos(refs) {
    set('photos', [...(value.photos || []), ...refs]);
  }

  function removePhoto(file) {
    set('photos', (value.photos || []).filter((f) => f.id !== file.id));
  }

  const isMultifamily = om?.cover?.propertyType === 'Multifamily';

  return (
    <div className="section-form">
      <h2>Property Overview</h2>
      <p className="section-hint">Key physical and operational details about the asset.</p>

      <CustomAiInstructions
        value={om.aiInstructions?.overview}
        onChange={(text) => onUpdateOm({ aiInstructions: { ...om.aiInstructions, overview: text } })}
      />

      <div className="field-row cols-3">
        <div className="field">
          <div className="field-label-row">
            <label>Year Built</label>
            <AutofilledTag om={om} field="overview.yearBuilt" />
          </div>
          <YearInput value={value.yearBuilt} onChange={(v) => set('yearBuilt', v)} placeholder="2018" />
        </div>
        <div className="field">
          <div className="field-label-row">
            <label>Square Footage</label>
            <AutofilledTag om={om} field="overview.squareFootage" />
          </div>
          <SquareFeetInput value={value.squareFootage} onChange={(v) => set('squareFootage', v)} placeholder="e.g. 24,500 SF" />
        </div>
        <div className="field">
          <div className="field-label-row">
            <label>Lot Size</label>
            <AutofilledTag om={om} field="overview.lotSize" />
          </div>
          <input type="text" value={value.lotSize} onChange={(e) => set('lotSize', e.target.value)} placeholder="e.g. 1.8 acres" />
        </div>
      </div>

      <div className="field-row cols-3">
        {isMultifamily && (
          <div className="field">
            <div className="field-label-row">
              <label>Units</label>
              <AutofilledTag om={om} field="overview.units" />
            </div>
            <input type="text" value={value.units} onChange={(e) => set('units', e.target.value)} />
          </div>
        )}
        <div className="field">
          <label>Occupancy %</label>
          <PercentInput value={value.occupancyPct} onChange={(v) => set('occupancyPct', v)} placeholder="94%" />
        </div>
        <div className="field">
          <label>Zoning</label>
          <input type="text" value={value.zoning} onChange={(e) => set('zoning', e.target.value)} />
        </div>
        <div className="field">
          <label>Parking</label>
          <input type="text" value={value.parking} onChange={(e) => set('parking', e.target.value)} placeholder="e.g. 120 surface spaces" />
        </div>
        <div className="field">
          <div className="field-label-row">
            <label>Lease Type</label>
            <AutofilledTag om={om} field="overview.leaseType" />
          </div>
          <select value={value.leaseType} onChange={(e) => set('leaseType', e.target.value)}>
            <option value="">Select…</option>
            <option value="NNN">NNN</option>
            <option value="Gross">Gross</option>
            <option value="Modified Gross">Modified Gross</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="field">
        <div className="field-label-row">
          <label>Description</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AutofilledTag om={om} field="overview.description" />
            <AiGenerateButton omId={omId} kind="propertyDescription" om={om} onResult={(result) => set('description', result)} />
          </div>
        </div>
        <textarea value={value.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the property's condition, layout, and standout features…" />
      </div>

      <hr className="divider" />

      <div className="field">
        <label>Property Photos</label>
        <FileUpload omId={omId} accept="image/*,video/*" multiple hint="Upload exterior, interior, and aerial photos or video walkthroughs." onUploaded={addPhotos} />
        <FilePreview files={value.photos} onRemove={removePhoto} />
      </div>
    </div>
  );
}
