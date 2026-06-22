import FileUpload from '../FileUpload.jsx';
import FilePreview from '../FilePreview.jsx';
import AiGenerateButton from '../AiGenerateButton.jsx';

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
        <div className="field-label-row">
          <label>Market Narrative</label>
          <AiGenerateButton omId={omId} kind="marketNarrative" onResult={(result) => set('narrative', result)} />
        </div>
        <textarea value={value.narrative} onChange={(e) => set('narrative', e.target.value)} placeholder="Describe market trends, demand drivers, and growth outlook…" />
      </div>

      <hr className="divider" />

      <div className="subsection-title">Demographics</div>
      <div className="field-row cols-3">
        <div className="field">
          <label>Population</label>
          <input type="text" value={value.population} onChange={(e) => set('population', e.target.value)} placeholder="48,200" />
        </div>
        <div className="field">
          <label>Median Household Income</label>
          <input type="text" value={value.medianIncome} onChange={(e) => set('medianIncome', e.target.value)} placeholder="$78,500" />
        </div>
        <div className="field">
          <label>Daytime Population</label>
          <input type="text" value={value.daytimePopulation} onChange={(e) => set('daytimePopulation', e.target.value)} placeholder="62,000" />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Traffic Count (VPD)</label>
          <input type="text" value={value.trafficCount} onChange={(e) => set('trafficCount', e.target.value)} placeholder="28,900" />
        </div>
      </div>

      <hr className="divider" />

      <div className="subsection-title">Submarket Trends</div>
      <div className="field-row">
        <div className="field">
          <label>Submarket Vacancy Rate</label>
          <input type="text" value={value.submarketVacancyRate} onChange={(e) => set('submarketVacancyRate', e.target.value)} placeholder="5.2%" />
        </div>
        <div className="field">
          <label>Asking Rents</label>
          <input type="text" value={value.askingRents} onChange={(e) => set('askingRents', e.target.value)} placeholder="$28–32/SF NNN" />
        </div>
      </div>
      <div className="field">
        <label>Absorption Trends</label>
        <textarea value={value.absorptionTrends} onChange={(e) => set('absorptionTrends', e.target.value)} placeholder="Describe recent net absorption and leasing velocity in the submarket…" />
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
