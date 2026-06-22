import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';
import Flipbook from '../components/flipbook/Flipbook.jsx';

export default function SharePage() {
  const { id } = useParams();
  const [om, setOm] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getOm(id).then(setOm).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="center-page">This offering memorandum could not be found.</div>;
  if (!om) return <div className="center-page">Loading…</div>;

  return (
    <div className="share-page-shell">
      <Flipbook om={om} />
    </div>
  );
}
