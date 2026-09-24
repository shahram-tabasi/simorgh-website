'use client';

// Form building blocks for the admin panel.

import React, { useId, useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, ImageIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import type { Seo } from '../../content/types';
import { MediaPicker } from './MediaPicker';
import { useAdmin } from './AdminStore';

export const inputCls =
  'w-full rounded-md border border-line bg-space-0/70 px-3 py-2 text-[13.5px] text-ink outline-none transition-colors placeholder:text-ink-faint/60 focus:border-cyan/60';

export function Card({ title, hint, children, actions }: { title?: string; hint?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-space-1/80 p-5 sm:p-6">
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-[15px] font-semibold text-ink">{title}</h2>}
            {hint && <p className="mt-1 text-[12.5px] leading-6 text-ink-faint">{hint}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

export function Grid({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  const c = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[cols];
  return <div className={`grid gap-4 ${c}`}>{children}</div>;
}

export function Field({ label, hint, children, count, max }: { label: string; hint?: string; children: React.ReactNode; count?: number; max?: number }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 flex items-baseline justify-between gap-2 text-[12.5px] font-medium text-ink-muted">
        <span>{label}</span>
        {count !== undefined && max && (
          <span className={`font-sans text-[11px] tabular-nums ${count > max ? 'text-gold' : 'text-ink-faint'}`}>{count}/{max}</span>
        )}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] leading-5 text-ink-faint">{hint}</span>}
    </label>
  );
}

type TextProps = {
  label: string; value: string | undefined; onChange: (v: string) => void;
  hint?: string; placeholder?: string; ltr?: boolean; max?: number; type?: string;
};

export function Text({ label, value, onChange, hint, placeholder, ltr, max, type = 'text' }: TextProps) {
  return (
    <Field label={label} hint={hint} count={max ? (value ?? '').length : undefined} max={max}>
      <input type={type} dir={ltr ? 'ltr' : 'auto'} className={inputCls} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function Area({ label, value, onChange, hint, placeholder, rows = 3, max, ltr, mono }: TextProps & { rows?: number; mono?: boolean }) {
  return (
    <Field label={label} hint={hint} count={max ? (value ?? '').length : undefined} max={max}>
      <textarea dir={ltr ? 'ltr' : 'auto'} rows={rows} className={`${inputCls} resize-y leading-7 ${mono ? 'font-mono text-[13px]' : ''}`} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function NumberInput({ label, value, onChange, hint, step = 1, min, max }: { label: string; value: number; onChange: (v: number) => void; hint?: string; step?: number; min?: number; max?: number }) {
  return (
    <Field label={label} hint={hint}>
      <input type="number" dir="ltr" className={inputCls} value={Number.isFinite(value) ? value : 0} step={step} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))} />
    </Field>
  );
}

export function Select<T extends string>({ label, value, onChange, options, hint }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => <option key={o.value} value={o.value} className="bg-space-1">{o.label}</option>)}
      </select>
    </Field>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <button
        id={id} type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-cyan/80' : 'bg-space-3'}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? 'start-[18px]' : 'start-0.5'}`} />
      </button>
      <label htmlFor={id} className="cursor-pointer text-[13px] text-ink-muted">
        {label}
        {hint && <span className="mt-0.5 block text-[11.5px] text-ink-faint">{hint}</span>}
      </label>
    </div>
  );
}

export function Btn({ children, onClick, kind = 'ghost', type = 'button', disabled, small, title }: {
  children: React.ReactNode; onClick?: () => void; kind?: 'primary' | 'ghost' | 'danger'; type?: 'button' | 'submit'; disabled?: boolean; small?: boolean; title?: string;
}) {
  const k = {
    primary: 'bg-cyan text-space-0 hover:bg-cyan-soft',
    ghost: 'border border-line text-ink-muted hover:border-cyan/50 hover:text-ink',
    danger: 'border border-red-400/30 text-red-300 hover:bg-red-500/10',
  }[kind];
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${small ? 'px-2.5 py-1 text-[12px]' : 'px-4 py-2 text-[13px]'} ${k}`}>
      {children}
    </button>
  );
}

const isVideo = (url: string) => /\.(mp4|webm)$/i.test(url);

/** A picture (or video) slot: preview, choose from the library or upload, clear. */
export function ImageField({ label, value, onChange, hint, folder, aspect = 'aspect-video', accept = 'image' }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; folder?: string; aspect?: string; accept?: 'image' | 'video' | 'any';
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-w-0">
      <div className="mb-1.5 text-[12.5px] font-medium text-ink-muted">{label}</div>
      <div className={`group relative ${aspect} overflow-hidden rounded-lg border border-dashed border-line bg-space-0/60`}>
        {value ? (
          isVideo(value)
            ? <video src={value} className="h-full w-full object-cover" muted playsInline />
            : value.endsWith('.pdf')
              ? <div className="grid h-full place-items-center text-[12px] text-ink-muted">PDF</div>
              : <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <button type="button" onClick={() => setOpen(true)} className="grid h-full w-full place-items-center text-ink-faint transition-colors hover:text-cyan">
            <span className="flex flex-col items-center gap-2 text-[12px]"><ImageIcon className="h-6 w-6" strokeWidth={1.3} />خالی — برای انتخاب کلیک کنید</span>
          </button>
        )}
        {value && (
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <Btn small onClick={() => setOpen(true)}>تغییر</Btn>
            <Btn small kind="danger" onClick={() => onChange('')}>حذف</Btn>
          </div>
        )}
      </div>
      <input dir="ltr" className={`${inputCls} mt-2 font-mono text-[11.5px]`} value={value} placeholder="/media/… یا /images/…" onChange={(e) => onChange(e.target.value.trim())} />
      {hint && <div className="mt-1 text-[11.5px] leading-5 text-ink-faint">{hint}</div>}
      {open && <MediaPicker folder={folder} accept={accept} onClose={() => setOpen(false)} onPick={(url) => { onChange(url); setOpen(false); }} />}
    </div>
  );
}

/** An editable list with add / remove / reorder. */
export function ListEditor<T>({ label, hint, items, onChange, make, render, addLabel = 'افزودن', itemTitle }: {
  label: string; hint?: string; items: T[]; onChange: (items: T[]) => void; make: () => T;
  render: (item: T, set: (v: T) => void, index: number) => React.ReactNode; addLabel?: string; itemTitle?: (item: T, i: number) => string;
}) {
  const setAt = (i: number) => (v: T) => onChange(items.map((x, j) => (j === i ? v : x)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <div className="text-[12.5px] font-medium text-ink-muted">{label} <span className="text-ink-faint">({items.length})</span></div>
          {hint && <div className="mt-0.5 text-[11.5px] text-ink-faint">{hint}</div>}
        </div>
        <Btn small onClick={() => onChange([...items, make()])}><PlusIcon className="h-3.5 w-3.5" />{addLabel}</Btn>
      </div>
      <div className="grid gap-2.5">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-line bg-space-0/40 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="truncate text-[11.5px] text-ink-faint">{itemTitle ? itemTitle(item, i) : `#${i + 1}`}</span>
              <span className="flex shrink-0 gap-1">
                <IconBtn title="بالا" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUpIcon className="h-3.5 w-3.5" /></IconBtn>
                <IconBtn title="پایین" onClick={() => move(i, 1)} disabled={i === items.length - 1}><ArrowDownIcon className="h-3.5 w-3.5" /></IconBtn>
                <IconBtn title="حذف" danger onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2Icon className="h-3.5 w-3.5" /></IconBtn>
              </span>
            </div>
            {render(item, setAt(i), i)}
          </div>
        ))}
        {items.length === 0 && <div className="rounded-lg border border-dashed border-line p-4 text-center text-[12px] text-ink-faint">خالی</div>}
      </div>
    </div>
  );
}

