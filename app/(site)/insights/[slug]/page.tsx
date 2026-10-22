import { notFound } from 'next/navigation';
import { ArticlePage } from '@/src/site-pages/ArticlePage';
import { getArticle, getContent } from '@/src/content/store';
import { buildMetadata } from '@/src/seo/metadata';
import { JsonLd, articleLd, breadcrumbLd } from '@/src/seo/jsonld';
import { getThread } from '@/src/comments/store';
import { visitorId } from '@/src/comments/http';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const [c, article] = await Promise.all([getContent(), getArticle(slug)]);
  if (!article) return {};
  return buildMetadata(c, {
    path: `/insights/${slug}`,
    seo: article.seo,
    fallbackTitle: article.title,
    fallbackDescription: article.excerpt,
    image: article.cover,
    type: 'article',
    publishedTime: article.date,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const [c, article] = await Promise.all([getContent(), getArticle(slug)]);
  if (!article) notFound();
  const thread = await getThread(slug, await visitorId());
  return (
    <>
      <JsonLd data={[
        articleLd(c, article, thread),
        breadcrumbLd(c, [{ name: 'Insights', path: '/insights' }, { name: article.title, path: `/insights/${slug}` }]),
      ]} />
      <ArticlePage article={article} thread={thread} />
    </>
  );
}
