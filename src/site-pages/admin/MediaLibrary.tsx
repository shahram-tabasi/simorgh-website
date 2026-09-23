'use client';

import React, { useState } from 'react';
import { UploadIcon, FileIcon, FilmIcon, ImageIcon } from 'lucide-react';
import { REF_IMAGE_BIRD, REF_IMAGE_HERO, REF_IMAGE_NEURAL, REF_IMAGE_PLANET } from '../../data/site';

interface Asset {
  name: string;
  kind: 'image' | 'video' | 'document';
  format: string;
  size: string;
  folder: string;
  tags: string[];
  alt: string;
  src?: string;
}

const assets: Asset[] = [
{ name: 'hero-simorgh-cosmos', kind: 'image', format: 'JPG', size: '1.8 MB', folder: 'Hero', tags: ['hero', 'brand', 'ai'], alt: 'Luminous Simorgh between a human and an AI above a digital Earth', src: REF_IMAGE_HERO },
{ name: 'neural-architecture-band', kind: 'image', format: 'JPG', size: '640 KB', folder: 'Technology', tags: ['ai', 'network'], alt: 'Digital neural architecture with a luminous figure at centre', src: REF_IMAGE_NEURAL },
{ name: 'simorgh-wings', kind: 'image', format: 'PNG', size: '1.1 MB', folder: 'Brand', tags: ['brand', 'simorgh'], alt: 'Simorgh with outstretched luminous wings', src: REF_IMAGE_BIRD },
{ name: 'digital-earth-horizon', kind: 'image', format: 'JPG', size: '820 KB', folder: 'Digital Twin', tags: ['earth', 'twin'], alt: 'Digital planet horizon with light rising', src: REF_IMAGE_PLANET },
{ name: 'design-suite-walkthrough', kind: 'video', format: 'MP4', size: '184 MB', folder: 'Video', tags: ['product', 'design-suite'], alt: 'Design Suite product walkthrough' },
{ name: 'grid-control-room', kind: 'video', format: 'WEBM', size: '96 MB', folder: 'Video', tags: ['product', 'grid'], alt: 'Grid control room walkthrough' },
{ name: 'digital-twin-whitepaper', kind: 'document', format: 'PDF', size: '4.2 MB', folder: 'Documents', tags: ['whitepaper'], alt: 'Digital twin whitepaper' },
{ name: 'simorgh-logo-mark', kind: 'image', format: 'SVG', size: '12 KB', folder: 'Brand', tags: ['logo'], alt: 'SIMORGH logo mark' }];


const folders = ['All', 'Hero', 'Brand', 'Technology', 'Digital Twin', 'Video', 'Documents'];

const kindIcon = { image: ImageIcon, video: FilmIcon, document: FileIcon };

export function MediaLibrary() {
  const [folder, setFolder] = useState('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Asset | null>(assets[0]);

  const filtered = assets.filter(
    (a) =>
    (folder === 'All' || a.folder === folder) && (
    a.name.includes(query.toLowerCase()) || a.tags.some((t) => t.includes(query.toLowerCase())))
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Media Library</h1>
          <p className="mt-2 text-[13.5px] text-ink-faint">JPG · PNG · WEBP · SVG · MP4 · WebM · PDF</p>
        </div>
        <button className="inline-flex h-10 items-center gap-2 bg-blue px-4 text-[13px] text-white transition-colors duration-200 ease-sim hover:bg-blue-soft">
          <UploadIcon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          Upload
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {folders.map((f) =>
        <button
          key={f}
          onClick={() => setFolder(f)}
          aria-pressed={f === folder}
          className={`border px-3 py-1.5 font-mono text-[10px] tracking-label transition-colors duration-150 ease-sim ${
          f === folder ? 'border-cyan/60 text-cyan' : 'border-line text-ink-faint hover:text-ink-muted'}`
          }>
          
            {f.toUpperCase()}
          </button>
        )}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or tag…"
          aria-label="Search media"
          className="ml-auto h-10 w-full max-w-xs border border-line bg-space-1 px-3.5 text-[13px] text-ink outline-none placeholder:text-ink-faint/70 focus:border-cyan/60" />
        
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((a) => {
            const KindIcon = kindIcon[a.kind];
            return (
              <li key={a.name} className="bg-space-1">
                <button onClick={() => setSelected(a)} className="w-full text-left">
                  <span className="relative block aspect-[4/3] overflow-hidden bg-space-2">
                    {a.src ?
                    <img src={a.src} alt="" className="h-full w-full object-cover opacity-85" /> :

                    <span className="flex h-full w-full items-center justify-center">
                        <KindIcon className="h-6 w-6 text-ink-faint" strokeWidth={1.4} aria-hidden="true" />
                      </span>
                    }
                    <span className="absolute right-2 top-2 border border-line bg-space-0/85 px-1.5 py-0.5 font-mono text-[9px] text-ink-faint">
                      {a.format}
                    </span>
                  </span>
                  <span className="block px-4 py-3">
                    <span className="block truncate text-[13px] text-ink">{a.name}</span>
                    <span className="mt-1 block font-mono text-[10px] text-ink-faint">
                      {a.folder.toUpperCase()} · {a.size}
                    </span>
                  </span>
                </button>
              </li>);

          })}
          {filtered.length === 0 &&
          <li className="bg-space-1 p-10 text-center text-[13px] text-ink-faint sm:col-span-2 lg:col-span-3 xl:col-span-4">
              No assets match this filter.
            </li>
          }
        </ul>

        {selected &&
        <aside className="h-fit border border-line bg-space-1">
            <h2 className="border-b border-line px-5 py-3 font-mono text-[10px] tracking-label text-cyan/80">
              ASSET DETAIL
            </h2>
            {selected.src &&
          <img src={selected.src} alt={selected.alt} className="aspect-[4/3] w-full object-cover" />
          }
            <dl className="p-5">
              {[
            { k: 'Name', v: selected.name },
            { k: 'Format', v: selected.format },
            { k: 'Size', v: selected.size },
            { k: 'Folder', v: selected.folder },
            { k: 'Tags', v: selected.tags.join(', ') }].
            map((r) =>
            <div key={r.k} className="flex justify-between gap-4 border-b border-line/70 py-2.5 last:border-b-0">
                  <dt className="font-mono text-[10px] tracking-label text-ink-faint">{r.k.toUpperCase()}</dt>
                  <dd className="max-w-[60%] truncate text-[12.5px] text-ink-muted">{r.v}</dd>
                </div>
            )}
            </dl>
            <div className="border-t border-line p-5">
              <span className="font-mono text-[10px] tracking-label text-ink-faint">ALT TEXT</span>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{selected.alt}</p>
            </div>
          </aside>
        }
      </div>
    </div>);

}