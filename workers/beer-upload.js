// Cloudflare Worker: receives beer admin actions from js/beer-admin.js
// and writes the image + jsonl entry to GitHub via the REST API.
//
// Required environment variables (Worker dashboard → Settings → Variables):
//   GITHUB_TOKEN     - fine-grained PAT with Contents: Read & Write
//   GITHUB_REPO      - "owner/repo", e.g. "XINZHANG-OPS/personal_page"
//   ADMIN_PASSWORD   - shared secret matching the admin password
//   GITHUB_BRANCH    - optional, defaults to "main"
//   ALLOWED_ORIGIN   - optional, e.g. "https://xinzhang-ops.github.io"
//                      (defaults to "*"; set to your Pages origin for safety)
//
// Request body (POST JSON):
//   { password, action: "create"|"update"|"delete", beer, imageDataUrl? }

const CORS = (origin) => ({
  'Access-Control-Allow-Origin': origin || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Max-Age': '86400',
});

export default {
  async fetch(request, env) {
    const cors = CORS(env.ALLOWED_ORIGIN || '*');

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405, cors);

    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'invalid json' }, 400, cors); }

    const { password, action, beer, imageDataUrl } = body || {};
    if (!password || password !== env.ADMIN_PASSWORD) {
      return json({ error: 'unauthorized' }, 401, cors);
    }
    if (!['create', 'update', 'delete'].includes(action)) {
      return json({ error: 'invalid action' }, 400, cors);
    }
    if (!beer || !beer.id) return json({ error: 'beer.id is required' }, 400, cors);

    const repo = env.GITHUB_REPO;
    const branch = env.GITHUB_BRANCH || 'main';
    const token = env.GITHUB_TOKEN;
    if (!repo || !token) return json({ error: 'worker not configured' }, 500, cors);

    const gh = new Github(repo, branch, token);

    try {
      const jsonl = await gh.getFile('data/beer.jsonl');
      const existing = jsonl ? parseJsonl(b64decode(jsonl.content)) : [];
      const idx = existing.findIndex((b) => b.id === beer.id);

      let updated;
      let commitMessage;

      if (action === 'create') {
        if (idx >= 0) return json({ error: `id "${beer.id}" already exists` }, 409, cors);
        if (!beer.name || !beer.notes || !beer.scores) return json({ error: 'missing beer fields' }, 400, cors);
        if (!imageDataUrl) return json({ error: 'imageDataUrl required for create' }, 400, cors);
        updated = [...existing, beer];
        commitMessage = `admin: add beer ${beer.name}`;
      } else if (action === 'update') {
        if (idx < 0) return json({ error: `id "${beer.id}" not found` }, 404, cors);
        if (!beer.name || !beer.notes || !beer.scores) return json({ error: 'missing beer fields' }, 400, cors);
        updated = [...existing];
        updated[idx] = beer;
        commitMessage = `admin: update beer ${beer.name}`;
      } else { // delete
        if (idx < 0) return json({ error: `id "${beer.id}" not found` }, 404, cors);
        updated = existing.filter((b) => b.id !== beer.id);
        commitMessage = `admin: delete beer ${beer.id}`;
      }

      // Upload image first (so jsonl never points at a missing image)
      if (imageDataUrl && (action === 'create' || action === 'update')) {
        if (!imageDataUrl.startsWith('data:image/')) {
          return json({ error: 'invalid imageDataUrl' }, 400, cors);
        }
        const imageB64 = imageDataUrl.split(',', 2)[1];
        const imagePath = `assets/images/beers/${beer.id}.jpg`;
        const existingImage = await gh.getFile(imagePath);
        await gh.putFile(imagePath, imageB64, `admin: image for ${beer.id}`, existingImage?.sha);
      }

      // Write jsonl
      const content = updated.map((b) => JSON.stringify(b)).join('\n') + (updated.length ? '\n' : '');
      const commit = await gh.putFile('data/beer.jsonl', b64encode(content), commitMessage, jsonl?.sha);

      return json({
        ok: true,
        action,
        beer: beer.id,
        commit: commit.commit?.sha,
        total: updated.length,
      }, 200, cors);
    } catch (err) {
      return json({ error: err.message || String(err) }, 500, cors);
    }
  },
};

// --- helpers ---

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

function parseJsonl(text) {
  return text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}

// UTF-8 safe base64 helpers
function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function b64decode(b64) {
  const bin = atob(b64.replace(/\n/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

class Github {
  constructor(repo, branch, token) {
    this.repo = repo;
    this.branch = branch;
    this.token = token;
    this.base = `https://api.github.com/repos/${repo}/contents`;
  }

  headers() {
    return {
      authorization: `Bearer ${this.token}`,
      accept: 'application/vnd.github+json',
      'user-agent': 'beer-admin-worker',
      'x-github-api-version': '2022-11-28',
    };
  }

  async getFile(path) {
    const res = await fetch(`${this.base}/${encodeURI(path)}?ref=${this.branch}`, {
      headers: this.headers(),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`get ${path}: ${res.status} ${await res.text()}`);
    return res.json();
  }

  async putFile(path, base64Content, message, sha) {
    const body = { message, content: base64Content, branch: this.branch };
    if (sha) body.sha = sha;
    const res = await fetch(`${this.base}/${encodeURI(path)}`, {
      method: 'PUT',
      headers: { ...this.headers(), 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`put ${path}: ${res.status} ${await res.text()}`);
    return res.json();
  }
}
