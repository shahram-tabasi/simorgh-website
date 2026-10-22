import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/src/admin/session';
import { logoutUrl } from '@/src/admin/oidc';

/** Ends the admin session; with Keycloak sign-in, also says where to end the Keycloak session. */
export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true, logoutUrl: logoutUrl(req) });
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
