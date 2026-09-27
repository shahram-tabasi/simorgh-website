import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import { STORAGE_DIR } from '@/src/content/store';

export const dynamic = 'force-dynamic';

// Kubernetes probes. Liveness only asks whether the server answers; readiness
// also asks whether the storage folder is writable, since every admin save and
// every contact form lands there.
export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get('ready') === null) return NextResponse.json({ status: 'ok' });
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    await fs.access(STORAGE_DIR, fs.constants.W_OK);
    return NextResponse.json({ status: 'ok', storage: 'writable' });
  } catch {
    return NextResponse.json({ status: 'error', storage: 'not writable' }, { status: 503 });
  }
}