export function IconBtn({ children, onClick, title, danger, disabled }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean; disabled?: boolean }) {
  return (
    <button type="button" title={title} aria-label={title} onClick={onClick} disabled={disabled}
      className={`grid h-7 w-7 place-items-center rounded-md border border-line transition-colors disabled:opacity-30 ${danger ? 'text-red-300 hover:bg-red-500/10' : 'text-ink-muted hover:text-ink'}`}>
      {children}
    </button>
  );
}

/** Comma / line separated list of short strings. */
export function Tags({ label, value, onChange, hint }: { label: string; value: string[]; onChange: (v: string[]) => void; hint?: string }) {
  const [text, setText] = useState('');
  const add = () => {
    const parts = text.split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setText('');
  };
  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-wrap gap-1.5 rounded-md border border-line bg-space-0/70 p-2">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded bg-space-3 px-2 py-0.5 text-[12px] text-ink">
            {t}
            <button type="button" aria-label="حذف" onClick={() => onChange(value.filter((x) => x !== t))} className="text-ink-faint hover:text-red-300"><XIcon className="h-3 w-3" /></button>
          </span>
        ))}
        <input className="min-w-[8rem] flex-1 bg-transparent px-1 text-[13px] text-ink outline-none" value={text} placeholder="بنویسید و Enter بزنید"
          onChange={(e) => setText(e.target.value)} onBlur={add}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }} />
      </div>
    </Field>
  );
}

