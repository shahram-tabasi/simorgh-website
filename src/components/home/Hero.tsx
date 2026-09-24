'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Starfield } from '../ui/Starfield';
import { activeHero } from '../../data/hero';
import { useI18n } from '../../i18n';

export function Hero() {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '9%']);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.06]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduced ? 1 : 0]);

  const { t } = useI18n();
  const slide = activeHero;
  const { media } = slide;

  return (
    <section ref={ref} className="relative min-h-[100svh] w-full overflow-hidden bg-space-0" aria-label="SIMORGH" data-no-simorgh>
      {/* Media layer — mobile gets its own composition band, desktop is full bleed 16:9 */}
      <motion.div
        style={{ y: mediaY, scale: mediaScale }}
        className="absolute inset-x-0 top-0 h-[62svh] lg:inset-0 lg:h-full">
        
        {media.type === 'video' ?
        <video
          className="h-full w-full object-cover"
          style={{ objectPosition: media.focal }}
          autoPlay
          muted
          loop
          playsInline
          poster={media.desktop}>
          
            {media.videoWebm && <source src={media.videoWebm} type="video/webm" />}
            {media.videoMp4 && <source src={media.videoMp4} type="video/mp4" />}
          </video> :

        <picture>
            <source media="(min-width: 1024px)" srcSet={media.desktop} />
            <source media="(min-width: 640px)" srcSet={media.tablet} />
            <img
            src={media.mobile}
            alt="A luminous Simorgh formed of light and data rising between a human and an artificial intelligence above a digital Earth"
            className="h-full w-full object-cover"
            style={{ objectPosition: media.focal }}
            fetchPriority="high" />
          
          </picture>
        }
      </motion.div>

      <Starfield className="lg:opacity-70" />

      {/* Scrims: vertical on mobile, directional on desktop so the Simorgh stays uncovered */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-space-0 via-space-0/70 to-transparent lg:bg-gradient-to-r lg:from-space-0 lg:via-space-0/55 lg:to-transparent"
        style={{ opacity: slide.overlay + 0.35 }} />
      
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-space-0 to-transparent" />
      <div className="pointer-events-none absolute inset-0 hidden lg:block lg:bg-[radial-gradient(60%_50%_at_58%_45%,rgba(42,211,240,0.10),transparent_70%)]" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-shell flex-col items-center justify-end px-5 pb-16 pt-28 text-center lg:justify-center lg:px-10 lg:pb-0">
        <motion.div style={{ opacity: copyOpacity }} className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex items-center justify-center gap-3">
            
            <span className="h-px w-8 bg-cyan" />
            <span className="font-mono text-[10.5px] tracking-label text-cyan">{t.hero.eyebrow}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.06, ease: [0.23, 1, 0.32, 1] }}
            className="mt-6 font-display text-[40px] font-semibold leading-[1.03] tracking-tight text-white sm:text-[54px] lg:text-[68px]">
            
            {t.hero.headline}
            <span className="block text-transparent [-webkit-background-clip:text] [background-clip:text] [background-image:linear-gradient(92deg,#7ce6f7,#5c8dff_55%,#a48bff)]">
              {t.hero.accent}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.12, ease: [0.23, 1, 0.32, 1] }}
            className="mx-auto mt-7 max-w-2xl text-[15px] leading-relaxed text-ink-muted sm:text-[17px]">
            
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:items-center">
            
            <Button to={slide.primaryCta.to} size="lg">
              {t.hero.primary}
              <ArrowRightIcon className="h-4 w-4" strokeWidth={1.6} />
            </Button>
            <Button to={slide.secondaryCta.to} size="lg" variant="outline">
              {t.hero.secondary}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.26 }}
            className="mt-12 font-mono text-[10.5px] tracking-label text-ink-faint">
            
            {t.hero.kicker}
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px sim-hairline" />
    </section>);

}