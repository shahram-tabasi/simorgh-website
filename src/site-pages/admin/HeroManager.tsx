'use client';

import React, { useState } from 'react';
import { ImageIcon, VideoIcon } from 'lucide-react';
import { heroSlides } from '../../data/hero';
import { TextField, TextArea } from '../../components/forms/Field';

export function HeroManager() {
  const [selected, setSelected] = useState(0);
  const [draft, setDraft] = useState(heroSlides.map((s) => ({ ...s })));

  const slide = draft[selected];
  const update = (patch: Partial<typeof slide>) =>
  setDraft((d) => d.map((s, i) => i === selected ? { ...s, ...patch } : s));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Hero &amp; Sliders</h1>
        <p className="mt-2 text-[13.5px] text-ink-faint">
          Homepage hero media, copy and calls to action are content, not code. Desktop, tablet and mobile
          compositions are addressed separately.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
        <ul className="flex flex-col gap-px border border-line bg-line">
          {draft.map((s, i) =>
          <li key={s.id}>
              <button
              onClick={() => setSelected(i)}
              aria-pressed={i === selected}
              className={`w-full bg-space-1 p-4 text-left transition-colors duration-150 ease-sim ${
              i === selected ? 'bg-space-2' : 'hover:bg-space-2'}`
              }>
              
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-label text-ink-faint">ORDER {s.order}</span>
                  <span className={`font-mono text-[10px] ${s.active ? 'text-cyan' : 'text-ink-faint'}`}>
                    {s.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <div className="mt-3 text-[13.5px] text-ink">{s.headline}</div>
              </button>
            </li>
          )}
        </ul>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="border border-line bg-space-1 p-6">
            <h2 className="font-mono text-[10px] tracking-label text-cyan/80">SLIDE FIELDS</h2>
            <div className="mt-6 flex flex-col gap-5">
              <TextField label="Eyebrow" name="eyebrow" value={slide.eyebrow} onChange={(v) => update({ eyebrow: v })} />
              <TextField label="Headline" name="headline" value={slide.headline} onChange={(v) => update({ headline: v })} />
              <TextField label="Headline accent" name="accent" value={slide.headlineAccent} onChange={(v) => update({ headlineAccent: v })} />
              <TextArea label="Subtitle" name="subtitle" rows={3} value={slide.subtitle} onChange={(v) => update({ subtitle: v })} />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField label="CTA 1 label" name="cta1" value={slide.primaryCta.label} onChange={(v) => update({ primaryCta: { ...slide.primaryCta, label: v } })} />
                <TextField label="CTA 1 link" name="cta1link" value={slide.primaryCta.to} onChange={(v) => update({ primaryCta: { ...slide.primaryCta, to: v } })} />
                <TextField label="CTA 2 label" name="cta2" value={slide.secondaryCta.label} onChange={(v) => update({ secondaryCta: { ...slide.secondaryCta, label: v } })} />
                <TextField label="CTA 2 link" name="cta2link" value={slide.secondaryCta.to} onChange={(v) => update({ secondaryCta: { ...slide.secondaryCta, to: v } })} />
                <TextField label="Start date" name="start" type="date" value={slide.startDate ?? ''} onChange={(v) => update({ startDate: v })} />
                <TextField label="End date" name="end" type="date" value={slide.endDate ?? ''} onChange={(v) => update({ endDate: v })} />
              </div>

              <div>
                <span className="mb-2 block font-mono text-[10px] tracking-label text-ink-faint">OVERLAY OPACITY</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={slide.overlay}
                  aria-label="Overlay opacity"
                  onChange={(e) => update({ overlay: Number(e.target.value) })}
                  className="w-full accent-cyan" />
                
                <span className="mt-1 block font-mono text-[10px] text-ink-faint">{slide.overlay.toFixed(2)}</span>
              </div>

              <label className="flex items-center gap-3 text-[13.5px] text-ink-muted">
                <input
                  type="checkbox"
                  checked={slide.active}
                  onChange={(e) => update({ active: e.target.checked })}
                  className="h-4 w-4 accent-cyan" />
                
                Active on homepage
              </label>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div className="border border-line bg-space-1 p-6">
              <h2 className="font-mono text-[10px] tracking-label text-cyan/80">HERO MEDIA</h2>
              <div className="mt-5 flex gap-2">
                {(['image', 'video'] as const).map((t) =>
                <button
                  key={t}
                  onClick={() => update({ media: { ...slide.media, type: t } })}
                  aria-pressed={slide.media.type === t}
                  className={`inline-flex items-center gap-2 border px-3.5 py-2 font-mono text-[10px] tracking-label transition-colors duration-150 ease-sim ${
                  slide.media.type === t ? 'border-cyan/60 text-cyan' : 'border-line text-ink-faint hover:text-ink-muted'}`
                  }>
                  
                    {t === 'image' ? <ImageIcon className="h-3.5 w-3.5" strokeWidth={1.6} /> : <VideoIcon className="h-3.5 w-3.5" strokeWidth={1.6} />}
                    {t.toUpperCase()}
                  </button>
                )}
              </div>

              <dl className="mt-6 flex flex-col gap-3">
                {[
                { k: 'Desktop', v: slide.media.desktop },
                { k: 'Tablet', v: slide.media.tablet },
                { k: 'Mobile', v: slide.media.mobile },
                { k: 'Video MP4', v: slide.media.videoMp4 ?? 'not set' },
                { k: 'Video WebM', v: slide.media.videoWebm ?? 'not set' },
                { k: 'Focal point', v: slide.media.focal }].
                map((row) =>
                <div key={row.k} className="flex items-center justify-between gap-4 border-b border-line/70 pb-2.5">
                    <dt className="font-mono text-[10px] tracking-label text-ink-faint">{row.k.toUpperCase()}</dt>
                    <dd className="max-w-[60%] truncate font-mono text-[11px] text-ink-muted">{row.v}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="border border-line bg-space-1">
              <h2 className="border-b border-line px-5 py-3 font-mono text-[10px] tracking-label text-cyan/80">
                LIVE PREVIEW · DESKTOP
              </h2>
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={slide.media.desktop} alt="" className="h-full w-full object-cover" style={{ objectPosition: slide.media.focal }} />
                <div className="absolute inset-0 bg-gradient-to-r from-space-0 to-transparent" style={{ opacity: slide.overlay + 0.3 }} />
                <div className="absolute inset-0 flex flex-col justify-center p-6">
                  <span className="font-mono text-[8px] tracking-label text-cyan">{slide.eyebrow}</span>
                  <span className="mt-2 max-w-[60%] font-display text-base font-semibold leading-tight text-white">
                    {slide.headline} {slide.headlineAccent}
                  </span>
                  <span className="mt-3 flex gap-2">
                    <span className="bg-blue px-2 py-1 text-[8px] text-white">{slide.primaryCta.label}</span>
                    <span className="border border-line px-2 py-1 text-[8px] text-ink-muted">{slide.secondaryCta.label}</span>
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>);

}