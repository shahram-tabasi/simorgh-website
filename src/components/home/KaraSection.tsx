'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal } from '../ui/Reveal';
import { Button } from '../ui/Button';
import { Starfield } from '../ui/Starfield';
import { REF_IMAGE_PLANET } from '../../data/site';
import { useContent } from '../../content/ContentProvider';

export function KaraSection() {
  const { products } = useContent();
  const kara = products.find((p) => p.slug === 'simorgh-kara');
  const layers = kara?.pipeline ?? [];
  const [active, setActive] = useState(layers.length - 1);

  return (
    <section className="relative w-full overflow-hidden border-t border-line bg-space-0" aria-label="Simorgh Kara">
      <div className="absolute inset-x-0 bottom-0 h-[60%]">
        <img src={REF_IMAGE_PLANET} alt="" aria-hidden="true" loading="lazy" className="h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-space-0 via-space-0/70 to-space-0" />
      </div>
      <Starfield className="opacity-60" />

      <div className="relative mx-auto max-w-shell px-5 py-24 lg:px-10 lg:py-32">
        <Reveal>
          <SectionHeader
            index="05 / SIMORGH KARA"
            title="One organisation, many companies, one screen"
            lead="Kara binds people, work, business records, documents and conversations of a multi-company organisation into one platform, with the ERP running quietly behind it." />
          
        </Reveal>

        <div className="mt-16 grid gap-px border border-line bg-line lg:grid-cols-[1.25fr_1fr]">
          <ol className="bg-space-1/85 p-3 backdrop-blur-sm sm:p-4">
            {layers.map((layer, i) => {
              const isActive = i === active;
              const depth = (i + 1) / layers.length;
              return (
                <li key={layer.label}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-pressed={isActive}
                    className="group flex w-full items-center gap-4 px-3 py-2.5 text-left">
                    
                    <span className="w-7 shrink-0 font-mono text-[10px] text-ink-faint/80">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="relative h-8 flex-1 overflow-hidden border border-line/70">
                      <motion.span
                        initial={false}
                        animate={{ width: `${18 + depth * 82}%`, opacity: isActive ? 1 : 0.5 }}
                        transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                        className={`absolute inset-y-0 left-0 ${isActive ? 'bg-cyan/25' : 'bg-blue/18'}`} />
                      
                      <span
                        className={`relative flex h-full items-center px-3 font-display text-[13.5px] tracking-tight transition-colors duration-200 ease-sim ${
                        isActive ? 'text-cyan-soft' : 'text-ink-muted group-hover:text-ink'}`
                        }>
                        
                        {layer.label}
                      </span>
                    </span>
                  </button>
                </li>);

            })}
          </ol>

          <div className="flex flex-col justify-between bg-space-0/85 p-8 backdrop-blur-sm lg:p-10">
            <div>
              <span className="font-mono text-[10px] tracking-label text-cyan/80">LAYER DETAIL</span>
              <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-ink">
                {layers[active]?.label}
              </h3>
              <p className="mt-4 text-[14.5px] leading-relaxed text-ink-muted">{layers[active]?.detail}</p>
              <p className="mt-8 border-t border-line pt-6 text-[13px] leading-relaxed text-ink-faint">
                Every layer runs on your own servers: single sign-on, an event bus between the ERP and the
                work queues, and documented interfaces for whatever comes next.
              </p>
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button to="/products/simorgh-kara">Explore Simorgh Kara</Button>
              <Button to="/request-demo" variant="outline">
                Request a Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>);

}