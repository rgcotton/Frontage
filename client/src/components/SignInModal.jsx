import { useState } from 'react';
import { saveUser } from '../lib/user.js';

export default function SignInModal({ onComplete, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const canSubmit = name.trim() && email.trim();

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    const user = saveUser({ name: name.trim(), email: email.trim() });
    onComplete(user);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Sign in to Frontage</h3>
        <p className="section-hint">Tell us who you are so we can load your saved documents. No password needed.</p>
        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginTop: 16 }}>
            <label>Your Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Broker" autoFocus />
          </div>
          <div className="field">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@brokerage.com" />
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
