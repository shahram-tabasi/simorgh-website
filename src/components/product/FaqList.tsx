'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, MinusIcon } from 'lucide-react';

interface Props {
  items: {q: string;a: string;}[];
}

export function FaqList({ items }: Props) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-line">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 py-6 text-left">
              
              <span className="font-display text-[16px] tracking-tight text-ink lg:text-[18px]">{item.q}</span>
              <span className="shrink-0 text-cyan">
                {isOpen ? <MinusIcon className="h-4 w-4" strokeWidth={1.6} /> : <PlusIcon className="h-4 w-4" strokeWidth={1.6} />}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen &&
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden">
                
                  <p className="max-w-3xl pb-7 text-[14.5px] leading-relaxed text-ink-muted">{item.a}</p>
                </motion.div>
              }
            </AnimatePresence>
          </div>);

      })}
    </div>);

}