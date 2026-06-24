import FileUpload from '../FileUpload.jsx';
import FilePreview from '../FilePreview.jsx';
import AiGenerateButton from '../AiGenerateButton.jsx';
import CustomAiInstructions from '../CustomAiInstructions.jsx';
import AutofilledTag from '../AutofilledTag.jsx';
import { clearAutofilled, markAutofilled } from '../../lib/autofill.js';
import { YearInput, SquareFeetInput, PercentInput } from '../inputs/FormattedInputs.jsx';

const PROPERTY_TYPES = ['Office', 'Retail', 'Industrial', 'Multifamily', 'Land', 'Mixed-Use', 'Hospitality', 'Other'];

export default function PropertyInfoSection({ omId, om, onUpdateOm }) {
  const cover = om.cover || {};
  const overview = om.overview || {};

  function setCover(field, val) {
    onUpdateOm({ cover: { ...om.cover, [field]: val } });
    clearAutofilled(om, onUpdateOm, `cover.${field}`);
  }

  function setOverview(field, val) {
    onUpdateOm({ overview: { ...om.overview, [field]: val } });
    clearAutofilled(om, onUpdateOm, `overview.${field}`);
  }

  return (
    <div className="section-form">
      <h2>Property Info</h2>
      <p className="section-hint">The address, type, photo, and key stats shown on the One Pager.</p>

      <CustomAiInstructions
        value={om.aiInstructions?.cover}
        onChange={(text) => onUpdateOm({ aiInstructions: { ...om.aiInstructions, cover: text } })}
      />

      <div className="field">
        <div className="field-label-row">
          <label>Property Name</label>
          <AutofilledTag om={om} field="cover.propertyName" />
        </div>
        <input type="text" value={cover.propertyName} onChange={(e) => setCover('propertyName', e.target.value)} placeholder="e.g. Sunset Plaza Shopping Center" />
      </div>

      <div className="field">
        <div className="field-label-row">
          <label>Tagline</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AutofilledTag om={om} field="cover.tagline" />
            <AiGenerateButton
              omId={omId}
              kind="tagline"
              om={om}
              label="Generate Tagline"
              onResult={(result) => {
                setCover('tagline', result);
                markAutofilled(om, onUpdateOm, 'cover.tagline');
              }}
            />
          </div>
        </div>
        <input type="text" value={cover.tagline} onChange={(e) => setCover('tagline', e.target.value)} placeholder="e.g. Prime corner retail asset in a high-growth submarket" />
      </div>

      <div className="field-row">
        <div className="field">
          <div className="field-label-row">
            <label>Address Line 1</label>
            <AutofilledTag om={om} field="cover.addressLine1" />
          </div>
          <input type="text" value={cover.addressLine1} onChange={(e) => setCover('addressLine1', e.target.value)} />
        </div>
        <div className="field">
          <div className="field-label-row">
            <label>Property Type</label>
            <AutofilledTag om={om} field="cover.propertyType" />
          </div>
          <select value={cover.propertyType} onChange={(e) => setCover('propertyType', e.target.value)}>
            <option value="">Select type…</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row cols-3">
        <div className="field">
          <div className="field-label-row">
            <label>City</label>
            <AutofilledTag om={om} field="cover.city" />
          </div>
          <input type="text" value={cover.city} onChange={(e) => setCover('city', e.target.value)} />
        </div>
        <div className="field">
          <div className="field-label-row">
            <label>State</label>
            <AutofilledTag om={om} field="cover.state" />
          </div>
          <input type="text" value={cover.state} onChange={(e) => setCover('state', e.target.value)} />
        </div>
        <div className="field">
          <div className="field-label-row">
            <label>ZIP</label>
            <AutofilledTag om={om} field="cover.zip" />
          </div>
          <input type="text" value={cover.zip} onChange={(e) => setCover('zip', e.target.value)} />
        </div>
      </div>

      <hr className="divider" />

      <div className="field">
        <label>Hero Photo</label>
        <FileUpload omId={omId} accept="image/*" hint="JPG or PNG, used as the full-bleed hero image." onUploaded={(refs) => setCover('coverPhoto', refs[0])} />
        {cover.coverPhoto && <FilePreview files={[cover.coverPhoto]} onRemove={() => setCover('coverPhoto', null)} />}
      </div>

      <hr className="divider" />

      <div className="field-row cols-3">
        <div className="field">
          <div className="field-label-row">
            <label>Year Built</label>
            <AutofilledTag om={om} field="overview.yearBuilt" />
          </div>
          <YearInput value={overview.yearBuilt} onChange={(v) => setOverview('yearBuilt', v)} placeholder="2018" />
        </div>
        <div className="field">
          <div className="field-label-row">
            <label>Square Footage</label>
            <AutofilledTag om={om} field="overview.squareFootage" />
          </div>
          <SquareFeetInput value={overview.squareFootage} onChange={(v) => setOverview('squareFootage', v)} placeholder="e.g. 24,500 SF" />
        </div>
        <div className="field">
          <label>Zoning</label>
          <input type="text" value={overview.zoning} onChange={(e) => setOverview('zoning', e.target.value)} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Occupancy %</label>
          <PercentInput value={overview.occupancyPct} onChange={(v) => setOverview('occupancyPct', v)} placeholder="94%" />
        </div>
        <div className="field">
          <div className="field-label-row">
            <label>Lease Type</label>
            <AutofilledTag om={om} field="overview.leaseType" />
          </div>
          <select value={overview.leaseType} onChange={(e) => setOverview('leaseType', e.target.value)}>
            <option value="">Select…</option>
            <option value="NNN">NNN</option>
            <option value="Gross">Gross</option>
            <option value="Modified Gross">Modified Gross</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}
