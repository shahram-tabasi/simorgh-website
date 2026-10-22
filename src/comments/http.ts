// Server-only: the reader's anonymous visitor id (for hearts) and simple
// per-address rate limits, shared by the comment routes.
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';

export const VISITOR_COOKIE = 'sim_vid';

export async function visitorId() {
  return (await cookies()).get(VISITOR_COOKIE)?.value ?? null;
}

/** The reader's visitor id, or a new one to set with setVisitor. */
export function resolveVisitor(current: string | null) {
  const valid = !!current && /^[a-f0-9-]{36}$/.test(current);
  return { vid: valid ? current! : crypto.randomUUID(), fresh: !valid };
}

export function setVisitor(res: NextResponse, vid: string) {
  res.cookies.set(VISITOR_COOKIE, vid, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 365,
  });
}

export const clientIp = (req: Request) => req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';

const windows = new Map<string, number[]>();
/** True when this key has done `limit` things in the last `ms`; otherwise records one more. */
export function limited(key: string, limit: number, ms: number) {
  const now = Date.now();
  const times = (windows.get(key) || []).filter((t) => now - t < ms);
  if (times.length >= limit) { windows.set(key, times); return true; }
  windows.set(key, [...times, now]);
  if (windows.size > 20000) windows.clear();
  return false;
}
