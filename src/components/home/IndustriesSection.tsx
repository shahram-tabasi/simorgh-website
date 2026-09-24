'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal } from '../ui/Reveal';
import { Icon } from '../ui/Icon';
import { useContent } from '../../content/ContentProvider';

export function IndustriesSection() {
  const { industries } = useContent();
  const shortlist = industries.slice(0, 6);
  const [active, setActive] = useState(0);
  const current = shortlist[active];

  return (
    <section className="relative w-full border-t border-line bg-space-1" aria-label="Industries">
      <div className="mx-auto max-w-shell px-5 py-24 lg:px-10 lg:py-32">
        <Reveal>
          <SectionHeader
            index="05 / INDUSTRIES"
            title="Intelligence for Real-World Systems"
            lead="Every deployment is bound to physical assets, regulatory reality and an operations team that has to defend its decisions." />
          
        </Reveal>

        <div className="mt-16 grid gap-px border border-line bg-line lg:grid-cols-[minmax(240px,1fr)_1.7fr]">
          <ul className="flex flex-col bg-space-1">
            {shortlist.map((ind, i) =>
            <li key={ind.slug}>
                <button
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                className={`flex w-full items-center gap-3 border-b border-line px-6 py-5 text-left transition-colors duration-200 ease-sim ${
                i === active ? 'bg-space-2 text-ink' : 'text-ink-muted hover:text-ink'}`
                }>
                
                  <Icon name={ind.icon} className={`h-4 w-4 ${i === active ? 'text-cyan' : 'text-ink-faint'}`} />
                  <span className="text-[14px]">{ind.name}</span>
                </button>
              </li>
            )}
          </ul>

          <div className="relative bg-space-0 p-8 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
                
                <h3 className="font-display text-2xl font-semibold tracking-tight text-ink lg:text-[28px]">
                  {current.lead}
                </h3>
                <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-muted">{current.body}</p>

                <div className="mt-9 flex flex-wrap gap-1.5">
                  {current.systems.map((s) =>
                  <span key={s} className="border border-line px-2.5 py-1.5 font-mono text-[10px] text-ink-faint">
                      {s}
                    </span>
                  )}
                </div>

                <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-8">
                  {current.outcomes.map((o) =>
                  <div key={o.label}>
                      <dt className="font-display text-2xl font-semibold text-cyan-soft">{o.value}</dt>
                      <dd className="mt-2 text-[12.5px] leading-snug text-ink-faint">{o.label}</dd>
                    </div>
                  )}
                </dl>

                <Link
                  href={`/industries/${current.slug}`}
                  className="group mt-10 inline-flex items-center gap-2 text-[13.5px] text-cyan-soft">
                  
                  {`${current.name} in detail`}
                  <ArrowRightIcon
                    className="h-3.5 w-3.5 transition-transform duration-200 ease-sim group-hover:translate-x-1"
                    strokeWidth={1.6} />
                  
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>);

}