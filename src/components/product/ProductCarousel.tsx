'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import type { Product } from '../../types/content';
import { products } from '../../data/products';

type ProductSlide = Product & { image: string; accent: string };

const slideMeta: Record<string, { image: string; accent: string }> = {
  'simorgh-design-suite': { image: '/product-design-suite.png', accent: 'ELECTRICAL ENGINEERING & AUTOMATION' },
  'simorgh-grid': { image: '/product-grid.jpg', accent: 'SMART GRID & ENERGY INTELLIGENCE' },
  'simorgh-digital-twin': { image: '/product-twin.png', accent: 'SMART MONITORING & DIGITAL TWIN' },
  'simorgh-kara': { image: '/4.png', accent: 'WORKFORCE & INDUSTRIAL SAFETY' },
  'simorgh-shop': { image: '/33.jpg', accent: 'PROJECT & BUSINESS MANAGEMENT' },
  'simorgh-draw': { image: '/3.jpg', accent: 'INTELLIGENT ENGINEERING DRAWING' },
  'simorgh-cloud': { image: '/2.jpg', accent: 'AI & INFRASTRUCTURE' },
};

const slides: ProductSlide[] = ['simorgh-design-suite', 'simorgh-grid', 'simorgh-digital-twin', 'simorgh-kara', 'simorgh-shop', 'simorgh-draw', 'simorgh-cloud']
  .map((slug) => {
    const product = products.find((item) => item.slug === slug);
    if (!product) throw new Error(`Missing product: ${slug}`);
    return { ...product, ...slideMeta[slug] };
  });

function indexAround(active: number, offset: number) {
  return (active + offset + slides.length) % slides.length;
}

export function ProductCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setActive((value) => indexAround(value, 1)), []);
  const previous = useCallback(() => setActive((value) => indexAround(value, -1)), []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(next, 6000);
    return () => window.clearInterval(timer);
  }, [next, paused]);

  const positions = useMemo(() => ({
    previous: slides[indexAround(active, -1)],
    current: slides[active],
    next: slides[indexAround(active, 1)],
  }), [active]);

  return (
    <section
      className="relative overflow-hidden border-y border-cyan/10 bg-[#020916] py-14 lg:py-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Product showcase"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/10 blur-[120px]" />
        <div className="sim-grid-lines absolute inset-0 opacity-25" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto mb-9 max-w-3xl text-center lg:mb-12">
          <div className="mb-4 inline-flex items-center gap-4 font-mono text-[10px] font-medium tracking-[0.35em] text-cyan">
            <span className="h-px w-12 bg-cyan/60" />
            OUR PRODUCTS
            <span className="h-px w-12 bg-cyan/60" />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Intelligent Solutions for a <span className="text-cyan">Smarter Industry</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">
            From electrical design to digital twin, our products help you build, monitor and optimize industrial infrastructure with confidence.
          </p>
        </div>

        <div className="relative h-[440px] sm:h-[500px] lg:h-[430px]">
          {/* Desktop side cards */}
          <button
            type="button"
            onClick={previous}
            aria-label="Previous product"
            className="absolute left-0 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cyan/60 bg-space-1/90 text-cyan shadow-[0_0_30px_rgba(42,211,240,.12)] transition hover:bg-cyan hover:text-space-0 lg:flex"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next product"
            className="absolute right-0 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cyan/60 bg-space-1/90 text-cyan shadow-[0_0_30px_rgba(42,211,240,.12)] transition hover:bg-cyan hover:text-space-0 lg:flex"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          <div className="absolute inset-0 flex items-center justify-center">
            <SideCard slide={positions.previous} side="left" />
            <SideCard slide={positions.next} side="right" />

            <AnimatePresence mode="wait">
              <motion.div
                key={positions.current.slug}
                initial={{ opacity: 0, scale: .97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: .985, y: -8 }}
                transition={{ duration: .45, ease: [0.23, 1, 0.32, 1] }}
                className="relative z-20 h-[370px] w-full max-w-[860px] overflow-hidden rounded-2xl border border-cyan/70 bg-space-1 shadow-[0_0_70px_rgba(42,211,240,.13)] sm:h-[420px] lg:h-[360px]"
              >
                <Link href={`/products/${positions.current.slug}`} className="block h-full">
                  <Image
                    src={positions.current.image}
                    alt={positions.current.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 92vw, 860px"
                    className="object-cover transition-transform duration-700 hover:scale-[1.015]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#020713]/95 via-[#020713]/65 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020713]/75 via-transparent to-transparent" />

                  <div className="absolute inset-y-0 left-0 flex w-full max-w-[500px] flex-col justify-center p-7 sm:p-10 lg:p-12">
                    <span className="font-mono text-[9px] font-medium tracking-[0.28em] text-cyan sm:text-[10px]">
                      {positions.current.accent}
                    </span>
                    <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                      {positions.current.name}
                    </h2>
                    <p className="mt-2 text-base font-medium text-cyan sm:text-lg">
                      {positions.current.tagline}
                    </p>
                    <p className="mt-4 max-w-[430px] text-sm leading-6 text-white/75">
                      {positions.current.summary}
                    </p>
                    <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-cyan bg-blue/80 px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_28px_rgba(43,107,255,.35)] transition hover:bg-cyan hover:text-space-0">
                      View Details
                      <ArrowRightIcon className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.slug}
              type="button"
              aria-label={`Show ${slide.name}`}
              aria-current={index === active}
              onClick={() => setActive(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${index === active ? 'w-7 bg-cyan shadow-[0_0_15px_rgba(42,211,240,.6)]' : 'w-2.5 bg-white/25 hover:bg-white/50'}`}
            />
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 lg:hidden">
          <button type="button" onClick={previous} className="rounded-full border border-line p-2 text-cyan" aria-label="Previous product"><ChevronLeftIcon className="h-5 w-5" /></button>
          <span className="font-mono text-[10px] tracking-[0.25em] text-ink-faint">{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
          <button type="button" onClick={next} className="rounded-full border border-line p-2 text-cyan" aria-label="Next product"><ChevronRightIcon className="h-5 w-5" /></button>
        </div>
      </div>
    </section>
  );
}

function SideCard({ slide, side }: { slide: ProductSlide; side: 'left' | 'right' }) {
  return (
    <Link
      href={`/products/${slide.slug}`}
      className={`absolute top-1/2 z-10 hidden h-[290px] w-[330px] -translate-y-1/2 overflow-hidden rounded-xl border border-cyan/35 bg-space-1 text-left transition hover:border-cyan lg:block ${side === 'left' ? 'left-[4%]' : 'right-[4%]'}`}
      aria-label={`Open ${slide.name}`}
    >
      <Image src={slide.image} alt="" fill sizes="330px" className="object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020713] via-[#020713]/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <div className="font-mono text-[9px] tracking-[0.25em] text-cyan">{slide.domain.toUpperCase()}</div>
        <div className="mt-2 font-display text-xl font-semibold text-white">{slide.name}</div>
        <div className="mt-3 inline-flex items-center gap-2 text-xs text-cyan-soft">View Details <ArrowRightIcon className="h-3.5 w-3.5" /></div>
      </div>
    </Link>
  );
}
