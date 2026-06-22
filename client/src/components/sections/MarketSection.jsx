import FileUpload from '../FileUpload.jsx';
import FilePreview from '../FilePreview.jsx';

export default function MarketSection({ value, onChange, omId }) {
  function set(field, val) {
    onChange({ ...value, [field]: val });
  }

  function addImages(refs) {
    set('images', [...(value.images || []), ...refs]);
  }

  function removeImage(file) {
    set('images', (value.images || []).filter((f) => f.id !== file.id));
  }

  return (
    <div className="section-form">
      <h2>Market Overview</h2>
      <p className="section-hint">Context on the submarket, demand drivers, and demographics.</p>

      <div className="field">
        <label>Market / Submarket Name</label>
        <input type="text" value={value.marketName} onChange={(e) => set('marketName', e.target.value)} placeholder="e.g. North Austin Submarket" />
      </div>

      <div className="field">
        <label>Market Narrative</label>
        <textarea value={value.narrative} onChange={(e) => set('narrative', e.target.value)} placeholder="Describe market trends, demand drivers, and growth outlook…" />
      </div>

      <div className="field">
        <label>Demographics</label>
        <textarea value={value.demographics} onChange={(e) => set('demographics', e.target.value)} placeholder="Population, household income, traffic counts, employment base…" />
      </div>

      <hr className="divider" />

      <div className="field">
        <label>Market Maps / Charts / Photos</label>
        <FileUpload omId={omId} accept="image/*,application/pdf" multiple hint="Upload maps, demographic charts, or area photos." onUploaded={addImages} />
        <FilePreview files={value.images} onRemove={removeImage} />
      </div>
    </div>
  );
}
