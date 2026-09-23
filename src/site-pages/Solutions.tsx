'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Reveal } from '../components/ui/Reveal';
import { REF_IMAGE_NEURAL } from '../data/site';

const solutions = [
{
  title: 'Engineering Automation',
  problem: 'Engineers spend more time transcribing documents than designing systems.',
  approach: 'Design Suite and Draw turn specifications into typed engineering models, generate single line diagrams and validate against standards before review.',
  products: ['Design Suite', 'Draw', 'Cloud'],
  to: '/products/simorgh-design-suite'
},
{
  title: 'Energy Intelligence',
  problem: 'Control rooms receive thousands of undifferentiated signals during an event.',
  approach: 'Grid builds a live network model, correlates events by topology, localises probable fault sections and proposes restoration sequencing with evidence.',
  products: ['Grid', 'Digital Twin', 'Cloud'],
  to: '/products/simorgh-grid'
},
{
  title: 'Urban Digital Twin',
  problem: 'Capital decisions are made on spreadsheets that cannot model feedback.',
  approach: 'Digital Twin binds GIS, infrastructure, telemetry and system dynamics so interventions can be compared over a twenty-year horizon.',
  products: ['Digital Twin', 'Grid', 'Cloud'],
  to: '/products/simorgh-digital-twin'
},
{
  title: 'Industrial Safety & Workforce',
  problem: 'Site supervision cannot be everywhere, and compliance evidence arrives late.',
  approach: 'Kara combines presence, permits and vision-based PPE monitoring, surfacing only exceptions and tracking each to closure.',
  products: ['Kara', 'Shop', 'Cloud'],
  to: '/products/simorgh-kara'
}];


export function Solutions() {
  return (
    <>
      <PageHero
        eyebrow="SOLUTIONS"
        title="Problems first, products second"
        lead="Four recurring problems across the sectors SIMORGH works in, and the combination of products that addresses each."
        crumbs={[{ label: 'Solutions' }]}
        image={REF_IMAGE_NEURAL} />
      

      <section className="bg-space-0">
        <div className="mx-auto max-w-shell px-5 py-20 lg:px-10 lg:py-24">
          <div className="grid gap-px border border-line bg-line">
            {solutions.map((s, i) =>
            <Reveal key={s.title} delay={Math.min(i * 0.05, 0.2)}>
                <div className="grid gap-8 bg-space-1 p-8 lg:grid-cols-[280px_1fr_auto] lg:items-start lg:gap-12 lg:p-10">
                  <div>
                    <span className="font-mono text-[10px] text-ink-faint">{String(i + 1).padStart(2, '0')}</span>
                    <h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-ink">{s.title}</h2>
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {s.products.map((p) =>
                    <span key={p} className="border border-line px-2 py-1 font-mono text-[9.5px] text-ink-faint">
                          {p}
                        </span>
                    )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[15px] leading-relaxed text-ink">{s.problem}</p>
                    <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-ink-muted">{s.approach}</p>
                  </div>
                  <Link href={s.to} className="group inline-flex items-center gap-2 whitespace-nowrap text-[13px] text-cyan-soft">
                    Lead product
                    <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 ease-sim group-hover:translate-x-1" strokeWidth={1.6} />
                  </Link>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>
    </>);

}