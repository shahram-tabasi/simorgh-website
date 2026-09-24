'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal } from '../ui/Reveal';
import { Button } from '../ui/Button';
import { Starfield } from '../ui/Starfield';
import { REF_IMAGE_PLANET } from '../../data/site';
import { useContent } from '../../content/ContentProvider';

export function DigitalTwinSection() {
  const { products } = useContent();
  const twin = products.find((p) => p.slug === 'simorgh-digital-twin');
  const layers = twin?.pipeline ?? [];
  const [active, setActive] = useState(layers.length - 1);

  return (
    <section className="relative w-full overflow-hidden border-t border-line bg-space-0" aria-label="Digital twin">
      <div className="absolute inset-x-0 bottom-0 h-[60%]">
        <img src={REF_IMAGE_PLANET} alt="" aria-hidden="true" loading="lazy" className="h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-space-0 via-space-0/70 to-space-0" />
      </div>
      <Starfield className="opacity-60" />

      <div className="relative mx-auto max-w-shell px-5 py-24 lg:px-10 lg:py-32">
        <Reveal>
          <SectionHeader
            index="06 / DIGITAL TWIN"
            title="The model of the real system, queryable about the future"
            lead="Nine layers bind a city or an industrial site into one environment: spatial data, physical assets, live telemetry, learned behaviour and the feedback dynamics that connect them." />
          
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
                Integration boundaries are defined, not simulated: IoT brokers, streaming pipelines, GIS servers,
                knowledge graphs and external twin engines each connect through a documented interface.
              </p>
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button to="/products/simorgh-digital-twin">Explore Digital Twin</Button>
              <Button to="/request-demo" variant="outline">
                Request a Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>);

}