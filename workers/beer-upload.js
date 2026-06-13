// Cloudflare Worker: receives beer admin actions from js/beer-admin.js
// and commits jsonl + images to GitHub.
//
// Required environment variables (Worker dashboard → Settings → Variables):
//   GITHUB_TOKEN     - fine-grained PAT with Contents: Read & Write
//   GITHUB_REPO      - "owner/repo", e.g. "XINZHANG-OPS/personal_page"
//   ADMIN_PASSWORD   - shared secret matching the admin password
//   GITHUB_BRANCH    - optional, defaults to "main"
//   ALLOWED_ORIGIN   - optional, e.g. "https://personal-page-8db.pages.dev"
//
// Request body (POST JSON):
//   Legacy single-op (still supported):
//     { password, action: "create"|"update"|"delete", beer, imageDataUrl? }
//   New batch (all ops collapsed into ONE git commit):
//     { password, action: "batch", operations: [
//         { action: "create"|"update"|"delete", beer, imageDataUrl? }, ...
//       ] }

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

    const { password, action } = body || {};
    if (!password || password !== env.ADMIN_PASSWORD) {
      return json({ error: 'unauthorized' }, 401, cors);
    }

    const repo = env.GITHUB_REPO;
    const branch = env.GITHUB_BRANCH || 'main';
    const token = env.GITHUB_TOKEN;
    if (!repo || !token) return json({ error: 'worker not configured' }, 500, cors);

    const gh = new Github(repo, branch, token);

    try {
      let operations;
      if (action === 'batch') {
        operations = Array.isArray(body.operations) ? body.operations : null;
        if (!operations || !operations.length) {
          return json({ error: 'operations[] is required and non-empty' }, 400, cors);
        }
      } else if (['create', 'update', 'delete'].includes(action)) {
        operations = [{ action, beer: body.beer, imageDataUrl: body.imageDataUrl }];
      } else {
        return json({ error: 'invalid action' }, 400, cors);
      }

      // Validate every op up-front
      for (const op of operations) {
        if (!op || !op.action || !['create', 'update', 'delete'].includes(op.action)) {
          return json({ error: 'each op needs a valid action' }, 400, cors);
        }
        if (!op.beer || !op.beer.id) {
          return json({ error: 'each op needs beer.id' }, 400, cors);
        }
        if (op.action === 'create' || op.action === 'update') {
          if (!op.beer.name || !op.beer.notes || !op.beer.scores) {
            return json({ error: `missing beer fields for ${op.beer.id}` }, 400, cors);
          }
        }
        if (op.action === 'create' && !op.imageDataUrl) {
          return json({ error: `imageDataUrl required for create ${op.beer.id}` }, 400, cors);
        }
      }

      // Load current jsonl + apply all ops in memory
      const jsonl = await gh.getFile('data/beer.jsonl');
      let beers = jsonl ? parseJsonl(b64decode(jsonl.content)) : [];

      const summary = { created: 0, updated: 0, deleted: 0 };
      const imageBlobs = []; // { path, sha }

      for (const op of operations) {
        const { beer } = op;
        const idx = beers.findIndex((b) => b.id === beer.id);
        if (op.action === 'create') {
          if (idx >= 0) return json({ error: `id "${beer.id}" already exists` }, 409, cors);
          beers.push(beer);
          summary.created++;
        } else if (op.action === 'update') {
          if (idx < 0) return json({ error: `id "${beer.id}" not found` }, 404, cors);
          beers[idx] = beer;
          summary.updated++;
        } else {
          if (idx < 0) return json({ error: `id "${beer.id}" not found` }, 404, cors);
          beers = beers.filter((b) => b.id !== beer.id);
          summary.deleted++;
        }
      }

      // Pre-upload every image as a blob so we can put them in the same tree
      for (const op of operations) {
        if (!op.imageDataUrl) continue;
        if (op.action !== 'create' && op.action !== 'update') continue;
        if (!op.imageDataUrl.startsWith('data:image/')) {
          return json({ error: `invalid imageDataUrl for ${op.beer.id}` }, 400, cors);
        }
        const b64 = op.imageDataUrl.split(',', 2)[1];
        const blob = await gh.createBlob(b64, 'base64');
        imageBlobs.push({ path: `assets/images/beers/${op.beer.id}.jpg`, sha: blob.sha });
      }

      // Serialize the new jsonl as a blob too
      const newJsonl = beers.map((b) => JSON.stringify(b)).join('\n') + (beers.length ? '\n' : '');
      const jsonlBlob = await gh.createBlob(b64encode(newJsonl), 'base64');

      // Build a tree from HEAD adding/updating those paths
      const headRef = await gh.getRef(`heads/${branch}`);
      const headCommit = await gh.getCommit(headRef.object.sha);
      const baseTreeSha = headCommit.tree.sha;

      const treeEntries = [
        { path: 'data/beer.jsonl', mode: '100644', type: 'blob', sha: jsonlBlob.sha },
        ...imageBlobs.map(({ path, sha }) => ({ path, mode: '100644', type: 'blob', sha })),
      ];
      const newTree = await gh.createTree(baseTreeSha, treeEntries);

      // Compose commit message
      const parts = [];
      if (summary.created) parts.push(`+${summary.created}`);
      if (summary.updated) parts.push(`~${summary.updated}`);
      if (summary.deleted) parts.push(`-${summary.deleted}`);
      const message = operations.length === 1
        ? singleOpMessage(operations[0])
        : `admin: batch ${parts.join(' ')}`;

      const newCommit = await gh.createCommit(message, newTree.sha, [headRef.object.sha]);
      await gh.updateRef(`heads/${branch}`, newCommit.sha);

      return json({
        ok: true,
        action,
        commit: newCommit.sha,
        summary,
        total: beers.length,
      }, 200, cors);
    } catch (err) {
      return json({ error: err.message || String(err) }, 500, cors);
    }
  },
};

