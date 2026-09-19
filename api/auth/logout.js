const { clearSessionCookie, sameOrigin } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Invalid request origin' });
  res.setHeader('Set-Cookie', clearSessionCookie(req));
  return res.status(200).json({ ok: true });
};
