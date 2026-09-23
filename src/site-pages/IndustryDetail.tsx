'use client';

import React from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ArrowRightIcon } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Reveal } from '../components/ui/Reveal';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { getIndustry, caseStudies, REF_IMAGE_NEURAL } from '../data/site';
import { products } from '../data/products';

export function IndustryDetail() {
  const { slug = '' } = useParams();
  const industry = getIndustry(Array.isArray(slug) ? slug[0] : slug);

  if (!industry) notFound();

  const relevant = products.filter((p) => p.industries.includes(industry.name));
  const fallback = relevant.length > 0 ? relevant : products.slice(0, 3);
  const study = caseStudies.find((c) => c.sector === industry.name);

  return (
    <>
      <PageHero
        eyebrow="INDUSTRY"
        title={industry.name}
        lead={industry.lead}
        crumbs={[{ label: 'Industries', to: '/industries' }, { label: industry.name }]}
        image={REF_IMAGE_NEURAL} />
      

      <section className="border-b border-line bg-space-0">
        <div className="mx-auto grid max-w-shell gap-14 px-5 py-20 lg:grid-cols-[1.2fr_1fr] lg:gap-20 lg:px-10 lg:py-24">
          <Reveal>
            <SectionHeader index="CONTEXT" title="The operating reality" />
            <p className="mt-6 text-[16px] leading-relaxed text-ink-muted">{industry.body}</p>
            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-line pt-8">
              {industry.outcomes.map((o) =>
              <div key={o.label}>
                  <dt className="font-display text-3xl font-semibold text-cyan-soft">{o.value}</dt>
                  <dd className="mt-2 text-[12.5px] leading-snug text-ink-faint">{o.label}</dd>
                </div>
              )}
            </dl>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="border border-line bg-space-1">
              <div className="border-b border-line px-5 py-3 font-mono text-[10px] tracking-label text-cyan/80">
                SYSTEMS IN SCOPE
              </div>
              <ol className="p-2">
                {industry.systems.map((s, i) =>
                <li key={s} className="flex items-center gap-4 border-b border-line/60 px-4 py-3 last:border-b-0">
                    <span className="font-mono text-[10px] text-ink-faint/80">{String(i + 1).padStart(2, '0')}</span>
                    <span className="h-1.5 w-1.5 rotate-45 bg-cyan/70" aria-hidden="true" />
                    <span className="text-[14px] text-ink-muted">{s}</span>
                  </li>
                )}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-line bg-space-1">
        <div className="mx-auto max-w-shell px-5 py-20 lg:px-10 lg:py-24">
          <SectionHeader index="PLATFORM" title="Products applied here" />
          <ul className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {fallback.map((p) =>
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

          {study &&
          <div className="mt-16 grid gap-8 border border-line bg-space-0 p-10 lg:grid-cols-[1fr_200px] lg:items-center">
              <div>
                <span className="font-mono text-[10px] tracking-label text-cyan/80">CASE STUDY</span>
                <h3 className="mt-5 max-w-2xl font-display text-2xl font-semibold leading-snug tracking-tight text-ink">
                  {study.title}
                </h3>
                <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-ink-muted">{study.result}</p>
              </div>
              <div className="lg:text-right">
                <div className="font-display text-4xl font-semibold text-cyan-soft">{study.metric}</div>
                <div className="mt-2 text-[12.5px] text-ink-faint">{study.metricLabel}</div>
              </div>
            </div>
          }

          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Button to="/request-demo" size="lg">
              {`Discuss a ${industry.name} deployment`}
            </Button>
            <Button to="/industries" size="lg" variant="outline">
              All industries
            </Button>
          </div>
        </div>
      </section>
    </>);

}