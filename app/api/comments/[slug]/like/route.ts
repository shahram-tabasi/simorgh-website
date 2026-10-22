import { NextResponse } from 'next/server';
import { getArticle } from '@/src/content/store';
import { toggleLike } from '@/src/comments/store';
import { clientIp, limited, resolveVisitor, setVisitor, visitorId } from '@/src/comments/http';

// A heart on the article ({}) or on one comment ({ commentId }). Toggles.
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await getArticle(slug))) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  if (limited(`l:${clientIp(req)}`, 60, 60_000)) return NextResponse.json({ error: 'too-many' }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const { vid, fresh } = resolveVisitor(await visitorId());
  const result = await toggleLike(slug, typeof body?.commentId === 'string' ? body.commentId : null, vid);
  if (!result) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  const res = NextResponse.json(result);
  if (fresh) setVisitor(res, vid);
  return res;
}
