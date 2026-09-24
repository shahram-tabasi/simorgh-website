'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { SearchIcon, XIcon } from 'lucide-react';
import { useContent } from '../../content/ContentProvider';

interface Result {
  label: string;
  kind: string;
  to: string;
}

export function SearchOverlay({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { products, industries, articles: insights } = useContent();
  const [query, setQuery] = useState('');

  const index = useMemo<Result[]>(
    () => [
    ...products.map((p) => ({ label: p.name, kind: 'Product', to: `/products/${p.slug}` })),
    ...industries.map((i) => ({ label: i.name, kind: 'Industry', to: `/industries/${i.slug}` })),
    ...insights.map((i) => ({ label: i.title, kind: i.kind, to: `/insights/${i.slug}` })),
    { label: 'SIMORGH AI', kind: 'Technology', to: '/technology' },
    { label: 'Request a Demo', kind: 'Page', to: '/request-demo' },
    { label: 'Contact', kind: 'Page', to: '/contact' }],

    [products, industries, insights]
  );

  const results = query.trim() ?
  index.filter((r) => r.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8) :
  index.slice(0, 6);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-space-0/85 px-4 pt-24 backdrop-blur-sm">
      <button className="absolute inset-0 cursor-default" aria-label="Close search" onClick={onClose} />
      <div className="relative w-full max-w-2xl border border-line bg-space-1">
        <div className="flex items-center gap-3 border-b border-line px-5">
          <SearchIcon className="h-4 w-4 text-cyan" strokeWidth={1.5} aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, industries, technical articles…"
            aria-label="Search the site"
            className="h-14 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint" />
          
          <button onClick={onClose} aria-label="Close search" className="text-ink-faint hover:text-ink">
            <XIcon className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto py-2">
          {results.length === 0 &&
          <li className="px-5 py-6 text-sm text-ink-faint">No results. Search is available in all ten site languages.</li>
          }
          {results.map((r) =>
          <li key={`${r.kind}-${r.label}`}>
              <Link
              href={r.to}
              onClick={onClose}
              className="flex items-center justify-between gap-6 px-5 py-3 text-sm text-ink-muted transition-colors duration-150 ease-sim hover:bg-space-2 hover:text-ink">
              
                <span className="truncate">{r.label}</span>
                <span className="shrink-0 font-mono text-[10px] tracking-label text-ink-faint">{r.kind.toUpperCase()}</span>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>);

}