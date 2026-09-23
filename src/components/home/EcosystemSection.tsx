'use client';

import React, { useState } from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal } from '../ui/Reveal';
import { Icon } from '../ui/Icon';
import { ecosystem } from '../../data/site';

const radius = 38;

function polar(i: number, total: number) {
  const angle = i / total * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + radius * Math.cos(angle), y: 50 + radius * 0.82 * Math.sin(angle) };
}

export function EcosystemSection() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="relative w-full border-t border-line bg-space-1" aria-label="Technology ecosystem">
      <div className="absolute inset-0 sim-grid-lines opacity-40" aria-hidden="true" />
      <div className="relative mx-auto max-w-shell px-5 py-24 lg:px-10 lg:py-32">
        <Reveal>
          <SectionHeader
            index="03 / TECHNOLOGY ECOSYSTEM"
            title="One Intelligence Layer. Multiple Worlds."
            lead="The same models, knowledge graph and governance run beneath every domain SIMORGH operates in. A capability built for the grid becomes available to the factory floor." />
          
        </Reveal>

        {/* Radial diagram — desktop */}
        <div className="relative mt-20 hidden aspect-[16/8] w-full lg:block">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true">
            {ecosystem.map((_, i) => {
              const p = polar(i, ecosystem.length);
              const isOn = active === i;
              return (
                <line
                  key={i}
                  x1="50"
                  y1="25"
                  x2={p.x}
                  y2={p.y / 100 * 50}
                  stroke={isOn ? '#2ad3f0' : 'rgba(120,160,255,0.22)'}
                  strokeWidth={isOn ? 0.35 : 0.2}
                  className={isOn ? '' : 'sim-dash'}
                  vectorEffect="non-scaling-stroke" />);


            })}
          </svg>

          <div className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-cyan/30 bg-space-0">
            <div
              className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(42,211,240,0.22),transparent_70%)]"
              style={{ animation: 'sim-breathe 6s ease-in-out infinite' }}
              data-motion />
            
            <span className="relative font-display text-lg font-semibold tracking-[0.2em] text-ink">SIMORGH</span>
            <span className="relative mt-1.5 font-mono text-[9.5px] tracking-label text-cyan/80">CORE AI</span>
          </div>

          {ecosystem.map((node, i) => {
            const p = polar(i, ecosystem.length);
            const isOn = active === i;
            return (
              <button
                key={node.key}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className={`absolute w-60 -translate-x-1/2 -translate-y-1/2 border p-4 text-left transition-[border-color,background-color,transform] duration-200 ease-sim ${
                isOn ? 'border-cyan/60 bg-space-0' : 'border-line bg-space-0/90'}`
                }>
                
                <div className="flex items-center justify-between">
                  <Icon name={node.icon} className={`h-5 w-5 ${isOn ? 'text-cyan' : 'text-blue-soft'}`} />
                  <span className="font-mono text-[9.5px] tracking-label text-ink-faint">{node.code}</span>
                </div>
                <div className="mt-3 font-display text-[15px] tracking-tight text-ink">{node.title}</div>
                <p className="mt-2 text-[12.5px] leading-snug text-ink-faint">{node.body}</p>
              </button>);

          })}
        </div>

        {/* Stacked — mobile / tablet */}
        <ul className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:hidden">
          {ecosystem.map((node) =>
          <li key={node.key} className="flex flex-col bg-space-1 p-6">
              <div className="flex items-center justify-between">
                <Icon name={node.icon} className="h-5 w-5 text-cyan" />
                <span className="font-mono text-[9.5px] tracking-label text-ink-faint">{node.code}</span>
              </div>
              <div className="mt-4 font-display text-base tracking-tight text-ink">{node.title}</div>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-faint">{node.body}</p>
            </li>
          )}
        </ul>
      </div>
    </section>);

}