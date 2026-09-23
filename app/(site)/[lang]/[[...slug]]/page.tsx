import { redirect, notFound } from 'next/navigation';
import { languages } from '@/src/data/site';

export default async function LocaleRedirect({ params }: { params: Promise<{ lang: string; slug?: string[] }> }) {
  const { lang, slug = [] } = await params;
  if (!languages.some((l) => l.code === lang)) notFound();
  redirect('/' + slug.join('/'));
}
