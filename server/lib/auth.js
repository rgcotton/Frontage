// Lightweight identity, not real authentication: the client tells us who's asking
// via this header, and we trust it. No passwords, sessions, or tokens (yet).
export function getOwnerEmail(req) {
  const raw = req.get('x-user-email');
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  return trimmed || null;
}

// Shared front-door gate: these routes must stay reachable with no code at all,
// since external clients open share links without ever visiting the app.
const PUBLIC_PATH_PATTERNS = [
  /^\/[^/]+\/shared$/,
  /^\/[^/]+\/share-info$/,
  /^\/[^/]+\/nda\/sign$/,
  /^\/[^/]+\/static-map\.png$/,
];

// Requires a shared team access code on every request except the public share
// routes above. If ACCESS_CODE isn't set (local dev, tests), this is a no-op.
export function requireAccessCode(req, res, next) {
  if (PUBLIC_PATH_PATTERNS.some((re) => re.test(req.path))) return next();
  if (!process.env.ACCESS_CODE) return next();
  const code = req.get('x-access-code');
  if (code !== process.env.ACCESS_CODE) {
    return res.status(401).json({ error: 'Access code required' });
  }
  next();
}
