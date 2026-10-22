import { NextResponse } from 'next/server';
import { getArticle, getContent } from '@/src/content/store';
import { addComment, getThread, type CommentKind } from '@/src/comments/store';
import { clientIp, limited, visitorId } from '@/src/comments/http';
import { notifyComment, notifyReply } from '@/src/mail/notify';
import { siteUrl } from '@/src/seo/metadata';

// Comments on an article: GET the approved thread, POST a new comment or reply.

export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ slug: string }> };
const KINDS: CommentKind[] = ['comment', 'question', 'idea', 'experience'];
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, max) : '');

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  if (!(await getArticle(slug))) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  return NextResponse.json(await getThread(slug, await visitorId()), { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  const ip = clientIp(req);
  if (limited(`c:${ip}`, 5, 10 * 60_000)) return NextResponse.json({ error: 'too-many' }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  // Bots fill the hidden field, or post faster than anyone can type.
  if (body.website || (typeof body.startedAt === 'number' && Date.now() - body.startedAt < 3000)) {
    return NextResponse.json({ ok: true, status: 'pending' });
  }
  const name = clean(body.name, 60);
  const email = clean(body.email, 120);
  const text = clean(body.text, 2000);
  if (name.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || text.length < 2) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const result = await addComment({
    slug,
    parentId: typeof body.parentId === 'string' ? body.parentId : null,
    name,
    email,
    headline: clean(body.headline, 80),
    kind: KINDS.includes(body.kind) ? body.kind : 'comment',
    text,
    notify: body.notify === true,
    ip,
  });
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.error === 'closed' ? 403 : 400 });

  const c = await getContent();
  const base = siteUrl(c);
  notifyComment(result.comment, article.title, base, c.settings.notifyEmail)
    .catch((e) => console.error('[comments] team email failed:', e?.message));
  if (result.comment.status === 'approved' && result.parent) {
    notifyReply(result.parent, result.comment, article.title, base).catch((e) => console.error('[comments] reply email failed:', e?.message));
  }
  return NextResponse.json({ ok: true, status: result.comment.status, id: result.comment.id });
}
