'use client';

import React from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal } from '../ui/Reveal';
import { useContent } from '../../content/ContentProvider';
import { REF_IMAGE_BIRD } from '../../data/site';

export function AISection() {
  const { aiLayers } = useContent();
  return (
    <section className="relative w-full overflow-hidden border-t border-line bg-space-1" aria-label="SIMORGH AI">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden">
        <img src={REF_IMAGE_BIRD} alt="" aria-hidden="true" loading="lazy" className="h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-space-1/40 via-space-1/85 to-space-1" />
      </div>

      <div className="relative mx-auto max-w-shell px-5 py-24 lg:px-10 lg:py-32">
        <Reveal>
          <SectionHeader
            index="07 / SIMORGH AI"
            title="AI as a layer, not a feature"
            lead="Eight capability families sit beneath every product. A vision model trained for switchgear symbols and a retrieval layer grounded in your standards are the same infrastructure, applied differently."
            align="center" />
          
        </Reveal>

        <ul className="mt-16 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {aiLayers.map((layer, i) =>
          <li key={layer.title} className="flex flex-col bg-space-1 p-7">
              <span className="font-mono text-[10px] text-ink-faint/80">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-5 font-display text-[16px] font-semibold tracking-tight text-ink">{layer.title}</h3>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-faint">{layer.body}</p>
            </li>
          )}
        </ul>

        <Reveal delay={0.06}>
          <p className="mx-auto mt-12 max-w-2xl text-center text-[13.5px] leading-relaxed text-ink-faint">
            Every inference carries lineage: which model, which version, which source material. In engineering
            contexts an answer without provenance is not an answer.
          </p>
        </Reveal>
      </div>
    </section>);

}