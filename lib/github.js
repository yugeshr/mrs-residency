const REPOSITORY = process.env.GITHUB_REPO || 'yugeshr/mrs-residency';
const BRANCH = process.env.GITHUB_BRANCH || 'main';

function githubHeaders() {
  if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is not configured');
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'mrs-residency-cms'
  };
}

async function githubRequest(path, options = {}) {
  const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/contents/${path}`, {
    ...options,
    headers: { ...githubHeaders(), ...options.headers }
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GitHub API ${response.status}: ${details.slice(0, 300)}`);
  }
  return response.json();
}

async function getFile(path) {
  return githubRequest(`${path}?ref=${encodeURIComponent(BRANCH)}`);
}

async function saveFile(path, content, message, sha) {
  return githubRequest(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      branch: BRANCH,
      ...(sha ? { sha } : {})
    })
  });
}

module.exports = { getFile, saveFile };
