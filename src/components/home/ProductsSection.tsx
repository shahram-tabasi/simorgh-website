'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal } from '../ui/Reveal';
import { Icon } from '../ui/Icon';
import { useContent } from '../../content/ContentProvider';

export function ProductsSection() {
  const { products } = useContent();
  const featured = products.filter((p) => p.featured);
  const rest = products.filter((p) => !p.featured);

  return (
    <section className="relative w-full border-t border-line bg-space-0" aria-label="Products">
      <div className="mx-auto max-w-shell px-5 py-24 lg:px-10 lg:py-32">
        <Reveal>
          <SectionHeader
            index="04 / PRODUCTS"
            title="A product ecosystem, not a software catalogue"
            lead="Seven products sharing one intelligence layer. Each solves a specific engineering or operational problem; together they carry a project from documentation to decision." />
          
        </Reveal>

        {/* Core → featured connectors */}
        <div className="mt-20">
          <div className="flex flex-col items-center">
            <span className="border border-cyan/40 bg-space-1 px-4 py-2 font-mono text-[10px] tracking-label text-cyan">
              SIMORGH AI
            </span>
            <svg className="h-12 w-full max-w-4xl" viewBox="0 0 800 48" aria-hidden="true" preserveAspectRatio="none">
              <path
                d="M400 0 V20 M133 48 V28 H667 V48 M400 20 V28"
                fill="none"
                stroke="rgba(120,160,255,0.28)"
                strokeWidth="1" />
              
              <path d="M133 28 H667" fill="none" stroke="#2ad3f0" strokeWidth="1" className="sim-dash" opacity="0.8" />
            </svg>
          </div>

          <div className="grid gap-px bg-line lg:grid-cols-3">
            {featured.map((p) =>
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              className="group flex flex-col bg-space-1 p-8 transition-colors duration-200 ease-sim hover:bg-space-2 lg:p-10">
              
                <div className="flex items-center justify-between">
                  <Icon name={p.icon} className="h-6 w-6 text-cyan" />
                  <span className="font-mono text-[9.5px] tracking-label text-ink-faint">
                    {p.domain.toUpperCase()}
                  </span>
                </div>
                <h3 className="mt-8 font-display text-xl font-semibold tracking-tight text-ink lg:text-[22px]">
                  {p.name}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{p.tagline}</p>
                <p className="mt-5 text-[13px] leading-relaxed text-ink-faint">{p.summary.split('. ')[0]}.</p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-8">
                  {p.industries.slice(0, 3).map((ind) =>
                <span key={ind} className="border border-line px-2 py-1 font-mono text-[9.5px] text-ink-faint">
                      {ind}
                    </span>
                )}
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-[13px] text-cyan-soft">
                  Explore product
                  <ArrowRightIcon
                  className="h-3.5 w-3.5 transition-transform duration-200 ease-sim group-hover:translate-x-1"
                  strokeWidth={1.6} />
                
                </span>
              </Link>
            )}
          </div>

          <div className="mx-auto h-10 w-px bg-line" />

          <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {rest.map((p) =>
            <li key={p.slug} className="bg-space-1">
                <Link
                href={`/products/${p.slug}`}
                className="group flex h-full flex-col p-6 transition-colors duration-200 ease-sim hover:bg-space-2">
                
                  <Icon name={p.icon} className="h-5 w-5 text-blue-soft transition-colors duration-200 ease-sim group-hover:text-cyan" />
                  <h3 className="mt-6 font-display text-[15px] font-semibold tracking-tight text-ink">{p.name}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-faint">{p.tagline}</p>
                  <span className="mt-auto pt-6 font-mono text-[10px] tracking-label text-ink-faint transition-colors duration-200 ease-sim group-hover:text-cyan">
                    VIEW →
                  </span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>);

}