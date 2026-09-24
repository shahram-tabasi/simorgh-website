import { NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_HOURS, adminConfigured, createToken, safeEqual } from '@/src/admin/session';

// A few wrong passwords per address and minute, then a pause.
const attempts = new Map<string, { n: number; until: number }>();

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: 'not-configured' }, { status: 503 });
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const now = Date.now();
  const a = attempts.get(ip);
  if (a && a.n >= 5 && a.until > now) {
    return NextResponse.json({ error: 'too-many', retryIn: Math.ceil((a.until - now) / 1000) }, { status: 429 });
  }

  const { username = '', password = '' } = await req.json().catch(() => ({}));
  const okUser = await safeEqual(String(username).trim(), process.env.ADMIN_USERNAME || 'admin');
  const okPass = await safeEqual(String(password), process.env.ADMIN_PASSWORD || '');
  if (!okUser || !okPass) {
    const next = { n: (a && a.until > now ? a.n : 0) + 1, until: now + 60_000 };
    attempts.set(ip, next);
    return NextResponse.json({ error: 'invalid' }, { status: 401 });
  }
  attempts.delete(ip);

  const res = NextResponse.json({ ok: true });
  const https = new URL(req.url).protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';
  res.cookies.set(SESSION_COOKIE, await createToken(String(username).trim()), {
    httpOnly: true,
    sameSite: 'lax',
    secure: https,
    path: '/',
    maxAge: SESSION_HOURS * 3600,
  });
  return res;
}
