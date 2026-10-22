import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { OIDC_COOKIE, finishLogin, oidcConfigured, siteUrl } from '@/src/admin/oidc';
import { SESSION_COOKIE, SESSION_HOURS, createToken } from '@/src/admin/session';

export const dynamic = 'force-dynamic';

/** Back from Keycloak: check everything, then the usual admin session. */
export async function GET(req: Request) {
  const site = siteUrl(req);
  const fail = (error: string) => {
    const res = NextResponse.redirect(`${site}/admin/login?error=${error}`);
    res.cookies.set(OIDC_COOKIE, '', { path: '/api/admin/oidc', maxAge: 0 });
    return res;
  };
  if (!oidcConfigured()) return fail('not-configured');
  const params = new URL(req.url).searchParams;
  if (params.get('error')) return fail('cancelled');
  let memo: { state: string; nonce: string; verifier: string; next: string };
  try {
    memo = JSON.parse((await cookies()).get(OIDC_COOKIE)?.value || '');
  } catch {
    return fail('expired');
  }
  const code = params.get('code');
  if (!code || !memo?.state || params.get('state') !== memo.state) return fail('expired');

  let result: Awaited<ReturnType<typeof finishLogin>>;
  try {
    result = await finishLogin(req, code, memo);
  } catch (e) {
    console.error('admin oidc:', e instanceof Error ? e.message : e);
    return fail('failed');
  }
  if (!result.allowed) return fail('forbidden');

  const https = site.startsWith('https:');
  const res = NextResponse.redirect(`${site}${memo.next}`);
  res.cookies.set(OIDC_COOKIE, '', { path: '/api/admin/oidc', maxAge: 0 });
  res.cookies.set(SESSION_COOKIE, await createToken(result.name), {
    httpOnly: true, sameSite: 'lax', secure: https, path: '/', maxAge: SESSION_HOURS * 3600,
  });
  return res;
}
