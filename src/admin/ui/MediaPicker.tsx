'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckIcon, CopyIcon, FolderIcon, SearchIcon, Trash2Icon, UploadIcon, XIcon } from 'lucide-react';

export interface MediaItem { url: string; name: string; folder: string; size: number; modified: string; builtIn?: boolean }

const MAX_EDGE = 2560;

/**
 * Large photos are shrunk in the browser before upload (longest side 2560 px,
 * WebP), which keeps pages fast. GIF, WebP, video and PDF go up untouched.
 */
async function prepare(file: File, optimise: boolean): Promise<File> {
  if (!optimise || !/^image\/(jpeg|png)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.86));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.(jpe?g|png)$/i, '.webp'), { type: 'image/webp' });
  } catch {
    return file;
  }
}

export async function uploadFiles(files: File[], folder: string, optimise = true) {
  const form = new FormData();
  form.set('folder', folder);
  for (const f of files) form.append('files', await prepare(f, optimise));
  const res = await fetch('/api/admin/media', { method: 'POST', body: form });
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()) as { saved: string[]; rejected: { name: string; reason: string }[] };
}

const kb = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const isVideo = (u: string) => /\.(mp4|webm)$/i.test(u);
const isImage = (u: string) => /\.(jpe?g|png|webp|gif|avif)$/i.test(u);

