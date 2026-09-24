import { NextResponse } from 'next/server';
import { listSubmissions, saveSubmissions, type Submission } from '@/src/content/store';

// Contact and demo-request forms. Saved to storage/requests.json and listed in
// the admin panel under Requests.

const recent = new Map<string, number[]>();
const FIELD_LIMIT = 4000;

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const now = Date.now();
  const times = (recent.get(ip) || []).filter((t) => now - t < 10 * 60_000);
  if (times.length >= 5) return NextResponse.json({ error: 'too-many' }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body || (body.type !== 'contact' && body.type !== 'demo')) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  // Honeypot: a field people never see. Bots fill it in.
  if (body.website) return NextResponse.json({ ok: true });

  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(body.fields || {})) {
    if (typeof v === 'string' && /^[a-z]{2,20}$/i.test(k)) fields[k] = v.slice(0, FIELD_LIMIT);
  }
  if (!fields.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email) || !fields.name) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const item: Submission = { id: crypto.randomUUID(), type: body.type, createdAt: new Date().toISOString(), status: 'new', fields };
  const all = await listSubmissions();
  await saveSubmissions([item, ...all].slice(0, 5000));
  recent.set(ip, [...times, now]);
  return NextResponse.json({ ok: true });
}
