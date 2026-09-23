'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

const AUTOPLAY_MS = 3000;
const SWIPE_PX = 50;
const EASE = 'cubic-bezier(.22,.61,.36,1)';

// ── The deck ──────────────────────────────────────────────────────────────
//
// The same carousel as "Send to EPLAN" in Simorgh Soft: every card is mounted
// once and stays mounted, and only its place on the curve changes — the one
// in the middle, the one before and after turned and dimmed at the shoulders,
// the rest parked behind the centre. Nothing unmounts, so there is no fade to
// black and no wait for the next image: it is already loaded, it just moves.

/** Where a card sits relative to the active one: 0 centre, ±1 shoulders, else off-stage. */
function offsetOf(index: number, active: number) {
  const half = Math.floor(slides.length / 2);
  let offset = index - active;
  if (offset > half) offset -= slides.length;
  if (offset < -half) offset += slides.length;
  return offset;
}

function cardStyle(offset: number): React.CSSProperties {
  if (offset === 0) {
    return { transform: 'translateX(0) scale(1) rotateY(0deg)', opacity: 1, zIndex: 3 };
  }
  const side = offset < 0 ? -1 : 1;
  if (Math.abs(offset) > 1) {
    // Off-stage: parked just behind the shoulder on its own side, so coming
    // back on is a short move inwards rather than a jump across the deck.
    return { transform: `translateX(${side * 40}%) scale(0.6) rotateY(${side * -18}deg)`, opacity: 0, zIndex: 0, pointerEvents: 'none' };
  }
  return {
    transform: `translateX(${side * 62}%) scale(0.78) rotateY(${side * -18}deg)`,
    opacity: 0.45,
    zIndex: 2,
    filter: 'saturate(0.6)',
  };
}

