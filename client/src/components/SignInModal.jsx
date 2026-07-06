import { useState } from 'react';
import { saveUser } from '../lib/user.js';

export default function SignInModal({ onComplete, onClose }) {
  const [email, setEmail] = useState('');
  const canSubmit = email.trim();

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    const trimmedEmail = email.trim();
    const user = saveUser({ name: trimmedEmail, email: trimmedEmail });
    onComplete(user);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Sign in to Frontage</h3>
        <p className="section-hint">Enter your email to get started. No password needed.</p>
        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginTop: 16 }}>
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@brokerage.com" autoFocus />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-gold btn-sm" disabled={!canSubmit}>
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}