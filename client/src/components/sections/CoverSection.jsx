import { useState } from 'react';
import FileUpload from '../FileUpload.jsx';
import FilePreview from '../FilePreview.jsx';
import CustomAiInstructions from '../CustomAiInstructions.jsx';
import { api } from '../../api.js';

const PROPERTY_TYPES = ['Office', 'Retail', 'Industrial', 'Multifamily', 'Land', 'Mixed-Use', 'Hospitality', 'Other'];

export default function CoverSection({ value, onChange, omId, om, onUpdateOm }) {
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState(null);
  const [geocodeResult, setGeocodeResult] = useState(null);
  const [analyzingLogo, setAnalyzingLogo] = useState(false);
  const [logoSuggestion, setLogoSuggestion] = useState(null);
  const [logoError, setLogoError] = useState(null);

  function set(field, val) {
    onChange({ ...value, [field]: val });
  }

  async function handleLogoUploaded(refs) {
    set('brokerLogo', refs[0]);
    setLogoError(null);
    setLogoSuggestion(null);
    setAnalyzingLogo(true);
    try {
      const suggestion = await api.analyzeLogo(omId);
      setLogoSuggestion(suggestion);
    } catch (err) {
      setLogoError(err.message);
    } finally {
      setAnalyzingLogo(false);
    }
  }

  function applyLogoSuggestion() {
    onUpdateOm?.({ branding: { ...om.branding, primaryColor: logoSuggestion.primaryColor, accentColor: logoSuggestion.accentColor } });
    setLogoSuggestion(null);
  }

  async function handleValidateAddress() {
    setGeocoding(true);
    setGeocodeError(null);
    setGeocodeResult(null);
    try {
      const result = await api.geocodeAddress(omId);
      setGeocodeResult(result);
    } catch (err) {
      setGeocodeError(err.message);
    } finally {
      setGeocoding(false);
    }
  }

  function applyGeocodeResult() {
    onChange({
      ...value,
      formattedAddress: geocodeResult.formattedAddress,
      lat: geocodeResult.lat,
      lng: geocodeResult.lng,
      addressLine1: geocodeResult.addressLine1 || value.addressLine1,
      city: geocodeResult.city || value.city,
      state: geocodeResult.state || value.state,
      zip: geocodeResult.zip || value.zip,
    });
    setGeocodeResult(null);
  }

  return (
    <div className="section-form">
      <h2>Cover Page</h2>
      <p className="section-hint">The first impression — property identity, address, and hero imagery.</p>

      <CustomAiInstructions
        value={om.aiInstructions?.cover}
        onChange={(text) => onUpdateOm({ aiInstructions: { ...om.aiInstructions, cover: text } })}
      />

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

      <div className="field">
        <button type="button" className="btn btn-ghost btn-sm" onClick={handleValidateAddress} disabled={geocoding}>
          {geocoding ? 'Validating…' : '📍 Validate & Format Address'}
        </button>
        {geocodeError && (
          <p className="field-hint" style={{ color: 'var(--danger)' }}>
            {geocodeError}
          </p>
        )}
        {geocodeResult && (
          <div className="geocode-banner">
            <div className="geocode-banner-text">
              <strong>Suggested:</strong> {geocodeResult.formattedAddress}
            </div>
            <div className="geocode-banner-actions">
              <button type="button" className="btn btn-primary btn-sm" onClick={applyGeocodeResult}>
                Apply
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setGeocodeResult(null)}>
                Dismiss
              </button>
            </div>
          </div>
        )}
        {value.formattedAddress && (
          <p className="field-hint" style={{ marginTop: 8 }}>
            Validated: {value.formattedAddress}
          </p>
        )}
      </div>

      <hr className="divider" />

      <div className="field">
        <label>Cover Photo</label>
        <FileUpload omId={omId} accept="image/*" hint="JPG or PNG, used as the full-bleed hero image." onUploaded={(refs) => set('coverPhoto', refs[0])} />
        {value.coverPhoto && <FilePreview files={[value.coverPhoto]} onRemove={() => set('coverPhoto', null)} />}
      </div>

      <div className="field">
        <label>Broker / Brokerage Logo</label>
        <FileUpload omId={omId} accept="image/*" hint="Used automatically on the Cover, Team, and Back Cover pages." onUploaded={handleLogoUploaded} />
        {value.brokerLogo && <FilePreview files={[value.brokerLogo]} onRemove={() => set('brokerLogo', null)} />}
        {analyzingLogo && <p className="field-hint">Analyzing logo colors…</p>}
        {logoError && (
          <p className="field-hint" style={{ color: 'var(--danger)' }}>
            {logoError}
          </p>
        )}
        {logoSuggestion && (
          <div className="geocode-banner">
            <div className="geocode-banner-text">
              <strong>Suggested branding:</strong>
              <span className="color-swatch" style={{ background: logoSuggestion.primaryColor }} title={logoSuggestion.primaryColor} />
              <span className="color-swatch" style={{ background: logoSuggestion.accentColor }} title={logoSuggestion.accentColor} />
              {logoSuggestion.primaryColor} / {logoSuggestion.accentColor}
            </div>
            <div className="geocode-banner-actions">
              <button type="button" className="btn btn-primary btn-sm" onClick={applyLogoSuggestion}>
                Apply to Branding
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLogoSuggestion(null)}>
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      <hr className="divider" />

      <div className="field-row">
        <div className="field">
          <label>Brokerage Name</label>
          <input
            type="text"
            value={value.brokerageName}
            onChange={(e) => set('brokerageName', e.target.value)}
            placeholder="e.g. Cotton Commercial Real Estate"
          />
        </div>
        <div className="field">
          <label>Brokerage Website / Tagline</label>
          <input type="text" value={value.brokerageWebsite} onChange={(e) => set('brokerageWebsite', e.target.value)} placeholder="www.cottoncre.com" />
        </div>
      </div>
      <p className="field-hint" style={{ marginTop: -8, marginBottom: 16 }}>
        Shown in the footer bar of the One Pager.
      </p>
    </div>
  );
}
