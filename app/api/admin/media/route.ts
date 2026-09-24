import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/src/admin/guard';
import { MAX_UPLOAD_BYTES, MEDIA_TYPES, cleanFolder, cleanName, listMedia, uploadsPath } from '@/src/content/media';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json(await listMedia());
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const form = await req.formData();
  const folder = cleanFolder(String(form.get('folder') || 'uploads'));
  const saved: string[] = [];
  const rejected: { name: string; reason: string }[] = [];
  for (const entry of form.getAll('files')) {
    if (!(entry instanceof File)) continue;
    const name = cleanName(entry.name);
    const ext = path.extname(name);
    if (!MEDIA_TYPES[ext]) { rejected.push({ name: entry.name, reason: 'type' }); continue; }
    if (entry.size > MAX_UPLOAD_BYTES) { rejected.push({ name: entry.name, reason: 'size' }); continue; }
    const dir = uploadsPath(folder);
    await fs.mkdir(dir, { recursive: true });
    // Never overwrite: add -2, -3 … to a name that exists.
    let final = name;
    for (let n = 2; ; n++) {
      try { await fs.access(path.join(dir, final)); final = `${path.basename(name, ext)}-${n}${ext}`; } catch { break; }
    }
    await fs.writeFile(path.join(dir, final), Buffer.from(await entry.arrayBuffer()));
    saved.push(`/media/${folder}/${final}`);
  }
  return NextResponse.json({ saved, rejected });
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const url = new URL(req.url).searchParams.get('url') || '';
  if (!url.startsWith('/media/')) return NextResponse.json({ error: 'only uploads can be deleted' }, { status: 400 });
  try {
    await fs.unlink(uploadsPath(decodeURIComponent(url.slice('/media/'.length))));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'not-found' }, { status: 404 });
  }
}
