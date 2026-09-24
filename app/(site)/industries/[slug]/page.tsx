import { notFound } from 'next/navigation';
import { IndustryDetail } from '@/src/site-pages/IndustryDetail';
import { getContent, toPublic } from '@/src/content/store';
import { buildMetadata } from '@/src/seo/metadata';
import { JsonLd, breadcrumbLd } from '@/src/seo/jsonld';

type Props = { params: Promise<{ slug: string }> };

async function find(slug: string) {
  const c = await getContent();
  return { c, industry: toPublic(c).industries.find((i) => i.slug === slug) };
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { c, industry } = await find(slug);
  if (!industry) return {};
  return buildMetadata(c, {
    path: `/industries/${slug}`,
    seo: industry.seo,
    fallbackTitle: `${industry.name} — ${industry.lead.replace(/\.$/, '')}`,
    fallbackDescription: industry.body,
    image: industry.image,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const { c, industry } = await find(slug);
  if (!industry) notFound();
  return (
    <>
      <JsonLd data={breadcrumbLd(c, [{ name: 'Industries', path: '/industries' }, { name: industry.name, path: `/industries/${slug}` }])} />
      <IndustryDetail slug={slug} />
    </>
  );
}
