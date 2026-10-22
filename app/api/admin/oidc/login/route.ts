import { NextResponse } from 'next/server';
import { OIDC_COOKIE, oidcConfigured, startLogin } from '@/src/admin/oidc';

export const dynamic = 'force-dynamic';

/** Off to Keycloak (realm website) to sign in. */
export async function GET(req: Request) {
  if (!oidcConfigured()) return NextResponse.redirect(new URL('/admin/login', req.url));
  const want = new URL(req.url).searchParams.get('next') || '/admin';
  const next = want.startsWith('/admin') && !want.startsWith('//') ? want : '/admin';
  const { url, memo } = await startLogin(req, next);
  const res = NextResponse.redirect(url);
  res.cookies.set(OIDC_COOKIE, memo, {
    httpOnly: true, sameSite: 'lax', path: '/api/admin/oidc', maxAge: 600,
    secure: new URL(req.url).protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https',
  });
  return res;
}
