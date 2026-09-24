// Admin sessions: a signed, expiring token in an HttpOnly cookie. Uses Web
// Crypto only, so the same code verifies in middleware (edge) and in route
// handlers (node).
//
// Configure in .env.local on the server:
//   ADMIN_USERNAME=admin
//   ADMIN_PASSWORD=<a long password>
//   ADMIN_SECRET=<a long random string>   (optional; derived from the password if absent)

export const SESSION_COOKIE = 'simorgh_admin';
export const SESSION_HOURS = 12;

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(s: string) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 8);
}

async function key() {
  const secret = process.env.ADMIN_SECRET || `simorgh-admin:${process.env.ADMIN_PASSWORD ?? ''}`;
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function createToken(username: string) {
  const payload = b64url(enc.encode(JSON.stringify({ u: username, exp: Date.now() + SESSION_HOURS * 3600_000 })));
  const sig = await crypto.subtle.sign('HMAC', await key(), enc.encode(payload));
  return `${payload}.${b64url(sig)}`;
}

export async function verifyToken(token: string | undefined): Promise<{ u: string } | null> {
  if (!token || !adminConfigured()) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify('HMAC', await key(), fromB64url(sig), enc.encode(payload));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    return typeof data.exp === 'number' && data.exp > Date.now() ? { u: String(data.u) } : null;
  } catch {
    return null;
  }
}

/** Constant-time string comparison (over SHA-256 digests, so lengths never leak). */
export async function safeEqual(a: string, b: string) {
  const [x, y] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))]);
  const ax = new Uint8Array(x);
  const by = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < ax.length; i++) diff |= ax[i] ^ by[i];
  return diff === 0;
}
