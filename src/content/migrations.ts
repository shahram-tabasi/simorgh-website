// One-time changes to the stored content (storage/content.json), for content
// that ships with a release: the admin's saved lists replace the defaults
// whole, so new products or articles would otherwise never appear. Each
// migration runs once; its id is then kept in content.migrations, so an
// admin who later undoes part of it (re-publishes a product) is not overruled.
import { productionProducts, retiredProducts } from './seed/products-2026-10';
import { simodArticle } from './seed/article-simod';
import type { SiteContent } from './types';

interface Migration {
  id: string;
  apply: (c: SiteContent) => SiteContent;
}

const OLD_PRODUCTS_DESCRIPTION =
  'SIMORGH Design Suite, Grid, Digital Twin, Kara, Shop, Draw and Cloud: seven products sharing one intelligence layer, from electrical design to digital twin.';

export const MIGRATIONS: Migration[] = [
  {
    // October 2026: the products in production (Kara, Design Suite, Engineering
    // AI, HR Assistant, on Cloud) and the first real article. The products not
    // in production and the placeholder articles are unpublished, not deleted.
    id: '2026-10-production-products',
    apply: (c) => {
      const bySlug = new Map(c.products.map((p) => [p.slug, p]));
      const order = ['simorgh-kara', 'simorgh-design-suite', 'simorgh-engineering-ai', 'simorgh-hr-assistant', 'simorgh-cloud'];
      const products = c.products.map((p) => (retiredProducts.includes(p.slug) ? { ...p, status: 'draft' as const } : p));
      for (const text of productionProducts) {
        const old = bySlug.get(text.slug);
        const next = {
          ...text,
          // What the admin chose stays: pictures, gallery, diagrams, SEO overrides.
          image: old?.image || text.image,
          headerImage: old?.headerImage ?? '',
          gallery: old?.gallery ?? [],
          schematics: old?.schematics ?? [],
          seo: { ...text.seo, ...Object.fromEntries(Object.entries(old?.seo ?? {}).filter(([, v]) => v)) },
          status: 'published' as const,
          order: 0,
        };
        const i = products.findIndex((p) => p.slug === text.slug);
        if (i >= 0) products[i] = next; else products.push(next);
      }
      for (const p of products) {
        const rank = order.indexOf(p.slug);
        p.order = rank >= 0 ? rank + 1 : 100 + p.order;
      }

      const articles = c.articles.map((a) => (!a.body.trim() && a.status !== 'draft' ? { ...a, status: 'draft' as const } : a));
      if (!articles.some((a) => a.slug === simodArticle.slug)) articles.unshift(simodArticle);

      const pages = { ...c.pages };
      if (pages.products?.seo.description === OLD_PRODUCTS_DESCRIPTION) {
        pages.products = {
          ...pages.products,
          seo: {
            ...pages.products.seo,
            description: 'Simorgh Kara, Design Suite, Engineering AI and HR Assistant: software for running complex engineering organisations, on your own servers.',
          },
        };
      }
      return { ...c, products, articles, pages };
    },
  },
];

/** The migrations not yet applied to `c`, applied in order. */
export function migrate(c: SiteContent): { content: SiteContent; applied: string[] } {
  const done = new Set(c.migrations ?? []);
  const applied: string[] = [];
  let content = c;
  for (const m of MIGRATIONS) {
    if (done.has(m.id)) continue;
    content = m.apply(content);
    applied.push(m.id);
  }
  if (applied.length) content = { ...content, migrations: [...(c.migrations ?? []), ...applied] };
  return { content, applied };
}
