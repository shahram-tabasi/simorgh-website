// Structured data (schema.org JSON-LD): what lets Google show the company,
// products, articles, breadcrumbs and FAQs as rich results.

import React from 'react';
import type { Article, ProductEntry, SiteContent } from '../content/types';
import { absoluteUrl } from './metadata';

export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be raw JSON; "<" is escaped so no content can close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

export function organizationLd(c: SiteContent) {
  const sameAs = Object.values(c.settings.social).filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': absoluteUrl(c, '/#organization'),
    name: c.settings.siteName,
    legalName: c.settings.legalName,
    alternateName: 'سیمرغ',
    url: absoluteUrl(c, '/'),
    logo: absoluteUrl(c, '/icon.png'),
    email: c.settings.email || undefined,
    telephone: c.settings.phone || undefined,
    address: c.settings.address ? { '@type': 'PostalAddress', streetAddress: c.settings.address, addressCountry: 'IR' } : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export function websiteLd(c: SiteContent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl(c, '/#website'),
    name: c.settings.siteName,
    url: absoluteUrl(c, '/'),
    publisher: { '@id': absoluteUrl(c, '/#organization') },
    inLanguage: ['en', 'fa', 'ar', 'tr', 'de', 'fr', 'es', 'zh', 'ja', 'ru'],
  };
}

export function breadcrumbLd(c: SiteContent, trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: absoluteUrl(c, t.path),
    })),
  };
}

export function productLd(c: SiteContent, p: ProductEntry) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: p.name,
    alternateName: p.short,
    description: p.seo.description || p.summary,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Windows',
    image: p.image ? absoluteUrl(c, p.image) : undefined,
    url: absoluteUrl(c, `/products/${p.slug}`),
    publisher: { '@id': absoluteUrl(c, '/#organization') },
    featureList: p.capabilities.map((f) => f.title),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function articleLd(c: SiteContent, a: Article) {
  const image = a.seo.image || a.cover;
  return {
    '@context': 'https://schema.org',
    '@type': a.kind === 'News' ? 'NewsArticle' : a.kind === 'Video' ? 'VideoObject' : 'Article',
    headline: a.title,
    name: a.title,
    description: a.seo.description || a.excerpt,
    datePublished: a.date,
    uploadDate: a.kind === 'Video' ? a.date : undefined,
    thumbnailUrl: a.kind === 'Video' && image ? absoluteUrl(c, image) : undefined,
    contentUrl: a.kind === 'Video' && a.video ? absoluteUrl(c, a.video) : undefined,
    image: image ? absoluteUrl(c, image) : undefined,
    author: { '@type': 'Organization', name: a.author || c.settings.siteName },
    publisher: { '@id': absoluteUrl(c, '/#organization') },
    mainEntityOfPage: absoluteUrl(c, `/insights/${a.slug}`),
    articleSection: a.category,
  };
}
