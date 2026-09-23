'use client';

import React, { useState } from 'react';
import { TextField, TextArea, SelectField } from '../../components/forms/Field';
import { languages, REF_IMAGE_HERO } from '../../data/site';

const schemaTypes = ['Organization', 'WebSite', 'Product', 'SoftwareApplication', 'Article', 'VideoObject', 'BreadcrumbList', 'FAQPage'];

export function SeoManager() {
  const [seo, setSeo] = useState({
    slug: 'products/simorgh-grid',
    title: 'SIMORGH GRID — Smart Grid and electricity infrastructure intelligence',
    description:
    'Correlate substation, feeder and metering events into ranked incidents, localise faults and give control room teams a defensible recommended action.',
    canonical: 'https://simorgh.tech/en/products/simorgh-grid',
    robots: 'index, follow',
    schema: 'SoftwareApplication',
    keywords: 'smart grid, fault localisation, distribution network, decision support'
  });

  const set = (key: keyof typeof seo) => (v: string) => setSeo((s) => ({ ...s, [key]: v }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">SEO</h1>
        <p className="mt-2 text-[13.5px] text-ink-faint">
          Per-item metadata, localised across {languages.length} languages with hreflang and localised sitemaps.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <section className="border border-line bg-space-1 p-6">
          <h2 className="font-mono text-[10px] tracking-label text-cyan/80">METADATA · EN</h2>
          <div className="mt-6 flex flex-col gap-5">
            <TextField label="Slug" name="slug" value={seo.slug} onChange={set('slug')} />
            <TextField label="SEO title" name="seo-title" value={seo.title} onChange={set('title')} />
            <TextArea label="Meta description" name="seo-desc" rows={3} value={seo.description} onChange={set('description')} />
            <TextField label="Canonical" name="canonical" value={seo.canonical} onChange={set('canonical')} />
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField label="Robots" name="robots" value={seo.robots} onChange={set('robots')} options={['index, follow', 'noindex, follow', 'noindex, nofollow']} />
              <SelectField label="Schema type" name="schema" value={seo.schema} onChange={set('schema')} options={schemaTypes} />
            </div>
            <TextField label="Keywords" name="keywords" value={seo.keywords} onChange={set('keywords')} />
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <span className="font-mono text-[10px] tracking-label text-ink-faint">HREFLANG COVERAGE</span>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {languages.map((l) =>
              <span
                key={l.code}
                className={`border px-2 py-1 font-mono text-[10px] ${
                ['en', 'fa', 'de'].includes(l.code) ? 'border-cyan/50 text-cyan' : 'border-line text-ink-faint'}`
                }>
                
                  {l.code}
                </span>
              )}
            </div>
            <p className="mt-3 text-[12px] text-ink-faint">Highlighted locales are published. Others fall back to /en.</p>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="border border-line bg-space-1">
            <h2 className="border-b border-line px-5 py-3 font-mono text-[10px] tracking-label text-cyan/80">
              GOOGLE PREVIEW
            </h2>
            <div className="p-6">
              <div className="font-mono text-[11px] text-ink-faint">{seo.canonical}</div>
              <div className="mt-1.5 max-w-xl truncate text-[17px] text-blue-soft">{seo.title}</div>
              <p className="mt-1.5 max-w-xl text-[13px] leading-snug text-ink-muted">{seo.description}</p>
            </div>
          </div>

          <div className="border border-line bg-space-1">
            <h2 className="border-b border-line px-5 py-3 font-mono text-[10px] tracking-label text-cyan/80">
              SOCIAL PREVIEW · OG / X
            </h2>
            <div className="p-6">
              <div className="border border-line">
                <img src={REF_IMAGE_HERO} alt="Open Graph preview" className="aspect-[1.91/1] w-full object-cover" />
                <div className="bg-space-0 p-4">
                  <div className="font-mono text-[10px] text-ink-faint">SIMORGH.TECH</div>
                  <div className="mt-2 truncate text-[14px] text-ink">{seo.title}</div>
                  <p className="mt-1.5 line-clamp-2 text-[12.5px] text-ink-faint">{seo.description}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-line bg-space-1 p-6">
            <h2 className="font-mono text-[10px] tracking-label text-cyan/80">GENERATED ARTEFACTS</h2>
            <ul className="mt-4 flex flex-col gap-2 font-mono text-[11.5px] text-ink-muted">
              {['/robots.txt', '/sitemap.xml', '/sitemap-en.xml', '/sitemap-fa.xml', '/sitemap-videos.xml'].map((f) =>
              <li key={f} className="flex items-center justify-between border-b border-line/70 pb-2">
                  <span>{f}</span>
                  <span className="text-cyan">auto</span>
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>);

}