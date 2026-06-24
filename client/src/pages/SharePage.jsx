import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';
import Flipbook from '../components/flipbook/Flipbook.jsx';
import NdaGate from '../components/NdaGate.jsx';

function tokenKey(id) {
  return `nda_token_${id}`;
}

export default function SharePage() {
  const { id } = useParams();
  const [shareInfo, setShareInfo] = useState(null);
  const [om, setOm] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getShareInfo(id)
      .then(async (info) => {
        if (cancelled) return;
        setShareInfo(info);
        if (!info.requireNda) {
          const doc = await api.getSharedOm(id);
          if (!cancelled) setOm(doc);
          return;
        }
        const storedToken = sessionStorage.getItem(tokenKey(id));
        if (storedToken) {
          try {
            const doc = await api.getSharedOm(id, storedToken);
            if (!cancelled) setOm(doc);
          } catch {
            sessionStorage.removeItem(tokenKey(id));
          }
        }
      })
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleAgree(name) {
    const { token } = await api.signNda(id, name);
    sessionStorage.setItem(tokenKey(id), token);
    const doc = await api.getSharedOm(id, token);
    setOm(doc);
  }

  if (error) return <div className="center-page">This offering memorandum could not be found.</div>;
  if (!shareInfo) return <div className="center-page">Loading…</div>;
  if (shareInfo.requireNda && !om) {
    return <NdaGate propertyName={shareInfo.propertyName} ndaText={shareInfo.ndaText} onAgree={handleAgree} />;
  }
  if (!om) return <div className="center-page">Loading…</div>;

  return (
    <div className="share-page-shell">
      <Flipbook om={om} />
    </div>
  );
}
