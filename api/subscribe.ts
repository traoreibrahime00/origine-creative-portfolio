// Adds a visitor who opted in to the newsletter to the mailing tool.
// Sender is used when its variables are set, Brevo otherwise.
//   Sender: SENDER_API_TOKEN (Sender → Settings → API access tokens)
//           SENDER_GROUP_ID  (the id of the "Newsletter site" group)
//   Brevo:  BREVO_API_KEY, BREVO_LIST_ID
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Req = { method?: string; body?: unknown };
type Res = { status: (code: number) => { json: (data: unknown) => unknown } };
type Contact = { email: string; firstName: string; lastName: string };

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const body = (typeof req.body === 'string' ? safeJson(req.body) : req.body || {}) as Record<string, unknown>;
  // Bots fill every field, people never see this one
  if (body.website) return res.status(200).json({ ok: true });

  const email = String(body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return res.status(400).json({ error: 'invalid_email' });
  if (body.consent !== true) return res.status(400).json({ error: 'consent_required' });
  const contact: Contact = { email, firstName: clean(body.firstName), lastName: clean(body.lastName) };

  let ok: boolean;
  if (process.env.SENDER_API_TOKEN && process.env.SENDER_GROUP_ID) {
    ok = await toSender(contact, process.env.SENDER_API_TOKEN, process.env.SENDER_GROUP_ID);
  } else if (process.env.BREVO_API_KEY && Number(process.env.BREVO_LIST_ID)) {
    ok = await toBrevo(contact, process.env.BREVO_API_KEY, Number(process.env.BREVO_LIST_ID));
  } else {
    return res.status(500).json({ error: 'Newsletter not configured' });
  }
  return ok ? res.status(200).json({ ok: true }) : res.status(502).json({ error: 'provider_error' });
}

async function toSender(c: Contact, token: string, groupId: string): Promise<boolean> {
  const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/json' };
  const create = await fetch('https://api.sender.net/v2/subscribers', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: c.email,
      ...(c.firstName && { firstname: c.firstName }),
      ...(c.lastName && { lastname: c.lastName }),
      groups: [groupId],
      trigger_automation: false,
    }),
  });
  if (create.ok) return true;
  // Already a subscriber: make sure they are in the newsletter group
  const join = await fetch(`https://api.sender.net/v2/subscribers/groups/${encodeURIComponent(groupId)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ subscribers: [c.email], trigger_automation: false }),
  });
  if (join.ok) return true;
  console.error('Sender subscribe failed', create.status, (await create.text().catch(() => '')).slice(0, 300), join.status);
  return false;
}

async function toBrevo(c: Contact, apiKey: string, listId: number): Promise<boolean> {
  const attributes: Record<string, string> = {};
  if (c.firstName) attributes.PRENOM = c.firstName;
  if (c.lastName) attributes.NOM = c.lastName;
  const r = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ email: c.email, attributes, listIds: [listId], updateEnabled: true }),
  });
  if (r.ok) return true;
  console.error('Brevo subscribe failed', r.status, (await r.text().catch(() => '')).slice(0, 300));
  return false;
}

function clean(v: unknown): string {
  return String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);
}

function safeJson(s: string): unknown {
  try { return JSON.parse(s); } catch { return {}; }
}
