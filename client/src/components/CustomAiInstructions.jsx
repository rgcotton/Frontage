export default function CustomAiInstructions({ value, onChange }) {
  return (
    <div className="field ai-instructions-field">
      <label>Custom AI Instructions</label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tell AI what to emphasize, exclude, or adjust for this section..."
        rows={2}
      />
    </div>
  );
}
