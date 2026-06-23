import { useState } from 'react';
import CustomAiInstructions from '../CustomAiInstructions.jsx';
import { api } from '../../api.js';

const BACKGROUND_OPTIONS = [
  { value: 'white', label: 'White' },
  { value: 'lightGray', label: 'Light Gray' },
  { value: 'darkNavy', label: 'Dark Navy' },
];

const FONT_OPTIONS = [
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
  { value: 'bold', label: 'Bold' },
];

export default function BrandingSection({ value, onChange, omId, om, onUpdateOm }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [error, setError] = useState(null);

  function set(field, val) {
    onChange({ ...value, [field]: val });
  }

  async function handleExtractColors() {
    setError(null);
    setSuggestion(null);
    setAnalyzing(true);
    try {
      const result = await api.analyzeLogo(omId);
      setSuggestion(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  function applySuggestion() {
    onChange({ ...value, primaryColor: suggestion.primaryColor, accentColor: suggestion.accentColor });
    setSuggestion(null);
  }

  const hasLogo = Boolean(om.cover?.brokerLogo);

  return (
    <div className="section-form">
      <h2>Branding</h2>
      <p className="section-hint">Customize the look of the generated PDF — colors, background, and typography.</p>

      <CustomAiInstructions
        value={om.aiInstructions?.branding}
        onChange={(text) => onUpdateOm({ aiInstructions: { ...om.aiInstructions, branding: text } })}
      />

      {hasLogo && (
        <div className="field">
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleExtractColors} disabled={analyzing}>
            {analyzing ? 'Extracting…' : '🎨 Extract Colors from Logo'}
          </button>
          {error && (
            <p className="field-hint" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}
          {suggestion && (
            <div className="geocode-banner">
              <div className="geocode-banner-text">
                <strong>Suggested:</strong>
                <span className="color-swatch" style={{ background: suggestion.primaryColor }} title={suggestion.primaryColor} />
                <span className="color-swatch" style={{ background: suggestion.accentColor }} title={suggestion.accentColor} />
                {suggestion.primaryColor} / {suggestion.accentColor}
              </div>
              <div className="geocode-banner-actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={applySuggestion}>
                  Apply
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSuggestion(null)}>
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="field-row">
        <div className="field">
          <label>Primary Color</label>
          <div className="color-field-row">
            <input type="color" value={value.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} />
            <input type="text" value={value.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Accent Color</label>
          <div className="color-field-row">
            <input type="color" value={value.accentColor} onChange={(e) => set('accentColor', e.target.value)} />
            <input type="text" value={value.accentColor} onChange={(e) => set('accentColor', e.target.value)} />
          </div>
        </div>
      </div>

      <p className="field-hint">Your logo will be used in the document regardless of color selection.</p>

      <div className="field-row">
        <div className="field">
          <label>Background Style</label>
          <select value={value.background} onChange={(e) => set('background', e.target.value)}>
            {BACKGROUND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Font Style</label>
          <select value={value.font} onChange={(e) => set('font', e.target.value)}>
            {FONT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="field-hint">These selections apply live to the generated PDF every time you click Generate.</p>
    </div>
  );
}