export function useMedia() {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const reload = useCallback(async () => {
    const res = await fetch('/api/admin/media', { cache: 'no-store' });
    setItems(res.ok ? await res.json() : []);
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { items, reload };
}

/** The media library: browse, search, upload, delete. With `onPick` it works as a chooser. */
export function MediaBrowser({ onPick, folder: initialFolder = 'uploads', accept = 'any' }: { onPick?: (url: string) => void; folder?: string; accept?: 'image' | 'video' | 'any' }) {
  const { items, reload } = useMedia();
  const [query, setQuery] = useState('');
  const [folder, setFolder] = useState(initialFolder);
  const [show, setShow] = useState<'all' | 'uploads' | 'builtIn'>('all');
  const [busy, setBusy] = useState(false);
  const [optimise, setOptimise] = useState(true);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState('');
  const input = useRef<HTMLInputElement>(null);

  const visible = useMemo(() => (items ?? []).filter((m) => {
    if (accept === 'image' && !isImage(m.url)) return false;
    if (accept === 'video' && !isVideo(m.url)) return false;
    if (show === 'uploads' && m.builtIn) return false;
    if (show === 'builtIn' && !m.builtIn) return false;
    return !query || m.url.toLowerCase().includes(query.toLowerCase());
  }), [items, accept, show, query]);

  const upload = async (files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    setBusy(true); setMessage('');
    try {
      const { saved, rejected } = await uploadFiles(Array.from(files), folder || 'uploads', optimise);
      await reload();
      setMessage(`${saved.length} فایل بارگذاری شد.${rejected.length ? ` ${rejected.length} فایل رد شد (نوع یا حجم نامجاز).` : ''}`);
      if (onPick && saved.length === 1) onPick(saved[0]);
    } catch {
      setMessage('بارگذاری انجام نشد.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (url: string) => {
    if (!confirm('این فایل برای همیشه حذف شود؟ اگر جایی از سایت از آن استفاده شده باشد، آنجا خالی می‌ماند.')) return;
    await fetch(`/api/admin/media?url=${encodeURIComponent(url)}`, { method: 'DELETE' });
    reload();
  };

  const copy = (url: string) => {
    navigator.clipboard?.writeText(url);
    setCopied(url);
    window.setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}
    >
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-cyan/30 bg-cyan/[0.03] p-4">
        <label className="min-w-[12rem] flex-1">
          <span className="mb-1 flex items-center gap-1.5 text-[12px] text-ink-muted"><FolderIcon className="h-3.5 w-3.5" />پوشه مقصد</span>
          <input dir="ltr" value={folder} onChange={(e) => setFolder(e.target.value)} className="w-full rounded-md border border-line bg-space-0/70 px-3 py-1.5 font-mono text-[12.5px] text-ink outline-none focus:border-cyan/60" placeholder="products/simorgh-grid" />
        </label>
        <label className="flex items-center gap-2 pb-2 text-[12px] text-ink-muted">
          <input type="checkbox" checked={optimise} onChange={(e) => setOptimise(e.target.checked)} className="accent-cyan" />
          بهینه‌سازی عکس (WebP، حداکثر ۲۵۶۰px)
        </label>
        <button type="button" disabled={busy} onClick={() => input.current?.click()}
          className="inline-flex items-center gap-2 rounded-md bg-cyan px-4 py-2 text-[13px] font-medium text-space-0 hover:bg-cyan-soft disabled:opacity-50">
          <UploadIcon className="h-4 w-4" />{busy ? 'در حال بارگذاری…' : 'بارگذاری فایل'}
        </button>
        <input ref={input} type="file" multiple hidden accept="image/*,video/mp4,video/webm,application/pdf" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
        <p className="w-full text-[11.5px] text-ink-faint">فایل‌ها را می‌توانید همین‌جا رها کنید. مجاز: JPG، PNG، WebP، GIF، AVIF، MP4، WebM، PDF — تا ۶۰ مگابایت.</p>
        {message && <p className="w-full text-[12px] text-cyan">{message}</p>}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <SearchIcon className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجو در نام فایل…" className="w-full rounded-md border border-line bg-space-0/70 py-1.5 pe-3 ps-8 text-[13px] text-ink outline-none focus:border-cyan/60" />
        </div>
        {(['all', 'uploads', 'builtIn'] as const).map((k) => (
          <button key={k} type="button" onClick={() => setShow(k)}
            className={`rounded-md px-3 py-1.5 text-[12px] ${show === k ? 'bg-space-3 text-ink' : 'text-ink-faint hover:text-ink'}`}>
            {{ all: 'همه', uploads: 'بارگذاری‌شده', builtIn: 'فایل‌های داخلی سایت' }[k]}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items === null && <div className="col-span-full py-10 text-center text-[13px] text-ink-faint">در حال بارگذاری…</div>}
        {items && visible.length === 0 && <div className="col-span-full py-10 text-center text-[13px] text-ink-faint">فایلی پیدا نشد.</div>}
        {visible.map((m) => (
          <div key={m.url} className="group overflow-hidden rounded-lg border border-line bg-space-0/60">
            <button type="button" onClick={() => onPick?.(m.url)} className={`relative block aspect-[4/3] w-full bg-[repeating-conic-gradient(#0b1226_0%_25%,#101a35_0%_50%)] bg-[length:16px_16px] ${onPick ? 'cursor-pointer' : 'cursor-default'}`}>
              {isImage(m.url) ? <img src={m.url} alt="" loading="lazy" className="h-full w-full object-contain" />
                : isVideo(m.url) ? <video src={m.url} muted preload="metadata" className="h-full w-full object-cover" />
                  : <span className="grid h-full place-items-center text-[12px] text-ink-muted">PDF</span>}
              {onPick && <span className="absolute inset-0 grid place-items-center bg-cyan/20 text-[12px] font-medium text-ink opacity-0 transition-opacity group-hover:opacity-100">انتخاب</span>}
            </button>
            <div className="p-2">
              <div dir="ltr" className="truncate text-left font-mono text-[10.5px] text-ink-muted" title={m.url}>{m.url}</div>
              <div className="mt-1 flex items-center justify-between gap-1">
                <span className="text-[10.5px] text-ink-faint">{kb(m.size)}{m.builtIn ? ' · داخلی' : ''}</span>
                <span className="flex gap-1">
                  <button type="button" title="کپی آدرس" onClick={() => copy(m.url)} className="rounded p-1 text-ink-faint hover:text-ink">
                    {copied === m.url ? <CheckIcon className="h-3.5 w-3.5 text-cyan" /> : <CopyIcon className="h-3.5 w-3.5" />}
                  </button>
                  {!m.builtIn && (
                    <button type="button" title="حذف" onClick={() => remove(m.url)} className="rounded p-1 text-ink-faint hover:text-red-300"><Trash2Icon className="h-3.5 w-3.5" /></button>
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MediaPicker({ onPick, onClose, folder, accept }: { onPick: (url: string) => void; onClose: () => void; folder?: string; accept?: 'image' | 'video' | 'any' }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-5xl rounded-xl border border-line bg-space-1 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-ink">کتابخانه رسانه</h2>
          <button type="button" onClick={onClose} aria-label="بستن" className="rounded-md p-1.5 text-ink-muted hover:bg-space-3 hover:text-ink"><XIcon className="h-4 w-4" /></button>
        </div>
        <MediaBrowser onPick={onPick} folder={folder} accept={accept} />
      </div>
    </div>
  );
}
