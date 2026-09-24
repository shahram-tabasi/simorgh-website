import { NextResponse } from 'next/server';
import { requireAdmin } from '@/src/admin/guard';
import { listSubmissions, saveSubmissions } from '@/src/content/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json(await listSubmissions());
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id, status, note, remove } = await req.json();
  let items = await listSubmissions();
  if (remove) items = items.filter((i) => i.id !== id);
  else items = items.map((i) => (i.id === id ? { ...i, ...(status ? { status } : {}), ...(note !== undefined ? { note: String(note).slice(0, 4000) } : {}) } : i));
  await saveSubmissions(items);
  return NextResponse.json(items);
}
