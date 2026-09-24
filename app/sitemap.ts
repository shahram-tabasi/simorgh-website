import type { MetadataRoute } from 'next';
import { getContent, toPublic } from '@/src/content/store';
import { absoluteUrl } from '@/src/seo/metadata';

// Every public page, product, industry and article, so search engines find
// new content as soon as the admin publishes it.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const full = await getContent();
  const c = toPublic(full);
  const updated = new Date(full.updatedAt.startsWith('1970') ? Date.now() : full.updatedAt);
  const page = (path: string, priority: number, changeFrequency: 'weekly' | 'monthly' = 'monthly') =>
    ({ url: absoluteUrl(full, path), lastModified: updated, changeFrequency, priority });
  return [
    page('/', 1, 'weekly'),
    page('/products', 0.9, 'weekly'),
    page('/solutions', 0.8),
    page('/industries', 0.8),
    page('/technology', 0.8),
    page('/insights', 0.8, 'weekly'),
    page('/company', 0.7),
    page('/contact', 0.6),
    page('/request-demo', 0.7),
    ...c.products.filter((p) => !p.seo.noindex).map((p) => page(`/products/${p.slug}`, 0.9)),
    ...c.industries.filter((i) => !i.seo.noindex).map((i) => page(`/industries/${i.slug}`, 0.7)),
    ...c.articles.filter((a) => !a.seo.noindex).map((a) => ({
      url: absoluteUrl(full, `/insights/${a.slug}`),
      lastModified: new Date(a.date),
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
  ];
}
