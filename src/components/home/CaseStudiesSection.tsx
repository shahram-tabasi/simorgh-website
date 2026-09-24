'use client';

import React from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal } from '../ui/Reveal';
import { useContent } from '../../content/ContentProvider';

export function CaseStudiesSection() {
  const { caseStudies } = useContent();
  return (
    <section className="relative w-full border-t border-line bg-space-0" aria-label="Case studies">
      <div className="mx-auto max-w-shell px-5 py-24 lg:px-10 lg:py-32">
        <Reveal>
          <SectionHeader
            index="08 / CASE STUDIES"
            title="Deployed against real infrastructure"
            lead="Each engagement below is described at the level our clients approved for publication." />
          
        </Reveal>

        <div className="mt-16 flex flex-col border-t border-line">
          {caseStudies.map((cs, i) =>
          <Reveal key={cs.slug} delay={i * 0.05}>
              <article className="group grid gap-6 border-b border-line py-10 lg:grid-cols-[180px_1fr_200px] lg:items-start lg:gap-12">
                <div>
                  <div className="font-mono text-[10px] tracking-label text-cyan/80">{cs.sector.toUpperCase()}</div>
                  <div className="mt-3 text-[13px] text-ink-faint">{cs.client}</div>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold leading-snug tracking-tight text-ink lg:text-[24px]">
                    {cs.title}
                  </h3>
                  <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-ink-muted">{cs.result}</p>
                </div>
                <div className="lg:text-right">
                  <div className="font-display text-4xl font-semibold text-cyan-soft">{cs.metric}</div>
                  <div className="mt-2 text-[12.5px] text-ink-faint">{cs.metricLabel}</div>
                </div>
              </article>
            </Reveal>
          )}
        </div>
      </div>
    </section>);

}