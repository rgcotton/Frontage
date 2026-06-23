import { useEffect, useRef, useState } from 'react';

export default function DocCardMenu({ folders, currentFolderId, onRename, onDuplicate, onMoveToFolder, onDelete }) {
  const [open, setOpen] = useState(false);
  const [showFolders, setShowFolders] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setShowFolders(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function closeAll() {
    setOpen(false);
    setShowFolders(false);
  }

  return (
    <div className="doc-card-menu" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="doc-card-menu-trigger"
        onClick={() => {
          setOpen((v) => !v);
          setShowFolders(false);
        }}
        aria-label="Document options"
      >
        ⋮
      </button>
      {open && (
        <div className="doc-card-menu-dropdown">
          {!showFolders ? (
            <>
              <button type="button" onClick={() => { closeAll(); onRename(); }}>
                Rename
              </button>
              <button type="button" onClick={() => { closeAll(); onDuplicate(); }}>
                Duplicate
              </button>
              <button type="button" onClick={() => setShowFolders(true)}>
                Move to Folder →
              </button>
              <button type="button" className="danger" onClick={() => { closeAll(); onDelete(); }}>
                Delete
              </button>
            </>
          ) : (
            <>
              <button type="button" className="doc-card-menu-back" onClick={() => setShowFolders(false)}>
                ← Back
              </button>
              <button
                type="button"
                className={currentFolderId == null ? 'active' : ''}
                onClick={() => { closeAll(); onMoveToFolder(null); }}
              >
                No Folder
              </button>
              {folders.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  className={currentFolderId === f.id ? 'active' : ''}
                  onClick={() => { closeAll(); onMoveToFolder(f.id); }}
                >
                  📁 {f.name}
                </button>
              ))}
              {!folders.length && <div className="doc-card-menu-empty">No folders yet</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
