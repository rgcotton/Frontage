import FileUpload from '../FileUpload.jsx';
import FilePreview from '../FilePreview.jsx';

const PROPERTY_TYPES = ['Office', 'Retail', 'Industrial', 'Multifamily', 'Land', 'Mixed-Use', 'Hospitality', 'Other'];

export default function CoverSection({ value, onChange, omId }) {
  function set(field, val) {
    onChange({ ...value, [field]: val });
  }

  return (
    <div className="section-form">
      <h2>Cover Page</h2>
      <p className="section-hint">The first impression — property identity, address, and hero imagery.</p>

      <div className="field">
        <label>Property Name</label>
        <input type="text" value={value.propertyName} onChange={(e) => set('propertyName', e.target.value)} placeholder="e.g. Sunset Plaza Shopping Center" />
      </div>

      <div className="field">
        <label>Tagline</label>
        <input type="text" value={value.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="e.g. Prime corner retail asset in a high-growth submarket" />
      </div>

      <div className="field-row">
        <div className="field">
          <label>Address Line 1</label>
          <input type="text" value={value.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} />
        </div>
        <div className="field">
          <label>Property Type</label>
          <select value={value.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
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
          <label>City</label>
          <input type="text" value={value.city} onChange={(e) => set('city', e.target.value)} />
        </div>
        <div className="field">
          <label>State</label>
          <input type="text" value={value.state} onChange={(e) => set('state', e.target.value)} />
        </div>
        <div className="field">
          <label>ZIP</label>
          <input type="text" value={value.zip} onChange={(e) => set('zip', e.target.value)} />
        </div>
      </div>

      <hr className="divider" />

      <div className="field">
        <label>Cover Photo</label>
        <FileUpload omId={omId} accept="image/*" hint="JPG or PNG, used as the full-bleed hero image." onUploaded={(refs) => set('coverPhoto', refs[0])} />
        {value.coverPhoto && <FilePreview files={[value.coverPhoto]} onRemove={() => set('coverPhoto', null)} />}
      </div>

      <div className="field">
        <label>Broker / Brokerage Logo</label>
        <FileUpload omId={omId} accept="image/*" hint="Appears on the cover page." onUploaded={(refs) => set('brokerLogo', refs[0])} />
        {value.brokerLogo && <FilePreview files={[value.brokerLogo]} onRemove={() => set('brokerLogo', null)} />}
      </div>
    </div>
  );
}
