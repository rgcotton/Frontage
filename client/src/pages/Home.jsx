import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import DocTypeSelectModal from '../components/DocTypeSelectModal.jsx';
import DocCardMenu from '../components/DocCardMenu.jsx';
import TextPromptModal from '../components/TextPromptModal.jsx';
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
  const [folders, setFolders] = useState([]);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showDocTypeModal, setShowDocTypeModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [renamingOm, setRenamingOm] = useState(null);
  const navigate = useNavigate();

  function loadAll() {
    return Promise.all([api.listOms(), api.listFolders()]).then(([omList, folderList]) => {
      setOms(omList);
      setFolders(folderList);
    });
  }

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
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

  async function handleCreateFolder(name) {
    await api.createFolder(name);
    await loadAll();
    setShowNewFolderModal(false);
  }

  async function handleDeleteFolder() {
    const folder = folders.find((f) => f.id === activeFolderId);
    if (!folder) return;
    if (!confirm(`Delete folder "${folder.name}"? Documents inside will move back to All Documents.`)) return;
    await api.deleteFolder(folder.id);
    setActiveFolderId(null);
    await loadAll();
  }

  async function handleRenameSubmit(newName) {
    await api.renameOm(renamingOm.id, newName);
    setRenamingOm(null);
    await loadAll();
  }

  async function handleDuplicate(om) {
    await api.duplicateOm(om.id);
    await loadAll();
  }

  async function handleMoveToFolder(om, folderId) {
    await api.updateOm(om.id, { folderId });
    await loadAll();
  }

  async function handleDelete(om) {
    if (!confirm(`Delete "${om.propertyName}"? This can't be undone.`)) return;
    await api.deleteOm(om.id);
    await loadAll();
  }

  const visibleOms = oms.filter((om) => (activeFolderId === null ? true : om.folderId === activeFolderId));

  return (
    <div className="home-page">
      <div className="home-header">
        <div>
          <h1>Your Documents</h1>
          <p>Build a polished Offering Memorandum, One Pager, or Broker Opinion of Value in minutes — fill in the details, then export as PDF, PowerPoint, or a shareable link.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowDocTypeModal(true)} disabled={creating}>
          {creating ? 'Creating…' : '+ New Document'}
        </button>
      </div>

      {!loading && (
        <div className="folder-bar">
          <button type="button" className={`folder-pill ${activeFolderId === null ? 'active' : ''}`} onClick={() => setActiveFolderId(null)}>
            All Documents
          </button>
          {folders.map((f) => (
            <button
              type="button"
              key={f.id}
              className={`folder-pill ${activeFolderId === f.id ? 'active' : ''}`}
              onClick={() => setActiveFolderId(f.id)}
            >
              📁 {f.name}
            </button>
          ))}
          <button type="button" className="folder-pill folder-pill-add" onClick={() => setShowNewFolderModal(true)}>
            + New Folder
          </button>
          {activeFolderId !== null && (
            <button type="button" className="folder-bar-delete" onClick={handleDeleteFolder}>
              Delete this folder
            </button>
          )}
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : visibleOms.length === 0 ? (
        <div className="empty-state">
          <p>{oms.length === 0 ? 'No documents yet. Create your first one to get started.' : 'No documents in this folder yet.'}</p>
        </div>
      ) : (
        <div className="om-grid">
          {visibleOms.map((om) => (
            <div key={om.id} className="om-card" onClick={() => navigate(`/om/${om.id}`)}>
              <DocCardMenu
                folders={folders}
                currentFolderId={om.folderId}
                onRename={() => setRenamingOm(om)}
                onDuplicate={() => handleDuplicate(om)}
                onMoveToFolder={(folderId) => handleMoveToFolder(om, folderId)}
                onDelete={() => handleDelete(om)}
              />
              <span className="om-card-doctype">{DOC_TYPE_LABELS[om.docType] || DOC_TYPE_LABELS.om}</span>
              <h3>{om.propertyName || 'Untitled Property'}</h3>
              <div className="meta">Last edited {formatDate(om.updatedAt)}</div>
            </div>
          ))}
        </div>
      )}

      {showDocTypeModal && (
        <DocTypeSelectModal onSelect={handleSelectDocType} onClose={() => setShowDocTypeModal(false)} creating={creating} />
      )}

      {showNewFolderModal && (
        <TextPromptModal
          title="New Folder"
          label="Folder name"
          confirmLabel="Create"
          onSubmit={handleCreateFolder}
          onClose={() => setShowNewFolderModal(false)}
        />
      )}

      {renamingOm && (
        <TextPromptModal
          title="Rename Document"
          label="Document name"
          initialValue={renamingOm.propertyName}
          confirmLabel="Rename"
          onSubmit={handleRenameSubmit}
          onClose={() => setRenamingOm(null)}
        />
      )}
    </div>
  );
}
