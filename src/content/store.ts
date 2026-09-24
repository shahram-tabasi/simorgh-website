// Server-only: the content store. One JSON file in the storage folder, layered
// over the defaults; every save keeps a dated backup of what it replaced.
//
//   storage/                    (SIMORGH_STORAGE_DIR to put it elsewhere)
//     content.json              everything the admin edits
//     requests.json             contact and demo-request submissions
//     uploads/…                 uploaded media, served at /media/…
//     backups/content-*.json    the last 30 versions of content.json
//
// The folder is outside public/ on purpose: Next serves public/ only as it was
// at build time, and uploads have to appear without a rebuild.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { defaultContent } from './defaults';
import type { Article, PublicContent, SiteContent } from './types';

export const STORAGE_DIR = path.resolve(process.env.SIMORGH_STORAGE_DIR || path.join(process.cwd(), 'storage'));
export const UPLOADS_DIR = path.join(STORAGE_DIR, 'uploads');
const CONTENT_FILE = path.join(STORAGE_DIR, 'content.json');
const BACKUP_DIR = path.join(STORAGE_DIR, 'backups');
const KEEP_BACKUPS = 30;

type Plain = Record<string, unknown>;
const isPlain = (v: unknown): v is Plain => !!v && typeof v === 'object' && !Array.isArray(v);

/** Stored values win; objects merge key by key so new default fields fill in; arrays are replaced whole. */
function merge<T>(base: T, over: unknown): T {
  if (over === undefined) return base;
  if (isPlain(base) && isPlain(over)) {
    const out: Plain = { ...base };
    for (const [k, v] of Object.entries(over)) out[k] = merge((base as Plain)[k], v);
    return out as T;
  }
  return over as T;
}

let cache: { mtime: number; content: SiteContent } | null = null;

export async function getContent(): Promise<SiteContent> {
  let stat;
  try { stat = await fs.stat(CONTENT_FILE); } catch { return defaultContent(); }
  if (cache && cache.mtime === stat.mtimeMs) return cache.content;
  try {
    const stored = JSON.parse(await fs.readFile(CONTENT_FILE, 'utf8'));
    const content = merge(defaultContent(), stored);
    cache = { mtime: stat.mtimeMs, content };
    return content;
  } catch (error) {
    console.error('[content] content.json is unreadable; serving defaults.', error);
    return defaultContent();
  }
}

async function writeAtomic(file: string, data: string) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, data, 'utf8');
  await fs.rename(tmp, file);
}

export async function saveContent(next: SiteContent): Promise<SiteContent> {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  try {
    const previous = await fs.readFile(CONTENT_FILE, 'utf8');
    await fs.writeFile(path.join(BACKUP_DIR, `content-${new Date().toISOString().replace(/[:.]/g, '-')}.json`), previous, 'utf8');
    const backups = (await fs.readdir(BACKUP_DIR)).filter((f) => f.startsWith('content-')).sort();
    await Promise.all(backups.slice(0, Math.max(0, backups.length - KEEP_BACKUPS)).map((f) => fs.unlink(path.join(BACKUP_DIR, f))));
  } catch { /* first save: nothing to back up */ }
  const content = { ...next, version: 1 as const, updatedAt: new Date().toISOString() };
  await writeAtomic(CONTENT_FILE, JSON.stringify(content, null, 2));
  cache = null;
  return content;
}

export async function listBackups() {
  try { return (await fs.readdir(BACKUP_DIR)).filter((f) => f.startsWith('content-')).sort().reverse(); } catch { return []; }
}

export async function restoreBackup(name: string) {
  if (!/^content-[\w-]+\.json$/.test(name)) throw new Error('Bad backup name');
  const data = JSON.parse(await fs.readFile(path.join(BACKUP_DIR, name), 'utf8'));
  return saveContent(merge(defaultContent(), data));
}

/** Published items only, article bodies left out: what every page ships to the browser. */
export function toPublic(content: SiteContent): PublicContent {
  const live = <T extends { status?: string }>(items: T[]) => items.filter((i) => i.status !== 'draft');
  return {
    ...content,
    products: live(content.products).sort((a, b) => a.order - b.order),
    industries: live(content.industries).sort((a, b) => a.order - b.order),
    articles: live(content.articles)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(({ body: _body, ...rest }) => rest),
  };
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  const content = await getContent();
  return content.articles.find((a) => a.slug === slug && a.status !== 'draft');
}

// ── Form submissions ─────────────────────────────────────────────────────

export interface Submission {
  id: string;
  type: 'contact' | 'demo';
  createdAt: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  fields: Record<string, string>;
  note?: string;
}

const REQUESTS_FILE = path.join(STORAGE_DIR, 'requests.json');

export async function listSubmissions(): Promise<Submission[]> {
  try { return JSON.parse(await fs.readFile(REQUESTS_FILE, 'utf8')); } catch { return []; }
}

export async function saveSubmissions(items: Submission[]) {
  await writeAtomic(REQUESTS_FILE, JSON.stringify(items, null, 2));
}