/** Search-engine fields with a Google-style preview. */
export function SeoFields({ value, onChange, fallbackTitle, fallbackDescription, path, titleTemplate = '%s | SIMORGH' }: {
  value: Seo; onChange: (v: Seo) => void; fallbackTitle: string; fallbackDescription: string; path: string; titleTemplate?: string;
}) {
  const set = <K extends keyof Seo>(k: K) => (v: Seo[K]) => onChange({ ...value, [k]: v });
  const host = useAdmin().draft.settings.siteUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const raw = value.title || fallbackTitle;
  // Same rule as the site: a title that already names SIMORGH is used as is.
  const title = /simorgh/i.test(raw) ? raw : titleTemplate.replace('%s', raw);
  const description = value.description || fallbackDescription;
  return (
    <Card title="سئو (موتورهای جستجو)" hint="اگر خالی بماند، از عنوان و خلاصه همین صفحه استفاده می‌شود. عنوان حدود ۶۰ و توضیح حدود ۱۵۵ کاراکتر بهترین نتیجه را دارد.">
      <div dir="ltr" className="rounded-lg bg-white p-4 text-left font-sans">
        <div className="truncate text-[12px] text-[#202124]">{host}{path}</div>
        <div className="mt-0.5 truncate text-[18px] leading-snug text-[#1a0dab]">{title}</div>
        <div className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#4d5156]">{description}</div>
      </div>
      <Text label="عنوان صفحه (title)" value={value.title} onChange={set('title')} placeholder={fallbackTitle} max={60} />
      <Area label="توضیح متا (meta description)" value={value.description} onChange={set('description')} placeholder={fallbackDescription} max={160} />
      <Text label="کلمات کلیدی" value={value.keywords} onChange={set('keywords')} hint="با کاما جدا کنید. مثلاً: طراحی تابلو برق, EPLAN, دوقلوی دیجیتال" />
      <Grid>
        <ImageField label="تصویر اشتراک‌گذاری (Open Graph)" value={value.image ?? ''} onChange={set('image')} folder="seo" hint="۱۲۰۰×۶۳۰ پیکسل. خالی = تصویر سربرگ صفحه." />
        <div className="self-start pt-7">
          <Toggle label="از نتایج جستجو پنهان شود (noindex)" checked={!!value.noindex} onChange={set('noindex')} />
        </div>
      </Grid>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return status === 'draft'
    ? <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[10.5px] text-gold">پیش‌نویس</span>
    : <span className="rounded bg-cyan/10 px-1.5 py-0.5 text-[10.5px] text-cyan">منتشر شده</span>;
}

export function PageTitle({ title, lead, actions }: { title: string; lead?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-bold text-ink">{title}</h1>
        {lead && <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-ink-faint">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
