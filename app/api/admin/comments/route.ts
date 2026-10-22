import { NextResponse } from 'next/server';
import { requireAdmin } from '@/src/admin/guard';
import { getContent } from '@/src/content/store';
import { addComment, adminList, adminPatch } from '@/src/comments/store';
import { notifyReply } from '@/src/mail/notify';
import { siteUrl } from '@/src/seo/metadata';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json(await adminList());
}

/** Approve, hide, pin, mark answered, remove; or change the comment settings. */
export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const result = await adminPatch(body);
  if (result?.parent) {
    const c = await getContent();
    const title = c.articles.find((a) => a.slug === result.parent!.slug)?.title ?? result.parent.slug;
    notifyReply(result.parent, result.approvedReply, title, siteUrl(c)).catch((e) => console.error('[comments] reply email failed:', e?.message));
  }
  return NextResponse.json(await adminList());
}

/** A reply from the team, live at once and marked with the team badge. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { slug, parentId, text, name } = (await req.json().catch(() => ({}))) as Record<string, string>;
  const body = String(text || '').trim().slice(0, 4000);
  if (!slug || !body) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const c = await getContent();
  const result = await addComment({
    slug, parentId: parentId || null, name: String(name || 'SIMORGH Team').slice(0, 60), email: c.settings.email || 'team@simorghai.com',
    headline: '', kind: 'comment', text: body, notify: false, ip: 'admin', team: true,
  });
  if ('error' in result) return NextResponse.json(result, { status: 400 });
  if (result.parent) {
    const title = c.articles.find((a) => a.slug === slug)?.title ?? slug;
    notifyReply(result.parent, result.comment, title, siteUrl(c)).catch((e) => console.error('[comments] reply email failed:', e?.message));
  }
  return NextResponse.json(await adminList());
}
