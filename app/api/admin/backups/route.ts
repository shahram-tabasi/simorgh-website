import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/src/admin/guard';
import { listBackups, restoreBackup } from '@/src/content/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json(await listBackups());
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { name } = await req.json();
  try {
    const content = await restoreBackup(String(name));
    revalidatePath('/', 'layout');
    return NextResponse.json(content);
  } catch {
    return NextResponse.json({ error: 'not-found' }, { status: 404 });
  }
}
