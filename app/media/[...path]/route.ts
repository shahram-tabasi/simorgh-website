import { promises as fs } from 'node:fs';
import path from 'node:path';
import { MEDIA_TYPES, uploadsPath } from '@/src/content/media';

// Serves uploaded media from storage/uploads. (public/ is only served as it
// was at build time, so uploads live outside it and come through here.)
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path.map((p) => decodeURIComponent(p));
  let file: string;
  try { file = uploadsPath(parts.join('/')); } catch { return new Response('Not found', { status: 404 }); }
  const type = MEDIA_TYPES[path.extname(file).toLowerCase()];
  if (!type) return new Response('Not found', { status: 404 });
  let stat;
  try { stat = await fs.stat(file); } catch { return new Response('Not found', { status: 404 }); }
  const etag = `"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`;
  if (req.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers: { ETag: etag } });
  const headers = {
    'Content-Type': type,
    'Content-Length': String(stat.size),
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    ETag: etag,
    'X-Content-Type-Options': 'nosniff',
  };
  // Byte ranges, so videos can seek (and play at all in Safari).
  const range = req.headers.get('range')?.match(/^bytes=(\d*)-(\d*)$/);
  if (range) {
    const start = range[1] ? Number(range[1]) : Math.max(0, stat.size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
    if (start > end || start >= stat.size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${stat.size}` } });
    const handle = await fs.open(file, 'r');
    const chunk = new Uint8Array(end - start + 1);
    await handle.read(chunk, 0, chunk.length, start);
    await handle.close();
    return new Response(chunk, {
      status: 206,
      headers: { ...headers, 'Content-Length': String(chunk.length), 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes' },
    });
  }
  return new Response(new Uint8Array(await fs.readFile(file)), { headers: { ...headers, 'Accept-Ranges': 'bytes' } });
}
