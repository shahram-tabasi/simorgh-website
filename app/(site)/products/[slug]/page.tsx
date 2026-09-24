import { notFound } from 'next/navigation';
import { ProductDetail } from '@/src/site-pages/ProductDetail';
import { getContent, toPublic } from '@/src/content/store';
import { buildMetadata } from '@/src/seo/metadata';
import { JsonLd, breadcrumbLd, faqLd, productLd } from '@/src/seo/jsonld';

type Props = { params: Promise<{ slug: string }> };

async function find(slug: string) {
  const c = await getContent();
  return { c, product: toPublic(c).products.find((p) => p.slug === slug) };
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { c, product } = await find(slug);
  if (!product) return {};
  return buildMetadata(c, {
    path: `/products/${slug}`,
    seo: product.seo,
    fallbackTitle: `${product.name} — ${product.tagline.replace(/\.$/, '')}`,
    fallbackDescription: product.summary,
    image: product.headerImage || product.image,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const { c, product } = await find(slug);
  if (!product) notFound();
  return (
    <>
      <JsonLd data={[
        productLd(c, product),
        breadcrumbLd(c, [{ name: 'Products', path: '/products' }, { name: product.name, path: `/products/${slug}` }]),
        ...(product.faq.length ? [faqLd(product.faq)] : []),
      ]} />
      <ProductDetail slug={slug} />
    </>
  );
}
