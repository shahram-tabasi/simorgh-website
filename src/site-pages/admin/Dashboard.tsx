'use client';

import React from 'react';
import { TrendingUpIcon } from 'lucide-react';
import { products } from '../../data/products';
import { insights } from '../../data/site';

const stats = [
{ label: 'Visitors (30d)', value: '48,210', delta: '+12.4%' },
{ label: 'Page views', value: '196,884', delta: '+8.1%' },
{ label: 'Product views', value: '31,077', delta: '+21.6%' },
{ label: 'Demo requests', value: '164', delta: '+31.0%' },
{ label: 'Contact requests', value: '92', delta: '+4.2%' },
{ label: 'Avg. session', value: '3m 41s', delta: '+0.6%' }];


const traffic = [42, 48, 39, 57, 61, 55, 68, 72, 64, 79, 86, 81];

const popular = [
{ path: '/en/products/simorgh-design-suite', views: '8,412' },
{ path: '/en/products/simorgh-grid', views: '6,930' },
{ path: '/en/technology', views: '5,204' },
{ path: '/en/products/simorgh-digital-twin', views: '4,881' },
{ path: '/fa/products/simorgh-grid', views: '3,117' }];


export function AdminDashboard() {
  const max = Math.max(...traffic);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-2 text-[13.5px] text-ink-faint">Last 30 days · all languages</p>
      </div>

      <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) =>
        <li key={s.label} className="bg-space-1 p-5">
            <div className="font-mono text-[10px] tracking-label text-ink-faint">{s.label.toUpperCase()}</div>
            <div className="mt-4 font-display text-2xl font-semibold text-ink">{s.value}</div>
            <div className="mt-2 inline-flex items-center gap-1 text-[11.5px] text-cyan">
              <TrendingUpIcon className="h-3 w-3" strokeWidth={1.8} aria-hidden="true" />
              {s.delta}
            </div>
          </li>
        )}
      </ul>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="border border-line bg-space-1">
          <h2 className="border-b border-line px-5 py-3 font-mono text-[10px] tracking-label text-cyan/80">
            TRAFFIC · 12 WEEKS
          </h2>
          <div className="flex h-56 items-end gap-2 p-5" role="img" aria-label="Weekly traffic trend, rising over twelve weeks">
            {traffic.map((v, i) =>
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full bg-blue/40" style={{ height: `${v / max * 100}%` }} />
                <span className="font-mono text-[9px] text-ink-faint">W{i + 1}</span>
              </div>
            )}
          </div>
        </section>

        <section className="border border-line bg-space-1">
          <h2 className="border-b border-line px-5 py-3 font-mono text-[10px] tracking-label text-cyan/80">
            POPULAR CONTENT
          </h2>
          <ul>
            {popular.map((p) =>
            <li key={p.path} className="flex items-center justify-between gap-4 border-b border-line/70 px-5 py-3.5 last:border-b-0">
                <span className="truncate font-mono text-[11.5px] text-ink-muted">{p.path}</span>
                <span className="shrink-0 font-mono text-[11.5px] text-cyan">{p.views}</span>
              </li>
            )}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-line bg-space-1">
          <h2 className="border-b border-line px-5 py-3 font-mono text-[10px] tracking-label text-cyan/80">
            RECENT ARTICLES
          </h2>
          <ul>
            {insights.slice(0, 4).map((i) =>
            <li key={i.slug} className="border-b border-line/70 px-5 py-4 last:border-b-0">
                <div className="text-[13.5px] text-ink">{i.title}</div>
                <div className="mt-1.5 font-mono text-[10px] text-ink-faint">
                  {i.kind.toUpperCase()} · {i.date}
                </div>
              </li>
            )}
          </ul>
        </section>

        <section className="border border-line bg-space-1">
          <h2 className="border-b border-line px-5 py-3 font-mono text-[10px] tracking-label text-cyan/80">
            PRODUCT VIEWS
          </h2>
          <ul>
            {products.slice(0, 4).map((p, i) =>
            <li key={p.slug} className="flex items-center gap-4 border-b border-line/70 px-5 py-4 last:border-b-0">
                <span className="w-44 shrink-0 truncate text-[13.5px] text-ink">{p.name}</span>
                <span className="h-1.5 flex-1 bg-space-2">
                  <span className="block h-full bg-cyan/50" style={{ width: `${88 - i * 17}%` }} />
                </span>
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>);

}