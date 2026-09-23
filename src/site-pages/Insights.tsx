'use client';

import React, { useMemo, useState } from 'react';
import { PlayIcon, FileTextIcon } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Reveal } from '../components/ui/Reveal';
import { insights, REF_IMAGE_BIRD } from '../data/site';

const categories = ['All', 'AI', 'Industrial AI', 'Digital Twin', 'Smart Grid', 'Engineering', 'Software'];

export function Insights() {
  const [category, setCategory] = useState('All');

  const filtered = useMemo(
    () => category === 'All' ? insights : insights.filter((i) => i.category === category),
    [category]
  );

  return (
    <>
      <PageHero
        eyebrow="KNOWLEDGE CENTRE"
        title="Insights"
        lead="Technical articles, case studies, recorded walkthroughs and whitepapers from the engineering teams building SIMORGH."
        crumbs={[{ label: 'Insights' }]}
        image={REF_IMAGE_BIRD} />
      

      <section className="bg-space-0">
        <div className="mx-auto max-w-shell px-5 py-16 lg:px-10 lg:py-20">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter insights by category">
            {categories.map((c) =>
            <button
              key={c}
              onClick={() => setCategory(c)}
              aria-pressed={c === category}
              className={`border px-3.5 py-2 font-mono text-[10.5px] tracking-label transition-colors duration-150 ease-sim ${
              c === category ?
              'border-cyan/60 text-cyan' :
              'border-line text-ink-faint hover:border-blue/50 hover:text-ink-muted'}`
              }>
              
                {c.toUpperCase()}
              </button>
            )}
          </div>

          <div className="mt-12 border-t border-line">
            {filtered.length === 0 &&
            <p className="py-16 text-[14px] text-ink-faint">No published items in this category yet.</p>
            }
            {filtered.map((item, i) =>
            <Reveal key={item.slug} delay={Math.min(i * 0.04, 0.2)}>
                <article className="group grid gap-5 border-b border-line py-9 lg:grid-cols-[170px_1fr_120px] lg:items-start lg:gap-12">
                  <div className="flex items-center gap-2 font-mono text-[10px] tracking-label text-cyan/80">
                    {item.kind === 'Video' ?
                  <PlayIcon className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" /> :

                  <FileTextIcon className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
                  }
                    {item.kind.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="max-w-3xl font-display text-xl font-semibold leading-snug tracking-tight text-ink transition-colors duration-200 ease-sim group-hover:text-cyan-soft lg:text-[24px]">
                      {item.title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-ink-muted">{item.excerpt}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-[10px] text-ink-faint">
                      <span>{item.category.toUpperCase()}</span>
                      <span className="h-px w-5 bg-line" />
                      <span>{item.readTime}</span>
                    </div>
                  </div>
                  <div className="font-mono text-[11px] text-ink-faint lg:text-right">{item.date}</div>
                </article>
              </Reveal>
            )}
          </div>
        </div>
      </section>
    </>);

}