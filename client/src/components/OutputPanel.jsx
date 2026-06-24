import { useState } from 'react';
import { api } from '../api.js';
import AiGenerateButton from './AiGenerateButton.jsx';
import { computeCompleteness, SECTION_LABELS } from '../lib/completeness.js';
import { getSectionsForDocType } from '../lib/sectionsByDocType.js';

const FORMATS = [
  { value: 'pdf', label: 'PDF Document' },
  { value: 'pptx', label: 'PowerPoint Deck' },
  { value: 'web', label: 'Shareable Web Link' },
];

export default function OutputPanel({ om, onUpdateOm }) {
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

  function setSharing(field, val) {
    onUpdateOm({ sharing: { ...om.sharing, [field]: val } });
  }

  const completion = computeCompleteness(om);
  const activeKeys = getSectionsForDocType(om.docType || 'om').map((s) => s.key);
  const shareFullUrl = result?.shareUrl ? `${window.location.origin}${result.shareUrl}` : null;
  const sharing = om.sharing || {};

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

        {format === 'web' && (
          <div className="nda-settings">
            <label className="checkbox-row">
              <input type="checkbox" checked={Boolean(sharing.requireNda)} onChange={(e) => setSharing('requireNda', e.target.checked)} />
              Require NDA before viewing
            </label>

            {sharing.requireNda && (
              <div className="nda-settings-detail">
                <div className="field-label-row">
                  <label>NDA Text</label>
                  <AiGenerateButton
                    omId={om.id}
                    kind="ndaAgreement"
                    om={om}
                    label={sharing.ndaText ? 'Regenerate' : 'Generate NDA'}
                    onResult={(result) => setSharing('ndaText', result)}
                  />
                </div>
                <textarea
                  value={sharing.ndaText || ''}
                  onChange={(e) => setSharing('ndaText', e.target.value)}
                  rows={8}
                  placeholder="Click Generate NDA to draft an agreement, or write your own."
                />
                <p className="field-hint">AI-generated -- review before relying on it. Recipients see this exact text before they can view the document.</p>

                {(om.ndaSignatures || []).length > 0 && (
                  <div className="nda-signatures">
                    <h4>Signed by ({om.ndaSignatures.length})</h4>
                    {om.ndaSignatures.map((s) => (
                      <div key={s.id} className="nda-signature-row">
                        <span>{s.name}</span>
                        <span className="nda-signature-time">{new Date(s.signedAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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
          {activeKeys.map((key) => (
            <div className={`checklist-item ${completion[key] ? 'done' : ''}`} key={key}>
              <span className="check" />
              {SECTION_LABELS[key]}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
