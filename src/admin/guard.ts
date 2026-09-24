// Second line of defence behind middleware.ts: every admin route handler
// checks the session itself too.
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifyToken } from './session';

export async function requireAdmin() {
  const session = await verifyToken((await cookies()).get(SESSION_COOKIE)?.value);
  return session ? null : NextResponse.json({ error: 'unauthorised' }, { status: 401 });
}
