import { useState } from 'react';
import { DOC_TYPE_LABELS, DOC_TYPE_DESCRIPTIONS } from '../lib/sectionsByDocType.js';

const DOC_TYPES = ['om', 'onePager', 'bov'];

export default function DocTypeSelectModal({ documents = [], onComplete, onClose, creating }) {
  const [step, setStep] = useState('type'); // 'type' | 'source' | 'pick'
  const [docType, setDocType] = useState(null);

  function handlePickType(t) {
    setDocType(t);
    if (documents.length) {
      setStep('source');
    } else {
      onComplete(t, null);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {step === 'type' && (
          <>
            <h3>Choose a document type</h3>
            <p className="section-hint">This can't be changed after the document is created.</p>
            <div className="doc-type-options">
              {DOC_TYPES.map((t) => (
                <button key={t} type="button" className="doc-type-option" onClick={() => handlePickType(t)} disabled={creating}>
                  <strong>{DOC_TYPE_LABELS[t]}</strong>
                  <span>{DOC_TYPE_DESCRIPTIONS[t]}</span>
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={creating}>
              Cancel
            </button>
          </>
        )}

        {step === 'source' && (
          <>
            <h3>Start from scratch or copy from an existing document?</h3>
            <p className="section-hint">Copying brings over property, broker, and deal info that matches the new document's fields.</p>
            <div className="doc-type-options">
              <button type="button" className="doc-type-option" onClick={() => onComplete(docType, null)} disabled={creating}>
                <strong>Start from Scratch</strong>
                <span>Begin with a blank {DOC_TYPE_LABELS[docType]}.</span>
              </button>
              <button type="button" className="doc-type-option" onClick={() => setStep('pick')} disabled={creating}>
                <strong>Copy from Existing Document</strong>
                <span>Reuse property, broker, and deal info from one of your saved documents.</span>
              </button>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep('type')} disabled={creating}>
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
                <button key={d.id} type="button" className="doc-type-option" onClick={() => onComplete(docType, d.id)} disabled={creating}>
                  <strong>{d.propertyName || 'Untitled Property'}</strong>
                  <span>{DOC_TYPE_LABELS[d.docType] || DOC_TYPE_LABELS.om}</span>
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep('source')} disabled={creating}>
              ← Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
