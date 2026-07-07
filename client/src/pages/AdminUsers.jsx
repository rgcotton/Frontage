import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const ADMIN_EMAIL = 'robbiecotton8@gmail.com';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export default function AdminUsers({ user }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    api.listUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
          ← Dashboard
        </button>
        <h2>Users</h2>
      </div>

      {loading && <p className="admin-status">Loading…</p>}
      {error && <p className="admin-status admin-status-error">{error}</p>}
      {!loading && !error && users.length === 0 && (
        <p className="admin-status">No logins recorded yet.</p>
      )}
      {!loading && !error && users.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Last Login</th>
              <th>Login Count</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email}>
                <td>{u.email}</td>
                <td>{formatDate(u.lastLogin)}</td>
                <td>{u.loginCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
