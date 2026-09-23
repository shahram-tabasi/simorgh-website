'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';
import { Starfield } from './Starfield';

interface Crumb {
  label: string;
  to?: string;
}

interface Props {
  eyebrow: string;
  title: string;
  lead?: string;
  crumbs?: Crumb[];
  image?: string;
  children?: React.ReactNode;
}

export function PageHero({ eyebrow, title, lead, crumbs = [], image, children }: Props) {
  return (
    <section className="relative w-full overflow-hidden border-b border-line bg-space-0 pt-[72px]">
      {image &&
      <div className="absolute inset-0">
          <img src={image} alt="" aria-hidden="true" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-space-0 via-space-0/80 to-space-0/60" />
        </div>
      }
      <Starfield className="opacity-60" />

      <div className="relative mx-auto max-w-shell px-5 py-20 lg:px-10 lg:py-28">
        {crumbs.length > 0 &&
        <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-[10.5px] text-ink-faint">
              <li>
                <Link href="/" className="hover:text-cyan">
                  HOME
                </Link>
              </li>
              {crumbs.map((c) =>
            <li key={c.label} className="flex items-center gap-2">
                  <ChevronRightIcon className="h-3 w-3 opacity-50" strokeWidth={1.6} aria-hidden="true" />
                  {c.to ?
              <Link href={c.to} className="hover:text-cyan">
                      {c.label.toUpperCase()}
                    </Link> :

              <span className="text-ink-muted">{c.label.toUpperCase()}</span>
              }
                </li>
            )}
            </ol>
          </nav>
        }

        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-cyan" />
          <span className="font-mono text-[10.5px] tracking-label text-cyan">{eyebrow}</span>
        </div>
        <h1 className="mt-6 max-w-4xl font-display text-[38px] font-semibold leading-[1.05] tracking-tight text-white lg:text-[60px]">
          {title}
        </h1>
        {lead && <p className="mt-7 max-w-2xl text-[15px] leading-relaxed text-ink-muted lg:text-[18px]">{lead}</p>}
        {children}
      </div>
    </section>);

}