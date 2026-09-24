// Page metadata (title, description, canonical link, social cards) built from
// the content the admin edits. Each page's server file calls these.

import type { Metadata } from 'next';
import { getContent } from '../content/store';
import type { PageKey, Seo, SiteContent } from '../content/types';

export function siteUrl(c: SiteContent) {
  return (c.settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

export function absoluteUrl(c: SiteContent, path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return siteUrl(c) + (path.startsWith('/') ? path : `/${path}`);
}

interface Build {
  path: string;
  seo?: Seo;
  /** Used when the SEO fields are empty. */
  fallbackTitle?: string;
  fallbackDescription?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
}

export function buildMetadata(c: SiteContent, b: Build): Metadata {
  const title = b.seo?.title || b.fallbackTitle;
  const description = b.seo?.description || b.fallbackDescription || c.seo.description;
  const image = b.seo?.image || b.image || c.seo.ogImage;
  const keywords = [b.seo?.keywords, c.seo.keywords].filter(Boolean).join(', ');
  const url = absoluteUrl(c, b.path);
  const fullTitle = title ? c.seo.titleTemplate.replace('%s', title) : c.seo.defaultTitle;
  return {
    // A page title that already carries the brand is used as is.
    title: title ? (/simorgh/i.test(title) ? { absolute: title } : title) : undefined,
    description,
    keywords: keywords || undefined,
    alternates: { canonical: url },
    robots: b.seo?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: b.type ?? 'website',
      url,
      title: title && /simorgh/i.test(title) ? title : fullTitle,
      description,
      siteName: c.settings.siteName,
      images: image ? [{ url: absoluteUrl(c, image) }] : undefined,
      publishedTime: b.publishedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title: title && /simorgh/i.test(title) ? title : fullTitle,
      description,
      images: image ? [absoluteUrl(c, image)] : undefined,
      site: c.seo.twitterHandle || undefined,
    },
  };
}

const PATHS: Record<PageKey, string> = {
  home: '/', products: '/products', solutions: '/solutions', industries: '/industries', technology: '/technology',
  insights: '/insights', company: '/company', contact: '/contact', requestDemo: '/request-demo',
};

/** generateMetadata for one of the fixed pages. */
export function pageMetadata(key: PageKey) {
  return async (): Promise<Metadata> => {
    const c = await getContent();
    const p = c.pages[key];
    return buildMetadata(c, { path: PATHS[key], seo: p.seo, image: p.heroImage });
  };
}
