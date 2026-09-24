'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRightIcon, CheckIcon, FileTextIcon } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Reveal } from '../components/ui/Reveal';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Pipeline } from '../components/product/Pipeline';
import { FaqList } from '../components/product/FaqList';
import { ProductPreview } from '../components/product/ProductPreview';
import { useContent } from '../content/ContentProvider';

const previewRows: Record<string, {label: string;value: string;state?: 'ok' | 'warn' | 'alert';}[]> = {
  'simorgh-design-suite': [
  { label: 'Documents ingested', value: '1,284 files' },
  { label: 'Equipment resolved', value: '3,911 objects', state: 'ok' },
  { label: 'Low-confidence regions', value: '17 flagged', state: 'warn' },
  { label: 'SLD revision', value: 'R04 · generated' },
  { label: 'Standards applied', value: 'IEC + company' }],

  'simorgh-grid': [
  { label: 'Feeders monitored', value: '412' },
  { label: 'Events last hour', value: '11,940' },
  { label: 'Ranked incidents', value: '6', state: 'ok' },
  { label: 'Probable fault section', value: 'F-217 / SP-4', state: 'alert' },
  { label: 'Recommended action', value: 'Isolate + backfeed' }],

  'simorgh-digital-twin': [
  { label: 'Bound layers', value: '9 / 9', state: 'ok' },
  { label: 'Spatial objects', value: '1.4M' },
  { label: 'Telemetry streams', value: '8,220' },
  { label: 'Active scenario', value: '2046 load growth' },
  { label: 'Capacity breach', value: 'District 7 · 2031', state: 'warn' }],

  'simorgh-kara': [
  { label: 'Sites active', value: '11' },
  { label: 'Personnel on site', value: '2,043' },
  { label: 'PPE exceptions', value: '4 open', state: 'warn' },
  { label: 'Restricted-zone entries', value: '0 unauthorised', state: 'ok' },
  { label: 'Permits expiring', value: '9 in 24h' }],

  'simorgh-shop': [
  { label: 'Open projects', value: '38' },
  { label: 'Committed cost', value: '€ 12.4M' },
  { label: 'Long-lead items', value: '22 tracked', state: 'warn' },
  { label: 'Stock reserved', value: '1,708 lines' },
  { label: 'Close status', value: 'Day 3 · on track', state: 'ok' }],

  'simorgh-draw': [
  { label: 'Drawing', value: 'SLD-MV-014 · R02' },
  { label: 'Objects', value: '486 typed' },
  { label: 'Rule violations', value: '0 open', state: 'ok' },
  { label: 'Open markups', value: '3' },
  { label: 'Library', value: 'IEC 60617 v12' }],

  'simorgh-cloud': [
  { label: 'Served models', value: '14 versions' },
  { label: 'Pipelines healthy', value: '31 / 31', state: 'ok' },
  { label: 'Knowledge index', value: '4.2M nodes' },
  { label: 'Deployment', value: 'Private · sovereign' },
  { label: 'Audit coverage', value: '100% inferences', state: 'ok' }]

};

