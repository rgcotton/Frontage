import express from 'express';
import { signSession, COOKIE_NAME } from '../lib/auth.js';
import { recordLogin } from '../lib/loginLog.js';

const router = express.Router();

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

router.post('/login', async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'Email required' });
  await recordLogin(email);
  res.cookie(COOKIE_NAME, signSession(email), COOKIE_OPTS);
  res.json({ email });
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTS, maxAge: undefined });
  res.json({ ok: true });
});

export default router;
