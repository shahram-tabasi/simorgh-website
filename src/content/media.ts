// Server-only: uploaded media in storage/uploads, served at /media/….
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { UPLOADS_DIR } from './store';

export const MEDIA_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif',
  '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf',
};
export const MAX_UPLOAD_BYTES = 60 * 1024 * 1024;

export interface MediaItem { url: string; name: string; folder: string; size: number; modified: string; builtIn?: boolean }

/** Resolve a path inside the uploads folder, refusing anything that escapes it. */
export function uploadsPath(rel: string) {
  const full = path.resolve(UPLOADS_DIR, rel.replace(/^\/+/, ''));
  if (full !== UPLOADS_DIR && !full.startsWith(UPLOADS_DIR + path.sep)) throw new Error('bad path');
  return full;
}

export function cleanFolder(folder: string) {
  return folder.toLowerCase().replace(/[^a-z0-9/_-]+/g, '-').split('/').filter((p) => p && p !== '..' && p !== '.').join('/').slice(0, 120);
}

export function cleanName(name: string) {
  const ext = path.extname(name).toLowerCase();
  const base = path.basename(name, path.extname(name)).toLowerCase()
    .replace(/[^a-z0-9؀-ۿ_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'file';
  return base + ext;
}

async function walk(dir: string, base: string, out: MediaItem[], builtIn: boolean, urlPrefix: string) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.posix.join(base, e.name);
    if (e.isDirectory()) { await walk(full, rel, out, builtIn, urlPrefix); continue; }
    if (!MEDIA_TYPES[path.extname(e.name).toLowerCase()]) continue;
    const st = await fs.stat(full);
    out.push({ url: `${urlPrefix}/${rel}`, name: e.name, folder: path.posix.dirname(rel) === '.' ? '' : path.posix.dirname(rel), size: st.size, modified: st.mtime.toISOString(), builtIn });
  }
}

export async function listMedia(): Promise<MediaItem[]> {
  const uploads: MediaItem[] = [];
  await walk(UPLOADS_DIR, '', uploads, false, '/media');
  // Images that ship with the site (public/images and the root of public/).
  const builtIn: MediaItem[] = [];
  const pub = path.join(process.cwd(), 'public');
  await walk(path.join(pub, 'images'), 'images', builtIn, true, '');
  try {
    for (const e of await fs.readdir(pub, { withFileTypes: true })) {
      if (e.isFile() && /\.(jpe?g|png|webp)$/i.test(e.name) && !/^(icon|apple-icon|favicon)/.test(e.name)) {
        const st = await fs.stat(path.join(pub, e.name));
        builtIn.push({ url: `/${e.name}`, name: e.name, folder: '', size: st.size, modified: st.mtime.toISOString(), builtIn: true });
      }
    }
  } catch { /* no public folder in some deployments */ }
  uploads.sort((a, b) => b.modified.localeCompare(a.modified));
  return [...uploads, ...builtIn];
}
