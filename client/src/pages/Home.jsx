import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import DocTypeSelectModal from '../components/DocTypeSelectModal.jsx';
import { DOC_TYPE_LABELS } from '../lib/sectionsByDocType.js';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function Home() {
  const [oms, setOms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showDocTypeModal, setShowDocTypeModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .listOms()
      .then(setOms)
      .finally(() => setLoading(false));
  }, []);

  async function handleSelectDocType(docType) {
    setCreating(true);
    try {
      const om = await api.createOm(docType);
      navigate(`/om/${om.id}`);
    } catch (err) {
      alert(`Could not create offering: ${err.message}`);
      setCreating(false);
      setShowDocTypeModal(false);
    }
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <div>
          <h1>Your Offering Memorandums</h1>
          <p>Build a polished OM in minutes — fill in the details, then export as PDF, PowerPoint, or a shareable link.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowDocTypeModal(true)} disabled={creating}>
          {creating ? 'Creating…' : '+ New Offering Memorandum'}
        </button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : oms.length === 0 ? (
        <div className="empty-state">
          <p>No offering memorandums yet. Create your first one to get started.</p>
        </div>
      ) : (
        <div className="om-grid">
          {oms.map((om) => (
            <a key={om.id} className="om-card" href={`/om/${om.id}`}>
              <span className="om-card-doctype">{DOC_TYPE_LABELS[om.docType] || DOC_TYPE_LABELS.om}</span>
              <h3>{om.propertyName || 'Untitled Property'}</h3>
              <div className="meta">Last edited {formatDate(om.updatedAt)}</div>
            </a>
          ))}
        </div>
      )}

      {showDocTypeModal && (
        <DocTypeSelectModal onSelect={handleSelectDocType} onClose={() => setShowDocTypeModal(false)} creating={creating} />
      )}
    </div>
  );
}
