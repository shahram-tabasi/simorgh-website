'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { PipelineStep } from '../../types/content';

interface Props {
  steps: PipelineStep[];
  label: string;
}

export function Pipeline({ steps, label }: Props) {
  const [active, setActive] = useState(0);

  return (
    <div className="border border-line bg-space-1">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="font-mono text-[10px] tracking-label text-cyan/80">{label}</span>
        <span className="font-mono text-[10px] text-ink-faint">
          STEP {String(active + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
        </span>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr]">
        <ol className="border-b border-line p-3 lg:border-b-0 lg:border-r">
          {steps.map((step, i) => {
            const isActive = i === active;
            return (
              <li key={step.label} className="relative">
                <button
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                  className="group flex w-full items-center gap-4 px-3 py-3 text-left">
                  
                  <span className="relative flex flex-col items-center self-stretch">
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rotate-45 border transition-colors duration-200 ease-sim ${
                      isActive ? 'border-cyan bg-cyan' : 'border-ink-faint/60 bg-transparent group-hover:border-blue-soft'}`
                      } />
                    
                    {i < steps.length - 1 &&
                    <span className={`mt-1 w-px flex-1 ${isActive ? 'bg-cyan/40' : 'bg-line'}`} />
                    }
                  </span>
                  <span
                    className={`font-display text-[15px] tracking-tight transition-colors duration-200 ease-sim ${
                    isActive ? 'text-cyan-soft' : 'text-ink-muted group-hover:text-ink'}`
                    }>
                    
                    {step.label}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-ink-faint/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </button>
              </li>);

          })}
        </ol>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col justify-center bg-space-0 p-8 lg:p-10">
          
          <span className="font-mono text-[10px] tracking-label text-ink-faint">
            {String(active + 1).padStart(2, '0')}
          </span>
          <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-ink">{steps[active].label}</h3>
          <p className="mt-4 text-[14.5px] leading-relaxed text-ink-muted">{steps[active].detail}</p>
        </motion.div>
      </div>
    </div>);

}