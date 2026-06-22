import { useState } from 'react';
import { api } from '../api.js';

export default function AiGenerateButton({ omId, kind, extra, onResult, label = 'Generate with AI' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.generateAi(omId, kind, extra);
      onResult(res.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="ai-generate">
      <button type="button" className="ai-generate-btn" onClick={handleClick} disabled={loading}>
        {loading ? 'Generating…' : `✨ ${label}`}
      </button>
      {error && <span className="ai-generate-error">{error}</span>}
    </span>
  );
}
