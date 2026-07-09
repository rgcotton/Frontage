import { useState } from 'react';
import { api } from '../../api.js';

const BACKGROUND_OPTIONS = [
  { value: 'white', label: 'White' },
  { value: 'lightGray', label: 'Light Gray' },
  { value: 'darkNavy', label: 'Dark Navy' },
];

const FONT_OPTIONS = [
  { value: '', label: 'Theme Default' },
  { value: 'modern', label: 'Modern – Helvetica' },
  { value: 'classic', label: 'Classic – Georgia / Times' },
  { value: 'bold', label: 'Bold – Helvetica Heavy' },
  { value: 'elegant-serif', label: 'Elegant Serif – Georgia Display' },
  { value: 'geometric-sans', label: 'Geometric Sans – Trebuchet MS' },
];

const LAYOUT_OPTIONS = [
  { value: 'default', label: 'Standard', desc: 'Large hero photo (default)' },
  { value: 'compact-hero', label: 'Compact Hero', desc: 'Smaller photo, more content area' },
];

const STAT_STYLE_OPTIONS = [
  { value: 'minimal', label: 'Minimal', desc: 'Stats on colored bar with dividers (default)' },
  { value: 'filled', label: 'Filled Boxes', desc: 'Each stat in its own accent-color box' },
];

export default function DesignSection({ value: valueProp, onChange, omId, om }) {
  // value is om.branding — guard against undefined for documents loaded before
  // the SECTION_DATA_KEY mapping was in place or missing branding fields.
  const value = valueProp ?? {};
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
      <h2>Design</h2>
      <p className="section-hint">Customize colors, fonts, and layout for this one-pager.</p>

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

      {hasLogo && (
        <div className="field">
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleExtractColors} disabled={analyzing}>
            {analyzing ? 'Extracting…' : '🎨 Extract Colors from Logo'}
          </button>
          {error && <p className="field-hint" style={{ color: 'var(--danger)' }}>{error}</p>}
          {suggestion && (
            <div className="geocode-banner">
              <div className="geocode-banner-text">
                <strong>Suggested:</strong>
                <span className="color-swatch" style={{ background: suggestion.primaryColor }} title={suggestion.primaryColor} />
                <span className="color-swatch" style={{ background: suggestion.accentColor }} title={suggestion.accentColor} />
                {suggestion.primaryColor} / {suggestion.accentColor}
              </div>
              <div className="geocode-banner-actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={applySuggestion}>Apply</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSuggestion(null)}>Dismiss</button>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="field-hint">Your logo will be used in the document regardless of color selection.</p>

      <div className="field">
        <label>Background Style</label>
        <select value={value.background} onChange={(e) => set('background', e.target.value)}>
          {BACKGROUND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Font Style</label>
        <select value={value.onePagerFont || ''} onChange={(e) => set('onePagerFont', e.target.value || null)}>
          {FONT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <p className="field-hint">Theme Default uses the font defined by the document template.</p>
      </div>

      <div className="field">
        <label>Layout</label>
        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          {LAYOUT_OPTIONS.map((opt) => {
            const isSelected = (value.onePagerLayout || 'default') === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('onePagerLayout', opt.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: isSelected ? '2px solid #1A2B4C' : '1px solid #E0E0E0',
                  borderRadius: 6,
                  background: isSelected ? 'rgba(26,43,76,0.05)' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: isSelected ? 600 : 500, color: '#111' }}>{opt.label}</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="field">
        <label>Stat Bar Style</label>
        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          {STAT_STYLE_OPTIONS.map((opt) => {
            const isSelected = (value.statStyle || 'minimal') === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('statStyle', opt.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: isSelected ? '2px solid #1A2B4C' : '1px solid #E0E0E0',
                  borderRadius: 6,
                  background: isSelected ? 'rgba(26,43,76,0.05)' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: isSelected ? 600 : 500, color: '#111' }}>{opt.label}</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <p className="field-hint">These selections apply live to the generated PDF every time you click Generate.</p>
    </div>
  );
}
