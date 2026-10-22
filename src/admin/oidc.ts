// Admin sign-in through Keycloak, realm `website` (its own users, the role
// website-admin, brute-force lockout and two-step codes): the shared admin
// password is no longer needed once this is configured.
//
//   ADMIN_OIDC_ISSUER         https://auth.simorghai.com/realms/website  (what the browser sees, and the tokens' iss)
//   ADMIN_OIDC_INTERNAL_URL   http://keycloak.keycloak.svc.cluster.local:8080/realms/website  (server calls; empty: the issuer)
//   ADMIN_OIDC_CLIENT_ID      simorgh-website
//   ADMIN_OIDC_CLIENT_SECRET  (Secret simorgh-website-secrets)
//   ADMIN_OIDC_ROLE           website-admin
import { createRemoteJWKSet, jwtVerify } from 'jose';

const trim = (u: string) => u.replace(/\/+$/, '');

export function oidcConfig() {
  const issuer = trim(process.env.ADMIN_OIDC_ISSUER || '');
  const clientId = process.env.ADMIN_OIDC_CLIENT_ID || '';
  const clientSecret = process.env.ADMIN_OIDC_CLIENT_SECRET || '';
  if (!issuer || !clientId || !clientSecret) return null;
  return {
    issuer,
    internal: trim(process.env.ADMIN_OIDC_INTERNAL_URL || '') || issuer,
    clientId,
    clientSecret,
    role: process.env.ADMIN_OIDC_ROLE || 'website-admin',
  };
}

export const oidcConfigured = () => oidcConfig() !== null;

/** The site's own address: the callback and the address after logout. */
export function siteUrl(req: Request) {
  const configured = trim(process.env.NEXT_PUBLIC_SITE_URL || '');
  if (configured) return configured;
  const u = new URL(req.url);
  return `${req.headers.get('x-forwarded-proto') || u.protocol.replace(':', '')}://${req.headers.get('host') || u.host}`;
}

export const OIDC_COOKIE = 'simorgh_admin_oidc';

function random(bytes = 32) {
  const a = crypto.getRandomValues(new Uint8Array(bytes));
  return Buffer.from(a).toString('base64url');
}

async function challenge(verifier: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return Buffer.from(digest).toString('base64url');
}

/** Where to send the browser, and what to remember (state, nonce, PKCE verifier) until it comes back. */
export async function startLogin(req: Request, next: string) {
  const c = oidcConfig()!;
  const state = random(16);
  const nonce = random(16);
  const verifier = random(32);
  const url = new URL(`${c.issuer}/protocol/openid-connect/auth`);
  url.search = new URLSearchParams({
    client_id: c.clientId,
    response_type: 'code',
    scope: 'openid email profile',
    redirect_uri: `${siteUrl(req)}/api/admin/oidc/callback`,
    state,
    nonce,
    code_challenge: await challenge(verifier),
    code_challenge_method: 'S256',
    ui_locales: 'fa',
  }).toString();
  return { url: url.toString(), memo: JSON.stringify({ state, nonce, verifier, next }) };
}

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

/**
 * The code exchanged for tokens (straight with Keycloak, with the client
 * secret), the ID token's signature and claims checked, and the role required.
 * Returns the person's name for the admin session.
 */
export async function finishLogin(req: Request, code: string, memo: { nonce: string; verifier: string }) {
  const c = oidcConfig()!;
  const res = await fetch(`${c.internal}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${siteUrl(req)}/api/admin/oidc/callback`,
      client_id: c.clientId,
      client_secret: c.clientSecret,
      code_verifier: memo.verifier,
    }),
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`token: HTTP ${res.status}`);
  const tokens = (await res.json()) as { id_token?: string };
  if (!tokens.id_token) throw new Error('token: no id_token');
  jwks ??= createRemoteJWKSet(new URL(`${c.internal}/protocol/openid-connect/certs`));
  const { payload } = await jwtVerify(tokens.id_token, jwks, { issuer: c.issuer, audience: c.clientId });
  if (payload.nonce !== memo.nonce) throw new Error('nonce mismatch');
  const roles = Array.isArray(payload.roles) ? (payload.roles as unknown[]).map(String) : [];
  if (!roles.includes(c.role)) return { allowed: false as const };
  const name = String(payload.preferred_username || payload.email || payload.sub);
  return { allowed: true as const, name };
}

/** Keycloak's logout, back to the login page afterwards. */
export function logoutUrl(req: Request) {
  const c = oidcConfig();
  if (!c) return null;
  const url = new URL(`${c.issuer}/protocol/openid-connect/logout`);
  url.search = new URLSearchParams({ client_id: c.clientId, post_logout_redirect_uri: `${siteUrl(req)}/admin/login` }).toString();
  return url.toString();
}