function singleOpMessage(op) {
  const name = op.beer.name || op.beer.id;
  if (op.action === 'create') return `admin: add beer ${name}`;
  if (op.action === 'update') return `admin: update beer ${name}`;
  return `admin: delete beer ${op.beer.id}`;
}

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
    this.api = `https://api.github.com/repos/${repo}`;
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
    const res = await fetch(`${this.api}/contents/${encodeURI(path)}?ref=${this.branch}`, {
      headers: this.headers(),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`get ${path}: ${res.status} ${await res.text()}`);
    return res.json();
  }

  async createBlob(content, encoding) {
    const res = await fetch(`${this.api}/git/blobs`, {
      method: 'POST',
      headers: { ...this.headers(), 'content-type': 'application/json' },
      body: JSON.stringify({ content, encoding }),
    });
    if (!res.ok) throw new Error(`createBlob: ${res.status} ${await res.text()}`);
    return res.json();
  }

  async getRef(ref) {
    const res = await fetch(`${this.api}/git/ref/${ref}`, { headers: this.headers() });
    if (!res.ok) throw new Error(`getRef ${ref}: ${res.status} ${await res.text()}`);
    return res.json();
  }

  async getCommit(sha) {
    const res = await fetch(`${this.api}/git/commits/${sha}`, { headers: this.headers() });
    if (!res.ok) throw new Error(`getCommit ${sha}: ${res.status} ${await res.text()}`);
    return res.json();
  }

  async createTree(baseTreeSha, tree) {
    const res = await fetch(`${this.api}/git/trees`, {
      method: 'POST',
      headers: { ...this.headers(), 'content-type': 'application/json' },
      body: JSON.stringify({ base_tree: baseTreeSha, tree }),
    });
    if (!res.ok) throw new Error(`createTree: ${res.status} ${await res.text()}`);
    return res.json();
  }

  async createCommit(message, treeSha, parents) {
    const res = await fetch(`${this.api}/git/commits`, {
      method: 'POST',
      headers: { ...this.headers(), 'content-type': 'application/json' },
      body: JSON.stringify({ message, tree: treeSha, parents }),
    });
    if (!res.ok) throw new Error(`createCommit: ${res.status} ${await res.text()}`);
    return res.json();
  }

  async updateRef(ref, sha) {
    const res = await fetch(`${this.api}/git/refs/${ref}`, {
      method: 'PATCH',
      headers: { ...this.headers(), 'content-type': 'application/json' },
      body: JSON.stringify({ sha, force: false }),
    });
    if (!res.ok) throw new Error(`updateRef ${ref}: ${res.status} ${await res.text()}`);
    return res.json();
  }
}
