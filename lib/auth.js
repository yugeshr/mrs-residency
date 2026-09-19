const crypto = require('crypto');

const COOKIE_NAME = 'mrs_admin_session';
const SESSION_LIFETIME = 60 * 60 * 8;

function encode(value) {
  return Buffer.from(value).toString('base64url');
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(first, second) {
  const firstHash = crypto.createHash('sha256').update(String(first)).digest();
  const secondHash = crypto.createHash('sha256').update(String(second)).digest();
  return crypto.timingSafeEqual(firstHash, secondHash);
}

function createSession(username) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters');
  const payload = encode(JSON.stringify({ username, expires: Date.now() + SESSION_LIFETIME * 1000 }));
  return `${payload}.${sign(payload, secret)}`;
}

function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map((part) => {
    const [key, ...value] = part.trim().split('=');
    return [key, decodeURIComponent(value.join('='))];
  }).filter(([key]) => key));
}

function verifySession(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload, secret))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return session.expires > Date.now() ? session : null;
  } catch {
    return null;
  }
}

function sessionCookie(token, req) {
  const secure = process.env.VERCEL || req.headers['x-forwarded-proto'] === 'https';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_LIFETIME}${secure ? '; Secure' : ''}`;
}

function clearSessionCookie(req) {
  const secure = process.env.VERCEL || req.headers['x-forwarded-proto'] === 'https';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`;
}

function requireAdmin(req, res) {
  const session = verifySession(req);
  if (!session) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  return session;
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const requestHost = req.headers['x-forwarded-host'] || req.headers.host;
    return originHost === requestHost;
  } catch {
    return false;
  }
}

module.exports = {
  clearSessionCookie,
  createSession,
  requireAdmin,
  safeEqual,
  sameOrigin,
  sessionCookie,
  verifySession
};
