const path = require('path');
const { requireAdmin, sameOrigin } = require('../lib/auth');
const { saveFile } = require('../lib/github');

const MIME_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

function matchesImageSignature(image, mimeType) {
  if (mimeType === 'image/jpeg') return image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
  if (mimeType === 'image/png') return image.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === 'image/webp') return image.subarray(0, 4).toString() === 'RIFF' && image.subarray(8, 12).toString() === 'WEBP';
  return false;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Invalid request origin' });
  if (!requireAdmin(req, res)) return;

  const { fileName = '', mimeType = '', data = '' } = req.body || {};
  const extension = MIME_EXTENSIONS[mimeType];
  if (!extension || typeof data !== 'string') {
    return res.status(400).json({ error: 'Choose a JPG, PNG or WebP image' });
  }

  const image = Buffer.from(data, 'base64');
  if (!image.length || image.length > 3 * 1024 * 1024) {
    return res.status(413).json({ error: 'Images must be smaller than 3 MB' });
  }
  if (!matchesImageSignature(image, mimeType)) {
    return res.status(400).json({ error: 'The uploaded file does not match its image type' });
  }

  const safeName = path.basename(fileName, path.extname(fileName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'hotel-photo';
  const destination = `assets/uploads/${Date.now()}-${safeName}${extension}`;

  try {
    await saveFile(destination, image, `Upload ${safeName} via admin CMS`);
    return res.status(201).json({ ok: true, path: destination });
  } catch (error) {
    console.error(error);
    return res.status(502).json({ error: 'Could not upload image to GitHub' });
  }
};
