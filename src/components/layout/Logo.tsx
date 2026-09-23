'use client';

import React from 'react';
import Link from 'next/link';

export function Logo({ compact = false }: {compact?: boolean;}) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="SIMORGH home">
      <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" aria-hidden="true">
        <path
          d="M16 4 L28 12 L16 28 L4 12 Z"
          fill="none"
          stroke="url(#simorgh-mark)"
          strokeWidth="1.2" />
        
        <path d="M6 13 Q16 19 26 13" fill="none" stroke="#2ad3f0" strokeWidth="1.1" opacity="0.9" />
        <path d="M9 10 Q16 15 23 10" fill="none" stroke="#7c5cff" strokeWidth="1" opacity="0.7" />
        <circle cx="16" cy="20.5" r="1.4" fill="#e8b65a" />
        <defs>
          <linearGradient id="simorgh-mark" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0%" stopColor="#2b6bff" />
            <stop offset="100%" stopColor="#2ad3f0" />
          </linearGradient>
        </defs>
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-semibold tracking-[0.2em] text-ink">SIMORGH</span>
        {!compact &&
        <span className="mt-1 font-mono text-[9px] tracking-[0.22em] text-ink-faint">
            INTELLIGENT TECHNOLOGY
          </span>
        }
      </span>
    </Link>);

}