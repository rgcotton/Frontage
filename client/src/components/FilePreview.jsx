function kindLabel(mimetype) {
  if (mimetype.startsWith('image/')) return null;
  if (mimetype.startsWith('video/')) return 'VID';
  if (mimetype === 'application/pdf') return 'PDF';
  if (mimetype.includes('word')) return 'DOC';
  if (mimetype.includes('sheet') || mimetype.includes('excel')) return 'XLS';
  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'PPT';
  return 'FILE';
}

export default function FilePreview({ files, onRemove }) {
  if (!files || !files.length) return null;
  return (
    <div className="file-preview-grid">
      {files.map((f) => {
        const badge = kindLabel(f.mimetype);
        return (
          <div className="file-chip" key={f.id}>
            {badge ? <span className="thumb-icon">{badge}</span> : <img className="thumb" src={f.url} alt={f.originalName} />}
            <span className="name" title={f.originalName}>
              {f.originalName}
            </span>
            {onRemove && (
              <button type="button" onClick={() => onRemove(f)} title="Remove">
                ✕
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
