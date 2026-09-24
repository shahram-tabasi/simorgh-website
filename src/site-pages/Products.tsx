'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { Icon } from '../components/ui/Icon';
import { Reveal } from '../components/ui/Reveal';
import { useContent } from '../content/ContentProvider';
import { ProductCarousel } from '../components/product/ProductCarousel';

export function Products() {
  const { products } = useContent();
  return (
    <>
      <ProductCarousel />

      <section className="bg-space-0">
        <div className="mx-auto max-w-shell px-5 py-16 lg:px-10 lg:py-20">
          <div className="mb-8 flex flex-col gap-3 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-cyan">FULL PRODUCT ECOSYSTEM</div>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Every product, one intelligence layer.</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-ink-faint">
              Select any product to open its complete capabilities, engineering pipeline, metrics and technical FAQ.
            </p>
          </div>

          <div className="grid gap-px border border-line bg-line">
            {products.map((p, i) => (
              <Reveal key={p.slug} delay={Math.min(i * 0.04, 0.2)}>
                <Link
                  href={`/products/${p.slug}`}
                  className="group grid gap-6 bg-space-1 p-7 transition-colors duration-200 ease-sim hover:bg-space-2 lg:grid-cols-[280px_1fr_auto] lg:items-start lg:gap-12 lg:p-9"
                >
                  <div className="flex items-start gap-4">
                    <Icon name={p.icon} className="mt-1 h-6 w-6 shrink-0 text-cyan" />
                    <div>
                      <h3 className="font-display text-lg font-semibold tracking-tight text-ink">{p.name}</h3>
                      <div className="mt-2 font-mono text-[9.5px] tracking-label text-ink-faint">{p.domain.toUpperCase()}</div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[15px] leading-relaxed text-ink-muted">{p.tagline}</p>
                    <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-ink-faint">{p.summary}</p>
                    <div className="mt-6 flex flex-wrap gap-1.5">
                      {p.industries.map((ind) => (
                        <span key={ind} className="border border-line px-2 py-1 font-mono text-[9.5px] text-ink-faint">{ind}</span>
                      ))}
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-2 whitespace-nowrap text-[13px] text-cyan-soft">
                    View Product
                    <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 ease-sim group-hover:translate-x-1" strokeWidth={1.6} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