export function ProductDetail({ slug }: { slug: string }) {
  const { products } = useContent();
  const product = products.find((p) => p.slug === slug);

  if (!product) notFound();

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);
  const rows = previewRows[product.slug] ?? [];
  const gallery = product.gallery.filter(Boolean);
  const schematics = product.schematics.filter((s) => s.src);

  return (
    <>
      <PageHero
        eyebrow={product.domain.toUpperCase()}
        title={product.name}
        lead={product.tagline}
        crumbs={[{ label: 'Products', to: '/products' }, { label: product.short }]}
        image={product.headerImage || product.image}>
        
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button to="/request-demo" size="lg">
            Request a Demo
            <ArrowRightIcon className="h-4 w-4" strokeWidth={1.6} />
          </Button>
          <Button href="#capabilities" size="lg" variant="outline">
            Capabilities
          </Button>
        </div>
      </PageHero>

      {/* Overview + live surface */}
      <section className="border-b border-line bg-space-0">
        <div className="mx-auto grid max-w-shell gap-14 px-5 py-20 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:px-10 lg:py-24">
          <Reveal>
            <SectionHeader index="OVERVIEW" title="What it does" />
            <p className="mt-6 text-[16px] leading-relaxed text-ink-muted">{product.summary}</p>
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-line pt-8">
              {product.metrics.map((m) =>
              <div key={m.label}>
                  <dt className="font-display text-3xl font-semibold text-cyan-soft">{m.value}</dt>
                  <dd className="mt-2 text-[12.5px] leading-snug text-ink-faint">{m.label}</dd>
                </div>
              )}
            </dl>
          </Reveal>
          <Reveal delay={0.06}>
            <ProductPreview
              name={`${product.short.toUpperCase()} · WORKSPACE`}
              caption="Representative interface state. Every value shown resolves to its source record."
              rows={rows} />
            
          </Reveal>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="border-b border-line bg-space-1 scroll-mt-20">
        <div className="mx-auto max-w-shell px-5 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <SectionHeader index="CAPABILITIES" title="What is included" />
          </Reveal>
          <ul className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {product.capabilities.map((c) =>
            <li key={c.title} className="flex flex-col bg-space-1 p-7">
                <CheckIcon className="h-4 w-4 text-cyan" strokeWidth={1.8} aria-hidden="true" />
                <h3 className="mt-5 font-display text-[16px] font-semibold tracking-tight text-ink">{c.title}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-faint">{c.body}</p>
              </li>
            )}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-line bg-space-0">
        <div className="mx-auto max-w-shell px-5 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <SectionHeader
              index="HOW IT WORKS"
              title="The pipeline, end to end"
              lead="Each stage is inspectable. Nothing is produced that cannot be traced back to the input that caused it." />
            
          </Reveal>
          <Reveal delay={0.06} className="mt-14">
            <Pipeline steps={product.pipeline} label={`${product.short.toUpperCase()} PIPELINE`} />
          </Reveal>
        </div>
      </section>

      {/* Video + industries */}
      <section className="border-b border-line bg-space-1">
        <div className="mx-auto grid max-w-shell gap-14 px-5 py-20 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:px-10 lg:py-24">
          <Reveal>
            <SectionHeader index="WALKTHROUGH" title="See it running" lead="A recorded product walkthrough with an engineer narrating each decision the system makes." />
            <div className="mt-10">
              <ProductPreview
                name={`${product.short.toUpperCase()} · 12:40`}
                caption="Video content is managed in the console with full VideoObject metadata."
                video
                rows={rows.slice(0, 3)} />
              
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <SectionHeader index="INDUSTRIES" title="Where it is deployed" />
            <ul className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2">
              {product.industries.map((ind) =>
              <li key={ind} className="bg-space-1 p-6">
                  <div className="flex items-center gap-3">
                    <Icon name={product.icon} className="h-4 w-4 text-blue-soft" />
                    <span className="text-[14px] text-ink">{ind}</span>
                  </div>
                </li>
              )}
            </ul>
            <p className="mt-8 text-[13.5px] leading-relaxed text-ink-faint">
              Deployment runs on SIMORGH Cloud, on your own infrastructure, or as a hybrid with local ingestion and
              central analytics.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Gallery and schematics: shown only when the admin has added some. */}
      {gallery.length > 0 &&
      <section className="border-b border-line bg-space-1">
          <div className="mx-auto max-w-shell px-5 py-20 lg:px-10 lg:py-24">
            <Reveal>
              <SectionHeader index="GALLERY" title="Product gallery" />
            </Reveal>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {gallery.map((src) =>
            <li key={src} className="overflow-hidden rounded-lg border border-line bg-space-0">
                  <a href={src} target="_blank" rel="noopener" className="block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={product.name} loading="lazy" className="aspect-[4/3] w-full object-contain p-2 transition-transform duration-300 ease-sim hover:scale-[1.03]" />
                  </a>
                </li>
            )}
            </ul>
          </div>
        </section>
      }

      {schematics.length > 0 &&
      <section className="border-b border-line bg-space-0">
          <div className="mx-auto max-w-shell px-5 py-20 lg:px-10 lg:py-24">
            <Reveal>
              <SectionHeader index="SCHEMATICS" title="Diagrams and schematics" />
            </Reveal>
            <ul className="mt-12 grid gap-6 lg:grid-cols-2">
              {schematics.map((sch) =>
            <li key={sch.src} className="overflow-hidden rounded-lg border border-line bg-space-1">
                  <a href={sch.src} target="_blank" rel="noopener" className="block bg-white/[0.02]">
                    {/\.pdf$/i.test(sch.src) ?
                <span className="flex items-center gap-3 px-5 py-10 text-[14px] text-cyan-soft">
                        <FileTextIcon className="h-6 w-6" strokeWidth={1.4} /> PDF
                      </span> :
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={sch.src} alt={sch.caption || product.name} loading="lazy" className="max-h-[520px] w-full object-contain p-3" />
                }
                  </a>
                  {sch.caption && <p className="border-t border-line px-5 py-4 text-[13.5px] text-ink-muted">{sch.caption}</p>}
                </li>
            )}
            </ul>
          </div>
        </section>
      }

      {/* FAQ */}
      <section className="border-b border-line bg-space-0">
        <div className="mx-auto max-w-shell px-5 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <SectionHeader index="FAQ" title="Questions engineers ask first" />
          </Reveal>
          <div className="mt-12 max-w-4xl">
            <FaqList items={product.faq} />
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="bg-space-1">
        <div className="mx-auto max-w-shell px-5 py-20 lg:px-10 lg:py-24">
          <SectionHeader index="RELATED" title="Works alongside" />
          <ul className="mt-12 grid gap-px border border-line bg-line lg:grid-cols-3">
            {related.map((p) =>
            <li key={p.slug} className="bg-space-1">
                <Link href={`/products/${p.slug}`} className="group flex h-full flex-col p-8 transition-colors duration-200 ease-sim hover:bg-space-2">
                  <Icon name={p.icon} className="h-5 w-5 text-cyan" />
                  <h3 className="mt-6 font-display text-[17px] font-semibold tracking-tight text-ink">{p.name}</h3>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-ink-faint">{p.tagline}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-8 text-[13px] text-cyan-soft">
                    Explore
                    <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 ease-sim group-hover:translate-x-1" strokeWidth={1.6} />
                  </span>
                </Link>
              </li>
            )}
          </ul>

          <div className="mt-16 flex flex-col items-start justify-between gap-6 border border-line bg-space-0 p-10 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
                {`See ${product.short} against your own data`}
              </h3>
              <p className="mt-3 max-w-xl text-[14.5px] text-ink-muted">
                Demonstrations are run on a representative sample of your documentation or telemetry, not a canned dataset.
              </p>
            </div>
            <Button to="/request-demo" size="lg">
              Request a Demo
            </Button>
          </div>
        </div>
      </section>
    </>);

}