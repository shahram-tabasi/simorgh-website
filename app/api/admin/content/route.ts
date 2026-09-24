import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/src/admin/guard';
import { getContent, saveContent } from '@/src/content/store';
import type { SiteContent } from '@/src/content/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return NextResponse.json(await getContent());
}

/** Save everything. `baseUpdatedAt` guards against two people overwriting each other. */
export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { content, baseUpdatedAt } = (await req.json()) as { content: SiteContent; baseUpdatedAt?: string };
  if (!content || typeof content !== 'object' || !Array.isArray(content.products)) {
    return NextResponse.json({ error: 'invalid content' }, { status: 400 });
  }
  const current = await getContent();
  if (baseUpdatedAt && current.updatedAt !== baseUpdatedAt) {
    return NextResponse.json({ error: 'conflict', current }, { status: 409 });
  }
  const slugs = (items: { slug: string }[]) => new Set(items.map((i) => i.slug)).size === items.length;
  if (!slugs(content.products) || !slugs(content.industries) || !slugs(content.articles)) {
    return NextResponse.json({ error: 'duplicate-slug' }, { status: 400 });
  }
  const saved = await saveContent(content);
  // Every page, the sitemap and the metadata are rebuilt on their next visit.
  revalidatePath('/', 'layout');
  return NextResponse.json(saved);
}
