'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function Logo({ compact = false }: {compact?: boolean;}) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="SIMORGH home">
      <Image
        src="/logo-mark.png"
        alt=""
        width={1536}
        height={1024}
        priority
        className="h-8 w-12 shrink-0 object-contain transition-transform duration-300 ease-sim group-hover:scale-105" />
      <span className="flex flex-col leading-none" data-no-translate>
        <span className="font-display text-[17px] font-semibold tracking-[0.2em] text-ink">SIMORGH</span>
        {!compact &&
        <span className="mt-1 font-mono text-[9px] tracking-[0.22em] text-ink-faint">
            INTELLIGENT TECHNOLOGY
          </span>
        }
      </span>
    </Link>);

}