'use client';

import React from 'react';

interface Props {
  index?: string;
  title: string;
  lead?: string;
  align?: 'left' | 'center';
  className?: string;
  children?: React.ReactNode;
}

export function SectionHeader({ index, title, lead, align = 'left', className = '', children }: Props) {
  const centered = align === 'center';
  return (
    <div className={`${centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'} ${className}`}>
      {index &&
      <div className={`mb-5 flex items-center gap-3 font-mono text-[11px] text-cyan/80 ${centered ? 'justify-center' : ''}`}>
          <span>{index}</span>
          <span className="h-px w-10 bg-cyan/30" />
        </div>
      }
      <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-4xl lg:text-[44px]">
        {title}
      </h2>
      {lead && <p className="mt-5 text-base leading-relaxed text-ink-muted lg:text-[17px]">{lead}</p>}
      {children}
    </div>);

}