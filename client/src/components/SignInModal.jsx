import { useState } from 'react';
import { saveUser } from '../lib/user.js';
import { api } from '../api.js';

export default function SignInModal({ onComplete, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const canSubmit = email.trim() && !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const { email: verified } = await api.login(email.trim());
      const user = saveUser({ name: verified, email: verified });
      onComplete(user);
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Sign in to Frontage</h3>
        <p className="section-hint">Enter your email to get started. No password needed.</p>
        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginTop: 16 }}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@brokerage.com"
              autoFocus
              disabled={loading}
            />
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 13, margin: '4px 0 0' }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-gold btn-sm" disabled={!canSubmit}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