export function ProductCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragStart = useRef<number | null>(null);
  const swiped = useRef(false);

  const show = useCallback((n: number) => setActive((n + slides.length) % slides.length), []);
  const next = useCallback(() => setActive((value) => (value + 1) % slides.length), []);
  const previous = useCallback(() => setActive((value) => (value - 1 + slides.length) % slides.length), []);

  // Restarts on every change, so a manual step gets a full interval before the next one.
  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(next, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [active, paused, next]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') previous();
    if (event.key === 'ArrowRight') next();
  };

  const onPointerDown = (event: React.PointerEvent) => { dragStart.current = event.clientX; };
  const onPointerUp = (event: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const delta = event.clientX - dragStart.current;
    dragStart.current = null;
    swiped.current = Math.abs(delta) >= SWIPE_PX;
    if (delta <= -SWIPE_PX) next();
    else if (delta >= SWIPE_PX) previous();
  };
  // A swipe ends on top of a card; it must not also count as a click on it.
  const onClickCapture = (event: React.MouseEvent) => {
    if (swiped.current) { event.preventDefault(); event.stopPropagation(); swiped.current = false; }
  };

  return (
    <section
      className="relative overflow-hidden border-y border-cyan/10 bg-[#020916]/55 py-14 lg:py-20"
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

        {/* The stage stays left-to-right in RTL locales too, so "next" always comes in from the right. */}
        <div
          dir="ltr"
          className="relative touch-pan-y select-none outline-none"
          style={{ perspective: '1600px' }}
          tabIndex={0}
          // Holds still only while the pointer is on the deck itself, so the reader can finish a card.
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { dragStart.current = null; }}
          onClickCapture={onClickCapture}
        >
          <div
            className="relative mx-auto h-[460px] w-[86%] max-w-[860px] sm:h-[420px] sm:w-[80%] lg:h-[400px] lg:w-[62%]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {slides.map((slide, index) => {
              const offset = offsetOf(index, active);
              const current = offset === 0;
              return (
                <div
                  key={slide.slug}
                  aria-hidden={!current}
                  style={{
                    ...cardStyle(offset),
                    transition: `transform .7s ${EASE}, opacity .7s ${EASE}, filter .7s ${EASE}`,
                  }}
                  className="absolute inset-0 overflow-hidden rounded-2xl border border-cyan/70 bg-space-1 shadow-[0_25px_70px_-15px_rgba(0,0,0,.8),0_0_70px_rgba(42,211,240,.13)] will-change-transform motion-reduce:!transition-none"
                >
                  <Link
                    href={`/products/${slide.slug}`}
                    tabIndex={current ? 0 : -1}
                    draggable={false}
                    onClick={(event) => {
                      // A shoulder card is a step, not a link: bring it to the centre first.
                      if (!current) { event.preventDefault(); show(index); }
                    }}
                    className="block h-full"
                  >
                    <Image
                      src={slide.image}
                      alt={slide.name}
                      fill
                      loading="eager"
                      priority={index === 0}
                      draggable={false}
                      sizes="(max-width: 1024px) 88vw, 860px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#020713]/95 via-[#020713]/65 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020713]/75 via-transparent to-transparent" />

                    <div
                      style={{ transition: `opacity .5s ${EASE} ${current ? '.2s' : '0s'}` }}
                      className={`absolute inset-y-0 left-0 flex w-full max-w-[500px] flex-col justify-center p-6 sm:p-10 lg:p-12 ${current ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <span className="font-mono text-[9px] font-medium tracking-[0.28em] text-cyan sm:text-[10px]">
                        {slide.accent}
                      </span>
                      <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:text-4xl" data-no-translate>
                        {slide.name}
                      </h2>
                      <p className="mt-2 text-base font-medium text-cyan sm:text-lg">
                        {slide.tagline}
                      </p>
                      <p className="mt-4 max-w-[430px] text-sm leading-6 text-white/75">
                        {slide.summary}
                      </p>
                      <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-cyan bg-blue/80 px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_28px_rgba(43,107,255,.35)] transition hover:bg-cyan hover:text-space-0">
                        View Details
                        <ArrowRightIcon className="h-4 w-4" />
                      </span>
                    </div>

                    {/* The shoulders carry just the name, so the deck reads at a glance. */}
                    <div
                      style={{ transition: `opacity .5s ${EASE}` }}
                      className={`absolute inset-x-0 bottom-0 hidden p-6 lg:block ${current ? 'opacity-0' : 'opacity-100'}`}
                    >
                      <div className="font-display text-xl font-semibold text-white" data-no-translate>{slide.name}</div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={previous}
            aria-label="Previous product"
            className="absolute left-0 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cyan/60 bg-space-1/90 text-cyan shadow-[0_0_30px_rgba(42,211,240,.12)] backdrop-blur transition hover:bg-cyan hover:text-space-0 lg:flex"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next product"
            className="absolute right-0 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cyan/60 bg-space-1/90 text-cyan shadow-[0_0_30px_rgba(42,211,240,.12)] backdrop-blur transition hover:bg-cyan hover:text-space-0 lg:flex"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        <div dir="ltr" className="mt-8 flex items-center justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.slug}
              type="button"
              aria-label={slide.name}
              title={slide.name}
              aria-current={index === active}
              onClick={() => show(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${index === active ? 'w-7 bg-cyan shadow-[0_0_15px_rgba(42,211,240,.6)]' : 'w-2.5 bg-white/25 hover:bg-white/50'}`}
            />
          ))}
        </div>

        <div dir="ltr" className="mt-6 flex items-center justify-center gap-3 lg:hidden">
          <button type="button" onClick={previous} className="rounded-full border border-line p-2 text-cyan" aria-label="Previous product"><ChevronLeftIcon className="h-5 w-5" /></button>
          <span className="font-mono text-[10px] tracking-[0.25em] text-ink-faint">{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
          <button type="button" onClick={next} className="rounded-full border border-line p-2 text-cyan" aria-label="Next product"><ChevronRightIcon className="h-5 w-5" /></button>
        </div>
      </div>
    </section>
  );
}
