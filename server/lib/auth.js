// Lightweight identity, not real authentication: the client tells us who's asking
// via this header, and we trust it. No passwords, sessions, or tokens (yet).
export function getOwnerEmail(req) {
  const raw = req.get('x-user-email');
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  return trimmed || null;
}
