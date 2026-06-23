import { useState } from 'react';

export default function TextPromptModal({ title, label, initialValue = '', confirmLabel = 'Save', onSubmit, onClose }) {
  const [value, setValue] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(value.trim());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginTop: 16 }}>
            <label>{label}</label>
            <input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !value.trim()}>
              {submitting ? 'Saving…' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
