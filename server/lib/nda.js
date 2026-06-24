import { nanoid } from 'nanoid';

// Not real auth, same bar as the rest of the app: an unguessable token is the
// access control. Once a recipient signs, their browser holds this token and
// presents it to unlock the document on subsequent visits in the same session.
export function createSignature(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) {
    const err = new Error('Your name is required to sign.');
    err.status = 400;
    throw err;
  }
  return {
    id: nanoid(8),
    name: trimmed,
    signedAt: new Date().toISOString(),
    token: nanoid(24),
  };
}

export function isValidSignatureToken(om, token) {
  if (!token) return false;
  return (om?.ndaSignatures || []).some((sig) => sig.token === token);
}
