const { createSession, safeEqual, sameOrigin, sessionCookie } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Invalid request origin' });

  const configuredUsername = process.env.ADMIN_USERNAME;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredUsername || !configuredPassword || !process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    return res.status(503).json({ error: 'Admin authentication is not configured' });
  }

  const { username = '', password = '' } = req.body || {};
  if (!safeEqual(username, configuredUsername) || !safeEqual(password, configuredPassword)) {
    return res.status(401).json({ error: 'Incorrect username or password' });
  }

  const token = createSession(configuredUsername);
  res.setHeader('Set-Cookie', sessionCookie(token, req));
  return res.status(200).json({ ok: true, username: configuredUsername });
};
