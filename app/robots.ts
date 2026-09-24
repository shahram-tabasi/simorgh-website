import type { MetadataRoute } from 'next';
import { getContent } from '@/src/content/store';
import { absoluteUrl } from '@/src/seo/metadata';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const c = await getContent();
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: absoluteUrl(c, '/sitemap.xml'),
    host: absoluteUrl(c, '/'),
  };
}
