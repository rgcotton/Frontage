import CustomAiInstructions from '../CustomAiInstructions.jsx';

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

export default function BrandingSection({ value, onChange, om, onUpdateOm }) {
  function set(field, val) {
    onChange({ ...value, [field]: val });
  }

  return (
    <div className="section-form">
      <h2>Branding</h2>
      <p className="section-hint">Customize the look of the generated PDF — colors, background, and typography.</p>

      <CustomAiInstructions
        value={om.aiInstructions?.branding}
        onChange={(text) => onUpdateOm({ aiInstructions: { ...om.aiInstructions, branding: text } })}
      />

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
