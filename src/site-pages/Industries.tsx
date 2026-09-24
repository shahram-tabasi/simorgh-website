'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Icon } from '../components/ui/Icon';
import { Reveal } from '../components/ui/Reveal';
import { useContent } from '../content/ContentProvider';

export function Industries() {
  const { pages, industries } = useContent();
  return (
    <>
      <PageHero
        eyebrow="INDUSTRIES"
        title="Intelligence for Real-World Systems"
        lead="Nine sectors where documentation, physical assets and operational decisions collide — and where a generic AI product is of no use."
        crumbs={[{ label: 'Industries' }]}
        image={pages.industries.heroImage}
        flip={pages.industries.heroFlip} />
      

      <section className="bg-space-0">
        <div className="mx-auto max-w-shell px-5 py-20 lg:px-10 lg:py-24">
          <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((ind, i) =>
            <li key={ind.slug} className="bg-space-1">
                <Reveal delay={Math.min(i * 0.03, 0.18)} className="h-full">
                  <Link
                  href={`/industries/${ind.slug}`}
                  className="group flex h-full flex-col p-8 transition-colors duration-200 ease-sim hover:bg-space-2">
                  
                    <Icon name={ind.icon} className="h-5 w-5 text-cyan" />
                    <h2 className="mt-6 font-display text-[18px] font-semibold tracking-tight text-ink">{ind.name}</h2>
                    <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{ind.lead}</p>
                    <div className="mt-6 flex flex-wrap gap-1.5">
                      {ind.systems.slice(0, 4).map((s) =>
                    <span key={s} className="border border-line px-2 py-1 font-mono text-[9.5px] text-ink-faint">
                          {s}
                        </span>
                    )}
                    </div>
                    <span className="mt-auto inline-flex items-center gap-2 pt-8 text-[13px] text-cyan-soft">
                      Industry page
                      <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 ease-sim group-hover:translate-x-1" strokeWidth={1.6} />
                    </span>
                  </Link>
                </Reveal>
              </li>
            )}
          </ul>
        </div>
      </section>
    </>);

}