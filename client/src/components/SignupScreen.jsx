import { useState } from 'react';
import { saveUser } from '../lib/user.js';

export default function SignupScreen({ onComplete }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const user = saveUser({ name: name.trim(), email: email.trim() });
    onComplete(user);
  }

  return (
    <div className="signup-screen">
      <div className="signup-card">
        <div className="signup-brand">
          <span className="dot" />
          PropDocs
        </div>
        <h1>Welcome to PropDocs</h1>
        <p>Tell us who you are so we can personalize your workspace. No password needed.</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Your Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Broker" />
          </div>
          <div className="field">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@brokerage.com" />
          </div>
          <button type="submit" className="btn btn-gold" style={{ width: '100%' }} disabled={!name.trim() || !email.trim()}>
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
}
