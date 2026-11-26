// Adds a visitor who opted in to the newsletter to the Brevo list.
// Needs two environment variables on Vercel:
//   BREVO_API_KEY  — a Brevo API key (Brevo → SMTP & API → API keys)
//   BREVO_LIST_ID  — the numeric id of the "Newsletter site" list
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Req = { method?: string; body?: unknown };
type Res = { status: (code: number) => { json: (data: unknown) => unknown } };

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  if (!apiKey || !listId) return res.status(500).json({ error: 'Newsletter not configured' });

  const body = (typeof req.body === 'string' ? safeJson(req.body) : req.body || {}) as Record<string, unknown>;
  // Bots fill every field, people never see this one
  if (body.website) return res.status(200).json({ ok: true });

  const email = String(body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return res.status(400).json({ error: 'invalid_email' });
  if (body.consent !== true) return res.status(400).json({ error: 'consent_required' });

  const attributes: Record<string, string> = {};
  const firstName = clean(body.firstName);
  const lastName = clean(body.lastName);
  if (firstName) attributes.PRENOM = firstName;
  if (lastName) attributes.NOM = lastName;

  const r = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ email, attributes, listIds: [listId], updateEnabled: true }),
  });

  // 201 created, 204 already there and updated
  if (r.ok) return res.status(200).json({ ok: true });
  const detail = await r.text().catch(() => '');
  console.error('Brevo subscribe failed', r.status, detail.slice(0, 300));
  return res.status(502).json({ error: 'brevo_error' });
}

function clean(v: unknown): string {
  return String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);
}

function safeJson(s: string): unknown {
  try { return JSON.parse(s); } catch { return {}; }
}
