import { useState } from 'react';
import { api } from '../api.js';

const FORMATS = [
  { value: 'pdf', label: 'PDF Document' },
  { value: 'pptx', label: 'PowerPoint Deck' },
  { value: 'web', label: 'Shareable Web Link' },
];

function isSectionComplete(om) {
  return {
    cover: Boolean(om.cover.propertyName && om.cover.addressLine1),
    overview: Boolean(om.overview.description),
    executiveSummary: Boolean(om.executiveSummary.narrative),
    market: Boolean(om.market.narrative),
    financials: Boolean(om.financials.askingPrice),
    salesComps: (om.salesComps || []).length > 0,
    rentComps: (om.rentComps || []).length > 0,
    team: (om.team || []).length > 0,
  };
}

const LABELS = {
  cover: 'Cover Page',
  overview: 'Property Overview',
  executiveSummary: 'Executive Summary',
  market: 'Market Overview',
  financials: 'Financials',
  salesComps: 'Sales Comps',
  rentComps: 'Rent Comps',
  team: 'Team',
};

export default function OutputPanel({ om }) {
  const [format, setFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.generate(om.id, format);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  const completion = isSectionComplete(om);
  const shareFullUrl = result?.shareUrl ? `${window.location.origin}${result.shareUrl}` : null;

  return (
    <aside className="editor-aside">
      <div className="output-panel">
        <h3>Generate Offering</h3>

        <div className="field">
          <label>Output Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-gold" style={{ width: '100%' }} onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating…' : 'Generate'}
        </button>

        {error && <div className="output-result" style={{ color: '#b3261e' }}>{error}</div>}

        {result && (
          <div className="output-result">
            {result.format === 'web' ? (
              <>
                <div>Shareable link ready:</div>
                <div className="share-url-box">
                  <input readOnly value={shareFullUrl} onFocus={(e) => e.target.select()} />
                  <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard.writeText(shareFullUrl)}>
                    Copy
                  </button>
                </div>
                <a href={result.shareUrl} target="_blank" rel="noreferrer">
                  Open preview →
                </a>
              </>
            ) : (
              <>
                <div>Your {result.format.toUpperCase()} is ready.</div>
                <a href={result.downloadUrl} target="_blank" rel="noreferrer" download>
                  Download {result.format.toUpperCase()} →
                </a>
              </>
            )}
          </div>
        )}

        <div className="checklist">
          <h4>Completeness</h4>
          {Object.entries(completion).map(([key, done]) => (
            <div className={`checklist-item ${done ? 'done' : ''}`} key={key}>
              <span className="check" />
              {LABELS[key]}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
