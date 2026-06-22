import { useRef, useState } from 'react';
import { api } from '../api.js';

export default function FileUpload({ omId, accept, multiple, label, hint, onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleChange(e) {
    const files = e.target.files;
    if (!files || !files.length) return;
    setUploading(true);
    setError(null);
    try {
      const refs = await api.uploadFiles(omId, files);
      onUploaded(refs);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="file-upload">
      {label && <span className="file-upload-top">{label}</span>}
      <label className="file-upload-button">
        {uploading ? 'Uploading…' : multiple ? 'Choose files' : 'Choose file'}
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={handleChange} hidden />
      </label>
      {hint && <p className="file-upload-hint">{hint}</p>}
      {error && <p className="file-upload-error">{error}</p>}
    </div>
  );
}
