import { useRef, useState } from 'react';
import { DOC_TYPE_LABELS, DOC_TYPE_DESCRIPTIONS } from '../lib/sectionsByDocType.js';

const DOC_TYPES = ['om', 'onePager', 'bov'];

export default function DocTypeSelectModal({ documents = [], onComplete, onImport, onClose, creating }) {
  const [step, setStep] = useState('type'); // 'type' | 'source' | 'pick' | 'import'
  const [docType, setDocType] = useState(null);
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const inputRef = useRef(null);

  function handlePickType(t) {
    setDocType(t);
    setStep('source');
  }

  function handleFileChosen(f) {
    if (!f) return;
    if (f.type !== 'application/pdf') return;
    setFile(f);
  }

  async function handleImportSubmit() {
    setImporting(true);
    try {
      await onImport(docType, file ? { kind: 'upload', file } : { kind: 'url', url: url.trim() });
    } finally {
      setImporting(false);
    }
  }

  const busy = creating || importing;

  return (
    <div className="modal-overlay" onClick={busy ? undefined : onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {step === 'type' && (
          <>
            <h3>Choose a document type</h3>
            <p className="section-hint">This can't be changed after the document is created.</p>
            <div className="doc-type-options">
              {DOC_TYPES.map((t) => (
                <button key={t} type="button" className="doc-type-option" onClick={() => handlePickType(t)} disabled={busy}>
                  <strong>{DOC_TYPE_LABELS[t]}</strong>
                  <span>{DOC_TYPE_DESCRIPTIONS[t]}</span>
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={busy}>
              Cancel
            </button>
          </>
        )}

        {step === 'source' && (
          <>
            <h3>How do you want to start?</h3>
            <p className="section-hint">You can edit everything by hand afterward, no matter which option you pick.</p>
            <div className="doc-type-options">
              <button type="button" className="doc-type-option" onClick={() => onComplete(docType, null)} disabled={busy}>
                <strong>Start from Scratch</strong>
                <span>Begin with a blank {DOC_TYPE_LABELS[docType]}.</span>
              </button>
              <button type="button" className="doc-type-option doc-type-option-featured" onClick={() => setStep('import')} disabled={busy}>
                <strong>Start from a Document ✨</strong>
                <span>Drop in a PDF brochure, package, or BOV — or paste a link — and AI fills in what it finds.</span>
              </button>
              {documents.length > 0 && (
                <button type="button" className="doc-type-option" onClick={() => setStep('pick')} disabled={busy}>
                  <strong>Copy from Existing Document</strong>
                  <span>Reuse property, broker, and deal info from one of your saved documents.</span>
                </button>
              )}
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep('type')} disabled={busy}>
              ← Back
            </button>
          </>
        )}

        {step === 'pick' && (
          <>
            <h3>Copy from which document?</h3>
            <p className="section-hint">Matching fields will be pre-filled. You can edit everything afterward.</p>
            <div className="doc-type-options doc-pick-list">
              {documents.map((d) => (
                <button key={d.id} type="button" className="doc-type-option" onClick={() => onComplete(docType, d.id)} disabled={busy}>
                  <strong>{d.propertyName || 'Untitled Property'}</strong>
                  <span>{DOC_TYPE_LABELS[d.docType] || DOC_TYPE_LABELS.om}</span>
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep('source')} disabled={busy}>
              ← Back
            </button>
          </>
        )}

        {step === 'import' && (
          <>
            <h3>Start from a Document</h3>
            <p className="section-hint">
              AI takes a strong first pass at filling in property name, address, price, cap rate, NOI, square footage, lease type, highlights, and
              more. Anything it can't find with confidence is left blank for you to fill in — review everything before generating the document.
            </p>

            {importing ? (
              <div className="import-loading">
                <div className="spinner" />
                <p>Reading your document and extracting fields… this can take up to 30 seconds.</p>
              </div>
            ) : (
              <>
                <div
                  className={`import-dropzone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFileChosen(e.dataTransfer.files?.[0]);
                  }}
                >
                  <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(e) => handleFileChosen(e.target.files?.[0])} />
                  {file ? (
                    <>
                      <strong>{file.name}</strong>
                      <span>Click to choose a different file</span>
                    </>
                  ) : (
                    <>
                      <strong>Drop a PDF here, or click to browse</strong>
                      <span>Brochure, offering memorandum, broker package, BOV — any PDF with property info.</span>
                    </>
                  )}
                </div>

                <div className="import-divider">or paste a link</div>

                <div className="field">
                  <input
                    type="text"
                    placeholder="https://example.com/property-brochure.pdf"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (e.target.value) setFile(null);
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep('source')}>
                    ← Back
                  </button>
                  <button type="button" className="btn btn-gold btn-sm" onClick={handleImportSubmit} disabled={!file && !url.trim()}>
                    Extract &amp; Continue
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
