'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal } from '../ui/Reveal';
import { intelligenceChain, REF_IMAGE_NEURAL } from '../../data/site';

export function IntelligenceSection() {
  const [active, setActive] = useState(1);

  return (
    <section className="relative w-full overflow-hidden border-t border-line bg-space-0" aria-label="SIMORGH intelligence">
      <div className="absolute inset-0">
        <img
          src={REF_IMAGE_NEURAL}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-45"
          loading="lazy" />
        
        <div className="absolute inset-0 bg-gradient-to-b from-space-0 via-space-0/80 to-space-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-space-0 via-space-0/40 to-space-0/85" />
      </div>

      <div className="relative mx-auto grid max-w-shell gap-14 px-5 py-24 lg:grid-cols-[1fr_1.05fr] lg:gap-20 lg:px-10 lg:py-32">
        <div>
          <Reveal>
            <SectionHeader
              index="02 / SIMORGH INTELLIGENCE"
              title="Intelligence Beyond Software"
              lead="SIMORGH connects artificial intelligence, engineering knowledge, industrial systems and real-world infrastructure into intelligent software platforms." />
            
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mt-8 max-w-lg text-[15px] leading-relaxed text-ink-faint">
              A model that reads a specification is not engineering. The value appears only when extraction, domain
              knowledge, a bound model of the physical system and a defensible decision path exist in one continuous
              chain — which is what the platform is.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-8">
              {[
              { v: '7', l: 'Platform products' },
              { v: '9', l: 'Industries served' },
              { v: '10', l: 'Interface languages' }].
              map((s) =>
              <div key={s.l}>
                  <dt className="font-display text-3xl font-semibold text-ink">{s.v}</dt>
                  <dd className="mt-2 text-[12.5px] leading-snug text-ink-faint">{s.l}</dd>
                </div>
              )}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.08} className="relative">
          <div className="border border-line bg-space-1/70 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <span className="font-mono text-[10px] tracking-label text-cyan/80">INTELLIGENCE CHAIN</span>
              <span className="font-mono text-[10px] text-ink-faint">
                {String(active + 1).padStart(2, '0')} / {String(intelligenceChain.length).padStart(2, '0')}
              </span>
            </div>

            <ul className="p-2 sm:p-3">
              {intelligenceChain.map((step, i) => {
                const isActive = i === active;
                return (
                  <li key={step.label}>
                    <button
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={() => setActive(i)}
                      aria-expanded={isActive}
                      className="group relative flex w-full items-start gap-4 px-3 py-3 text-left">
                      
                      <span className="mt-1 flex flex-col items-center">
                        <span
                          className={`h-2 w-2 rotate-45 transition-colors duration-200 ease-sim ${
                          isActive ? 'bg-cyan' : 'bg-ink-faint/50 group-hover:bg-blue-soft'}`
                          } />
                        
                        {i < intelligenceChain.length - 1 &&
                        <span className={`mt-1 h-7 w-px ${isActive ? 'bg-cyan/50' : 'bg-line'}`} />
                        }
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block font-display text-[15px] tracking-tight transition-colors duration-200 ease-sim ${
                          isActive ? 'text-cyan-soft' : 'text-ink-muted group-hover:text-ink'}`
                          }>
                          
                          {step.label}
                        </span>
                        <motion.span
                          initial={false}
                          animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                          className="block overflow-hidden text-[13px] leading-relaxed text-ink-faint">
                          
                          <span className="block pt-1.5">{step.detail}</span>
                        </motion.span>
                      </span>
                      <span className="mt-0.5 font-mono text-[10px] text-ink-faint/70">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </button>
                  </li>);

              })}
            </ul>
          </div>

          <div className="pointer-events-none absolute -inset-x-6 -bottom-6 -top-6 -z-10 bg-[radial-gradient(60%_50%_at_50%_50%,rgba(43,107,255,0.14),transparent_70%)]" />
        </Reveal>
      </div>
    </section>);

}