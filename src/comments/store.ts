// Server-only: comments on articles, kept in storage/comments.json next to
// the content. One website pod (Recreate strategy), so a promise chain is
// enough to keep writes in order.
//
// A comment is a top-level post or a reply to one (one level, as on
// Instagram). Readers post with a name and an email; the email is never
// shown. The team replies from the admin panel and those replies carry the
// team badge. New comments wait for approval unless moderation says otherwise.

import { createHash, randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { STORAGE_DIR, writeAtomic } from '../content/store';

export type CommentKind = 'comment' | 'question' | 'idea' | 'experience';
export type CommentStatus = 'pending' | 'approved' | 'hidden';
/** all: every comment waits for approval; first: a reader's first comment waits, later ones go live; none: everything goes live. */
export type Moderation = 'all' | 'first' | 'none';

export interface StoredComment {
  id: string;
  slug: string;
  parentId: string | null;
  name: string;
  email: string;
  headline: string;
  kind: CommentKind;
  text: string;
  createdAt: string;
  status: CommentStatus;
  team: boolean;
  pinned: boolean;
  answered: boolean;
  notify: boolean;
  /** For the unsubscribe link in reply emails. */
  token: string;
  /** Hashed visitor ids. */
  likes: string[];
  ip: string;
}

interface CommentsFile {
  settings: { enabled: boolean; moderation: Moderation };
  comments: StoredComment[];
  /** Hearts on the article itself, hashed visitor ids per slug. */
  articleLikes: Record<string, string[]>;
}

export interface PublicComment {
  id: string;
  parentId: string | null;
  name: string;
  headline: string;
  kind: CommentKind;
  text: string;
  createdAt: string;
  team: boolean;
  pinned: boolean;
  answered: boolean;
  likes: number;
  liked: boolean;
  replies: PublicComment[];
}

export interface Thread {
  enabled: boolean;
  count: number;
  likes: number;
  liked: boolean;
  comments: PublicComment[];
}

const FILE = path.join(STORAGE_DIR, 'comments.json');
const empty = (): CommentsFile => ({ settings: { enabled: true, moderation: 'first' }, comments: [], articleLikes: {} });

export const visitorHash = (vid: string) => createHash('sha256').update(`simorgh:${vid}`).digest('hex').slice(0, 24);
const emailKey = (e: string) => e.trim().toLowerCase();

async function read(): Promise<CommentsFile> {
  try {
    const f = JSON.parse(await fs.readFile(FILE, 'utf8'));
    return { ...empty(), ...f, settings: { ...empty().settings, ...f.settings } };
  } catch {
    return empty();
  }
}

let queue: Promise<unknown> = Promise.resolve();
/** Read, change and write the file, one change at a time. */
function update<T>(fn: (f: CommentsFile) => T): Promise<T> {
  const run = queue.then(async () => {
    const f = await read();
    const result = fn(f);
    await writeAtomic(FILE, JSON.stringify(f, null, 2));
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

const toPublic = (c: StoredComment, vh: string | null): PublicComment => ({
  id: c.id, parentId: c.parentId, name: c.name, headline: c.headline, kind: c.kind, text: c.text,
  createdAt: c.createdAt, team: c.team, pinned: c.pinned, answered: c.answered,
  likes: c.likes.length, liked: !!vh && c.likes.includes(vh), replies: [],
});

/** The approved comments of an article, replies under their parent, pinned first, then newest. */
export async function getThread(slug: string, vid?: string | null): Promise<Thread> {
  const f = await read();
  const vh = vid ? visitorHash(vid) : null;
  const live = f.comments.filter((c) => c.slug === slug && c.status === 'approved');
  const top = live.filter((c) => !c.parentId).map((c) => toPublic(c, vh));
  const byId = new Map(top.map((c) => [c.id, c]));
  for (const r of live.filter((c) => c.parentId)) byId.get(r.parentId!)?.replies.push(toPublic(r, vh));
  for (const c of top) c.replies.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  top.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));
  const al = f.articleLikes[slug] ?? [];
  return { enabled: f.settings.enabled, count: live.length, likes: al.length, liked: !!vh && al.includes(vh), comments: top };
}

export interface NewComment {
  slug: string;
  parentId: string | null;
  name: string;
  email: string;
  headline: string;
  kind: CommentKind;
  text: string;
  notify: boolean;
  ip: string;
  team?: boolean;
}

const linkCount = (s: string) => (s.match(/https?:\/\/|www\./gi) || []).length;

export async function addComment(input: NewComment): Promise<{ comment: StoredComment; parent: StoredComment | null } | { error: string }> {
  return update((f) => {
    if (!f.settings.enabled && !input.team) return { error: 'closed' };
    let parent: StoredComment | null = null;
    if (input.parentId) {
      parent = f.comments.find((c) => c.id === input.parentId && c.slug === input.slug) ?? null;
      if (!parent) return { error: 'invalid' };
      // One level: a reply to a reply joins the same conversation.
      if (parent.parentId) parent = f.comments.find((c) => c.id === parent!.parentId) ?? null;
      // Readers answer what they can see; the team can answer a comment still waiting.
      if (!parent || (!input.team && parent.status !== 'approved')) return { error: 'invalid' };
    }
    if (f.comments.filter((c) => c.slug === input.slug).length >= 2000) return { error: 'full' };
    const known = f.comments.some((c) => c.status === 'approved' && !c.team && emailKey(c.email) === emailKey(input.email));
    const links = linkCount(input.text);
    const live = input.team
      || (links <= 1 && (f.settings.moderation === 'none' || (f.settings.moderation === 'first' && known)));
    const comment: StoredComment = {
      id: randomBytes(8).toString('hex'),
      slug: input.slug,
      parentId: parent?.id ?? null,
      name: input.name,
      email: input.email,
      headline: input.headline,
      kind: input.parentId ? 'comment' : input.kind,
      text: input.text,
      createdAt: new Date().toISOString(),
      status: live ? 'approved' : 'pending',
      team: !!input.team,
      pinned: false,
      answered: false,
      notify: input.notify,
      token: randomBytes(16).toString('hex'),
      likes: [],
      ip: input.ip,
    };
    f.comments.push(comment);
    if (input.team && parent) {
      const p = f.comments.find((c) => c.id === parent!.id);
      if (p) p.answered = true;
    }
    return { comment, parent };
  });
}

/** Heart or un-heart a comment, or the article itself when commentId is empty. */
export async function toggleLike(slug: string, commentId: string | null, vid: string) {
  const vh = visitorHash(vid);
  return update((f) => {
    let list: string[] | undefined;
    if (commentId) list = f.comments.find((c) => c.id === commentId && c.slug === slug && c.status === 'approved')?.likes;
    else list = f.articleLikes[slug] ??= [];
    if (!list) return null;
    const i = list.indexOf(vh);
    if (i >= 0) list.splice(i, 1); else list.push(vh);
    return { liked: i < 0, likes: list.length };
  });
}

export async function unsubscribe(token: string) {
  return update((f) => {
    const c = f.comments.find((x) => x.token === token);
    if (c) c.notify = false;
    return !!c;
  });
}

// ── Admin ────────────────────────────────────────────────────────────────

export async function adminList() {
  const f = await read();
  return {
    settings: f.settings,
    comments: [...f.comments].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(({ token: _t, likes, ...c }) => ({ ...c, likes: likes.length })),
  };
}

export type AdminPatch =
  | { id: string; status?: CommentStatus; pinned?: boolean; answered?: boolean; remove?: boolean }
  | { settings: Partial<CommentsFile['settings']> };

export async function adminPatch(p: AdminPatch) {
  return update((f) => {
    if ('settings' in p) {
      if (typeof p.settings.enabled === 'boolean') f.settings.enabled = p.settings.enabled;
      if (p.settings.moderation && ['all', 'first', 'none'].includes(p.settings.moderation)) f.settings.moderation = p.settings.moderation;
      return null;
    }
    if (p.remove) {
      // Removing a post removes its replies with it.
      f.comments = f.comments.filter((c) => c.id !== p.id && c.parentId !== p.id);
      return null;
    }
    const c = f.comments.find((x) => x.id === p.id);
    if (!c) return null;
    const approvedNow = p.status === 'approved' && c.status !== 'approved';
    if (p.status && ['pending', 'approved', 'hidden'].includes(p.status)) c.status = p.status;
    if (typeof p.pinned === 'boolean') c.pinned = p.pinned;
    if (typeof p.answered === 'boolean') c.answered = p.answered;
    return approvedNow && c.parentId ? { approvedReply: c, parent: f.comments.find((x) => x.id === c.parentId) ?? null } : null;
  });
}

export async function pendingCount() {
  return (await read()).comments.filter((c) => c.status === 'pending').length;
}

/** Per article: how many approved comments, for the list pages and JSON-LD. */
export async function commentCounts(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const c of (await read()).comments) if (c.status === 'approved') out[c.slug] = (out[c.slug] ?? 0) + 1;
  return out;
}
