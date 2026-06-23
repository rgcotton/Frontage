import FileUpload from '../FileUpload.jsx';
import FilePreview from '../FilePreview.jsx';
import AiGenerateButton from '../AiGenerateButton.jsx';
import CustomAiInstructions from '../CustomAiInstructions.jsx';

export default function OverviewSection({ value, onChange, omId, om, onUpdateOm }) {
  function set(field, val) {
    onChange({ ...value, [field]: val });
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
          <label>Year Built</label>
          <input type="text" value={value.yearBuilt} onChange={(e) => set('yearBuilt', e.target.value)} />
        </div>
        <div className="field">
          <label>Square Footage</label>
          <input type="text" value={value.squareFootage} onChange={(e) => set('squareFootage', e.target.value)} placeholder="e.g. 24,500 SF" />
        </div>
        <div className="field">
          <label>Lot Size</label>
          <input type="text" value={value.lotSize} onChange={(e) => set('lotSize', e.target.value)} placeholder="e.g. 1.8 acres" />
        </div>
      </div>

      <div className="field-row cols-3">
        {isMultifamily && (
          <div className="field">
            <label>Units</label>
            <input type="text" value={value.units} onChange={(e) => set('units', e.target.value)} />
          </div>
        )}
        <div className="field">
          <label>Occupancy %</label>
          <input type="text" value={value.occupancyPct} onChange={(e) => set('occupancyPct', e.target.value)} placeholder="94%" />
        </div>
        <div className="field">
          <label>Zoning</label>
          <input type="text" value={value.zoning} onChange={(e) => set('zoning', e.target.value)} />
        </div>
        <div className="field">
          <label>Parking</label>
          <input type="text" value={value.parking} onChange={(e) => set('parking', e.target.value)} placeholder="e.g. 120 surface spaces" />
        </div>
      </div>

      <div className="field">
        <div className="field-label-row">
          <label>Description</label>
          <AiGenerateButton omId={omId} kind="propertyDescription" onResult={(result) => set('description', result)} />
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
