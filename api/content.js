const { requireAdmin, sameOrigin } = require('../lib/auth');
const { getFile, saveFile } = require('../lib/github');

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  if (!sameOrigin(req)) return res.status(403).json({ error: 'Invalid request origin' });
  if (!requireAdmin(req, res)) return;

  const content = req.body;
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return res.status(400).json({ error: 'Invalid site content' });
  }

  const requiredSections = ['meta', 'hotel', 'hero', 'intro', 'rooms', 'gallery', 'amenities', 'location', 'faq', 'cta'];
  const requiredCollections = [
    content.hero?.facts,
    content.intro?.highlights,
    content.rooms?.items,
    content.gallery?.images,
    content.amenities?.items,
    content.location?.distances,
    content.faq?.items
  ];
  if (requiredSections.some((section) => !content[section] || typeof content[section] !== 'object') || requiredCollections.some((collection) => !Array.isArray(collection))) {
    return res.status(400).json({ error: 'One or more required content sections are missing' });
  }

  const serialized = `${JSON.stringify(content, null, 2)}\n`;
  if (Buffer.byteLength(serialized) > 512 * 1024) {
    return res.status(413).json({ error: 'Site content is too large' });
  }

  try {
    const current = await getFile('content/site.json');
    const result = await saveFile(
      'content/site.json',
      serialized,
      `Update website content via admin CMS`,
      current.sha
    );
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true, commit: result.commit?.sha });
  } catch (error) {
    console.error(error);
    return res.status(502).json({ error: 'Could not save content to GitHub' });
  }
};
