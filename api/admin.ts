/* eslint-disable @typescript-eslint/no-explicit-any */
// Vercel function behind /admin. It reads and writes the site's content files
// in the GitHub repository; each save is a commit on the production branch,
// which Vercel then deploys (about a minute).
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   ADMIN_PASSWORD  the password asked by /admin
//   GITHUB_TOKEN    a fine-grained token with "Contents: read and write" on the repo
//                   (GITHUB_KEY is accepted too)
//   GITHUB_REPO     optional, defaults to traoreibrahime00/origine-creative-portfolio
//   GITHUB_BRANCH   optional, defaults to main
import { timingSafeEqual } from 'crypto';

const FILES: Record<string, string> = {
  site: 'src/data/site.json',
  blog: 'src/data/blog.json',
};

const REPO = process.env.GITHUB_REPO || 'traoreibrahime00/origine-creative-portfolio';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GITHUB_KEY;

function authorized(req: any) {
  const expected = process.env.ADMIN_PASSWORD || '';
  const given = String(req.headers['x-admin-key'] || '');
  if (!expected || given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

async function gh(path: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${path}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function readFile(path: string) {
  const file = await gh(`/contents/${path}?ref=${BRANCH}`);
  return Buffer.from(file.content, 'base64').toString('utf8');
}

// One commit for any number of files, on top of the branch's latest commit.
async function commitFiles(files: { path: string; base64: string }[], message: string) {
  const ref = await gh(`/git/ref/heads/${BRANCH}`);
  const parent = await gh(`/git/commits/${ref.object.sha}`);
  const tree = await Promise.all(files.map(async (f) => {
    const blob = await gh('/git/blobs', { method: 'POST', body: JSON.stringify({ content: f.base64, encoding: 'base64' }) });
    return { path: f.path, mode: '100644', type: 'blob', sha: blob.sha };
  }));
  const newTree = await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: parent.tree.sha, tree }) });
  const commit = await gh('/git/commits', {
    method: 'POST',
    body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }),
  });
  await gh(`/git/refs/heads/${BRANCH}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha }) });
  return commit.sha as string;
}

const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'image';
const b64 = (dataUrl: string) => {
  const m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(dataUrl || '');
  if (!m) throw new Error('Image invalide');
  return m[2];
};

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!process.env.ADMIN_PASSWORD || !TOKEN) {
    return res.status(503).json({ error: 'Admin non configuré : ajoutez ADMIN_PASSWORD et GITHUB_TOKEN dans Vercel.' });
  }
  if (!authorized(req)) return res.status(401).json({ error: 'Mot de passe incorrect' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  try {
    if (body.action === 'load') {
      const [site, blog] = await Promise.all([readFile(FILES.site), readFile(FILES.blog)]);
      return res.status(200).json({ site: JSON.parse(site), blog: JSON.parse(blog), mode: 'github' });
    }

    if (body.action === 'save') {
      const path = FILES[body.file];
      if (!path) return res.status(400).json({ error: 'Fichier inconnu' });
      const text = JSON.stringify(body.data, null, 2) + '\n';
      const sha = await commitFiles(
        [{ path, base64: Buffer.from(text, 'utf8').toString('base64') }],
        `contenu: mise à jour de ${body.file === 'site' ? 'la page' : 'du journal'} depuis l'admin`,
      );
      return res.status(200).json({ ok: true, commit: sha });
    }

    if (body.action === 'upload') {
      const base = `/media/${Date.now()}-${slug(String(body.name || ''))}`;
      const files = [{ path: `public${base}.jpg`, base64: b64(body.full) }];
      if (body.small) files.push({ path: `public${base}-720.jpg`, base64: b64(body.small) });
      await commitFiles(files, `contenu: ajout de l'image ${base}.jpg depuis l'admin`);
      return res.status(200).json({ src: `${base}.jpg`, small: body.small ? `${base}-720.jpg` : undefined });
    }

    return res.status(400).json({ error: 'Action inconnue' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erreur' });
  }
}
