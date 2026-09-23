'use client';

import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { products } from '../../data/products';
import { industries, insights } from '../../data/site';

type Tab = 'Products' | 'Articles' | 'Videos' | 'Case Studies' | 'Industries' | 'Pages' | 'FAQs' | 'Menus';

const tabs: Tab[] = ['Products', 'Articles', 'Videos', 'Case Studies', 'Industries', 'Pages', 'FAQs', 'Menus'];

interface Row {
  title: string;
  type: string;
  status: 'Published' | 'Draft' | 'Scheduled';
  languages: string[];
  updated: string;
}

const staticPages: Row[] = [
{ title: 'Homepage', type: 'Page', status: 'Published', languages: ['en', 'fa', 'de'], updated: '2026-09-18' },
{ title: 'Company', type: 'Page', status: 'Published', languages: ['en', 'fa'], updated: '2026-09-11' },
{ title: 'Contact', type: 'Page', status: 'Published', languages: ['en', 'fa', 'ar', 'tr'], updated: '2026-08-30' },
{ title: 'Technology', type: 'Landing Page', status: 'Draft', languages: ['en'], updated: '2026-09-20' }];


function rowsFor(tab: Tab): Row[] {
  switch (tab) {
    case 'Products':
      return products.map((p) => ({
        title: p.name,
        type: 'Product',
        status: 'Published',
        languages: ['en', 'fa', 'de'],
        updated: '2026-09-15'
      }));
    case 'Articles':
      return insights.
      filter((i) => i.kind !== 'Video').
      map((i) => ({ title: i.title, type: i.kind, status: 'Published', languages: ['en'], updated: i.date }));
    case 'Videos':
      return insights.
      filter((i) => i.kind === 'Video').
      map((i) => ({ title: i.title, type: 'Video', status: 'Published', languages: ['en', 'fa'], updated: i.date }));
    case 'Case Studies':
      return [
      { title: 'Fault localisation across 4,200 km of MV feeders', type: 'Case Study', status: 'Published', languages: ['en'], updated: '2026-07-04' },
      { title: 'Tender package to costed SLD', type: 'Case Study', status: 'Scheduled', languages: ['en', 'de'], updated: '2026-09-19' }];

    case 'Industries':
      return industries.map((i) => ({
        title: i.name,
        type: 'Industry',
        status: 'Published',
        languages: ['en', 'fa'],
        updated: '2026-08-22'
      }));
    case 'FAQs':
      return products.flatMap((p) =>
      p.faq.slice(0, 1).map((f) => ({
        title: f.q,
        type: `FAQ · ${p.short}`,
        status: 'Published' as const,
        languages: ['en'],
        updated: '2026-09-02'
      }))
      );
    case 'Menus':
      return [
      { title: 'Primary navigation', type: 'Menu', status: 'Published', languages: ['en', 'fa', 'ar'], updated: '2026-09-09' },
      { title: 'Footer — Products', type: 'Menu', status: 'Published', languages: ['en'], updated: '2026-09-09' }];

    default:
      return staticPages;
  }
}

const statusColor = {
  Published: 'text-cyan',
  Draft: 'text-ink-faint',
  Scheduled: 'text-gold'
} as const;

export function ContentManager() {
  const [tab, setTab] = useState<Tab>('Products');
  const [query, setQuery] = useState('');

  const rows = rowsFor(tab).filter((r) => r.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Content</h1>
          <p className="mt-2 text-[13.5px] text-ink-faint">Every content type is localisable and versioned.</p>
        </div>
        <button className="inline-flex h-10 items-center gap-2 bg-blue px-4 text-[13px] text-white transition-colors duration-200 ease-sim hover:bg-blue-soft">
          <PlusIcon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          New {tab.replace(/s$/, '')}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) =>
        <button
          key={t}
          onClick={() => setTab(t)}
          aria-pressed={t === tab}
          className={`border px-3 py-1.5 font-mono text-[10px] tracking-label transition-colors duration-150 ease-sim ${
          t === tab ? 'border-cyan/60 text-cyan' : 'border-line text-ink-faint hover:text-ink-muted'}`
          }>
          
            {t.toUpperCase()}
          </button>
        )}
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${tab.toLowerCase()}…`}
        aria-label={`Search ${tab}`}
        className="h-11 w-full max-w-sm border border-line bg-space-1 px-3.5 text-[13.5px] text-ink outline-none placeholder:text-ink-faint/70 focus:border-cyan/60" />
      

      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="bg-space-2">
              {['Title', 'Type', 'Status', 'Languages', 'Updated'].map((h) =>
              <th key={h} className="px-5 py-3 font-mono text-[10px] tracking-label text-ink-faint">
                  {h.toUpperCase()}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) =>
            <tr key={r.title} className="border-t border-line bg-space-1 transition-colors duration-150 ease-sim hover:bg-space-2">
                <td className="max-w-md truncate px-5 py-3.5 text-[13.5px] text-ink">{r.title}</td>
                <td className="px-5 py-3.5 font-mono text-[11px] text-ink-faint">{r.type}</td>
                <td className={`px-5 py-3.5 font-mono text-[11px] ${statusColor[r.status]}`}>{r.status}</td>
                <td className="px-5 py-3.5">
                  <span className="flex gap-1">
                    {r.languages.map((l) =>
                  <span key={l} className="border border-line px-1.5 py-0.5 font-mono text-[9.5px] text-ink-faint">
                        {l}
                      </span>
                  )}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-mono text-[11px] text-ink-faint">{r.updated}</td>
              </tr>
            )}
            {rows.length === 0 &&
            <tr className="border-t border-line bg-space-1">
                <td colSpan={5} className="px-5 py-10 text-center text-[13px] text-ink-faint">
                  No entries match this search.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>);

}