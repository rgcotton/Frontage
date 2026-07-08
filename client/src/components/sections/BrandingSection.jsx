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

const TEMPLATE_OPTIONS = [
  { value: 'institutional', label: 'Institutional', desc: 'Classic navy/gold' },
  { value: 'editorial',     label: 'Editorial',     desc: 'Magazine serif' },
  { value: 'bold',          label: 'Bold',           desc: 'Modern marketing' },
  { value: 'minimal',       label: 'Minimal',        desc: 'Clean hairline' },
];

function InstitutionalSwatch() {
  return (
    <div style={{ width: 80, height: 56, background: '#1A2B4C', position: 'relative', overflow: 'hidden', borderRadius: 3 }}>
      {/* Gold bar at top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: '#C9A227' }} />
      {/* White title lines */}
      <div style={{ position: 'absolute', top: '60%', left: 8, right: 16, height: 3, background: 'rgba(255,255,255,0.85)', borderRadius: 1 }} />
      <div style={{ position: 'absolute', top: '75%', left: 8, right: 24, height: 3, background: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
    </div>
  );
}

function EditorialSwatch() {
  return (
    <div style={{ width: 80, height: 56, background: 'white', border: '1px solid #E0E0E0', position: 'relative', overflow: 'hidden', borderRadius: 3 }}>
      {/* Thin sienna line at top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: '#8B4513' }} />
      {/* Thick serif title line */}
      <div style={{ position: 'absolute', top: '50%', left: 8, right: 12, height: 3, background: '#1A1A1A', borderRadius: 1 }} />
      {/* Thinner subtitle line */}
      <div style={{ position: 'absolute', top: '65%', left: 8, right: 20, height: 1.5, background: '#555', borderRadius: 1 }} />
    </div>
  );
}

function BoldSwatch() {
  return (
    <div style={{ width: 80, height: 56, position: 'relative', overflow: 'hidden', borderRadius: 3, display: 'flex' }}>
      {/* Left 40% navy */}
      <div style={{ width: '40%', background: '#0F1A2E', position: 'relative', flexShrink: 0 }}>
        {/* White lines on navy side */}
        <div style={{ position: 'absolute', top: '55%', left: 4, right: 4, height: 2.5, background: 'rgba(255,255,255,0.9)', borderRadius: 1 }} />
        <div style={{ position: 'absolute', top: '70%', left: 4, right: 6, height: 2, background: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
      </div>
      {/* Right 60% light blue-gray */}
      <div style={{ flex: 1, background: '#D0D5DE' }} />
    </div>
  );
}

function MinimalSwatch() {
  return (
    <div style={{ width: 80, height: 56, background: 'white', border: '1px solid #E0E0E0', position: 'relative', overflow: 'hidden', borderRadius: 3 }}>
      {/* Thin blue line at very top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#2563EB' }} />
      {/* Black text lines top-left */}
      <div style={{ position: 'absolute', top: '20%', left: 6, width: 36, height: 2, background: '#111', borderRadius: 1 }} />
      <div style={{ position: 'absolute', top: '32%', left: 6, width: 24, height: 1.5, background: '#444', borderRadius: 1 }} />
    </div>
  );
}

const SWATCHES = {
  institutional: InstitutionalSwatch,
  editorial: EditorialSwatch,
  bold: BoldSwatch,
  minimal: MinimalSwatch,
};

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
  const selectedTemplate = value.template || 'institutional';

  return (
    <div className="section-form">
      <h2>Branding</h2>
      <p className="section-hint">Customize the look of the generated PDF — colors, background, and typography.</p>

      <CustomAiInstructions
        value={om.aiInstructions?.branding}
        onChange={(text) => onUpdateOm({ aiInstructions: { ...om.aiInstructions, branding: text } })}
      />

      {/* Template Picker */}
      <div className="field">
        <label>Template</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 6 }}>
          {TEMPLATE_OPTIONS.map((option) => {
            const SwatchComponent = SWATCHES[option.value];
            const isSelected = selectedTemplate === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => set('template', option.value)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: 8,
                  border: isSelected ? '2px solid #1A2B4C' : '1px solid #E0E0E0',
                  borderRadius: 6,
                  background: isSelected ? 'rgba(26,43,76,0.05)' : 'white',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <SwatchComponent />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: isSelected ? 600 : 500, color: '#111', lineHeight: 1.2 }}>
                    {option.label}
                  </div>
                  <div style={{ fontSize: 10, color: '#888', lineHeight: 1.2, marginTop: 2 }}>
                    {option.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

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
        {!value.template && (
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
        )}
      </div>

      <p className="field-hint">These selections apply live to the generated PDF every time you click Generate.</p>
    </div>
  );
}
