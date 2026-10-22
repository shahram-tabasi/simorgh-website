'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Reveal } from '../components/ui/Reveal';
import { useContent } from '../content/ContentProvider';

const solutions = [
{
  title: 'Run a multi-company organisation',
  problem: 'Holding groups and virtual enterprises run each company on its own spreadsheets, e-mail threads and ERP screens, so nobody sees the whole.',
  approach: 'Kara gives every person one sign-in, one work queue and one directory across all companies, with sales, procurement, production and after-sales running as processes on the ERP behind it.',
  products: ['Kara', 'Cloud'],
  to: '/products/simorgh-kara'
},
{
  title: 'From specification to EPLAN',
  problem: 'Electrical engineers spend days transcribing tender documents into panel layouts and single line diagrams.',
  approach: 'Design Suite reads the specification, proposes the design, checks it against your rules and exports to EPLAN; the Engineering AI answers questions over the project documents.',
  products: ['Design Suite', 'Engineering AI'],
  to: '/products/simorgh-design-suite'
},
{
  title: 'Knowledge that answers back',
  problem: 'Standards, procedures and HR policies sit in folders nobody reads, so the same questions reach the same few people every day.',
  approach: 'The Engineering AI and HR Assistant answer from your own documents, cite the page they used and run on your own servers, so nothing leaves the company.',
  products: ['Engineering AI', 'HR Assistant'],
  to: '/products/simorgh-engineering-ai'
},
{
  title: 'Process intelligence and what-if',
  problem: 'Managers change approval rules, staffing and shifts on intuition, and learn months later whether it helped.',
  approach: 'Kara records every task with who did it and when; that event log feeds process discovery and simulation (SIMOD), so changes are tested on a calibrated model first.',
  products: ['Kara', 'Process Lab'],
  to: '/insights/business-process-simulation-simod-kara'
}];



export function Solutions() {
  const { pages } = useContent();
  return (
    <>
      <PageHero
        eyebrow="SOLUTIONS"
        title="Problems first, products second"
        lead="Four recurring problems in engineering and multi-company organisations, and the products that address each."
        crumbs={[{ label: 'Solutions' }]}
        image={pages.solutions.heroImage}
        flip={pages.solutions.heroFlip} />
      

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