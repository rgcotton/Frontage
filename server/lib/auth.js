import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'frontage_session';

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET environment variable is not set');
  return s;
}

// Signs a 30-day session token for the given email.
export function signSession(email) {
  return jwt.sign({ email }, getSecret(), { expiresIn: '30d' });
}

// Reads and cryptographically verifies the session cookie.
// Returns the email string on success, null on missing/invalid/expired token.
// This is the only place in the server that derives the caller's identity —
// nothing trusts a client-supplied header anymore.
export function getOwnerEmail(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getSecret());
    return typeof payload.email === 'string' ? payload.email.toLowerCase() : null;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
