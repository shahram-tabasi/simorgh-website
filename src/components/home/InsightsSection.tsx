'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon, PlayIcon, FileTextIcon } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal } from '../ui/Reveal';
import { useContent } from '../../content/ContentProvider';

export function InsightsSection() {
  const { articles: insights } = useContent();
  const [lead, ...others] = insights.slice(0, 4);
  if (!lead) return null;

  return (
    <section className="relative w-full border-t border-line bg-space-1" aria-label="Insights">
      <div className="mx-auto max-w-shell px-5 py-24 lg:px-10 lg:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <SectionHeader
              index="09 / INSIGHTS"
              title="Engineering knowledge, published"
              lead="Technical articles, case studies and recorded walkthroughs from the teams building the platform." />
            
          </Reveal>
          <Reveal delay={0.05}>
            <Link href="/insights" className="group inline-flex items-center gap-2 text-[13.5px] text-cyan-soft">
              All insights
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 ease-sim group-hover:translate-x-1" strokeWidth={1.6} />
            </Link>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-px border border-line bg-line lg:grid-cols-[1.3fr_1fr]">
          <Link href={`/insights/${lead.slug}`} className="group flex flex-col justify-between bg-space-0 p-8 lg:p-12">
            <div>
              <span className="font-mono text-[10px] tracking-label text-cyan/80">
                {lead.kind.toUpperCase()} · {lead.category.toUpperCase()}
              </span>
              <h3 className="mt-6 max-w-xl font-display text-2xl font-semibold leading-snug tracking-tight text-ink transition-colors duration-200 ease-sim group-hover:text-cyan-soft lg:text-[30px]">
                {lead.title}
              </h3>
              <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-ink-muted">{lead.excerpt}</p>
            </div>
            <div className="mt-10 flex items-center gap-4 font-mono text-[10.5px] text-ink-faint">
              <span>{lead.date}</span>
              <span className="h-px w-6 bg-line" />
              <span>{lead.readTime}</span>
            </div>
          </Link>

          <ul className="flex flex-col bg-space-1">
            {others.map((item) =>
            <li key={item.slug} className="border-b border-line last:border-b-0">
                <Link href={`/insights/${item.slug}`} className="group flex gap-4 p-6 transition-colors duration-200 ease-sim hover:bg-space-2">
                  <span className="mt-0.5 text-ink-faint">
                    {item.kind === 'Video' ?
                  <PlayIcon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> :

                  <FileTextIcon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  }
                  </span>
                  <span className="min-w-0">
                    <span className="font-mono text-[9.5px] tracking-label text-ink-faint">
                      {item.kind.toUpperCase()} · {item.readTime}
                    </span>
                    <span className="mt-2 block font-display text-[15px] leading-snug tracking-tight text-ink transition-colors duration-200 ease-sim group-hover:text-cyan-soft">
                      {item.title}
                    </span>
                  </span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>);

}