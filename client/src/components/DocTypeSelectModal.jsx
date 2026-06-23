import { DOC_TYPE_LABELS, DOC_TYPE_DESCRIPTIONS } from '../lib/sectionsByDocType.js';

const DOC_TYPES = ['om', 'onePager', 'bov'];

export default function DocTypeSelectModal({ onSelect, onClose, creating }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Choose a document type</h3>
        <p className="section-hint">This can't be changed after the document is created.</p>
        <div className="doc-type-options">
          {DOC_TYPES.map((t) => (
            <button key={t} type="button" className="doc-type-option" onClick={() => onSelect(t)} disabled={creating}>
              <strong>{DOC_TYPE_LABELS[t]}</strong>
              <span>{DOC_TYPE_DESCRIPTIONS[t]}</span>
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={creating}>
          Cancel
        </button>
      </div>
    </div>
  );
}
