'use client';

// The admin's working copy of the site content. Every editor changes this
// draft; nothing reaches the site until "ذخیره و انتشار" sends the whole draft
// to /api/admin/content, which saves it (with a backup) and refreshes the site.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { SiteContent } from '../../content/types';

type Updater = SiteContent | ((draft: SiteContent) => SiteContent);

interface StoreValue {
  draft: SiteContent;
  saved: SiteContent;
  dirty: boolean;
  saving: boolean;
  update: (next: Updater) => void;
  /** Change one top-level part of the content. */
  set: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void;
  save: () => Promise<boolean>;
  discard: () => void;
  replaceAll: (content: SiteContent) => void;
  notice: Notice | null;
  notify: (text: string, kind?: Notice['kind']) => void;
}

export interface Notice { text: string; kind: 'ok' | 'error' | 'info'; id: number }

const Store = createContext<StoreValue | null>(null);

const SAVE_ERRORS: Record<string, string> = {
  conflict: 'محتوا در این فاصله از جای دیگری ذخیره شده است. صفحه را تازه کنید و تغییرات را دوباره وارد کنید.',
  'duplicate-slug': 'دو مورد با نامک (slug) یکسان وجود دارد. نامک هر محصول، صنعت و مقاله باید یکتا باشد.',
  unauthorised: 'نشست شما منقضی شده است. دوباره وارد شوید.',
};

export function AdminStoreProvider({ initial, children }: { initial: SiteContent; children: React.ReactNode }) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const dirty = draft !== saved;

  const notify = useCallback((text: string, kind: Notice['kind'] = 'ok') => {
    setNotice({ text, kind, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), notice.kind === 'error' ? 9000 : 3500);
    return () => window.clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = useCallback((next: Updater) => {
    setDraft((d) => (typeof next === 'function' ? next(d) : next));
  }, []);

  const set = useCallback(<K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft, baseUpdatedAt: saved.updatedAt }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) window.location.href = '/admin/login';
        notify(SAVE_ERRORS[data.error] ?? 'ذخیره نشد. دوباره تلاش کنید.', 'error');
        return false;
      }
      setSaved(data);
      setDraft(data);
      notify('ذخیره شد و روی سایت منتشر شد.');
      return true;
    } catch {
      notify('ارتباط با سرور برقرار نشد.', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  }, [draft, saved.updatedAt, notify]);

  const discard = useCallback(() => setDraft(saved), [saved]);
  const replaceAll = useCallback((content: SiteContent) => { setSaved(content); setDraft(content); }, []);

  const value = useMemo(
    () => ({ draft, saved, dirty, saving, update, set, save, discard, replaceAll, notice, notify }),
    [draft, saved, dirty, saving, update, set, save, discard, replaceAll, notice, notify],
  );
  return <Store.Provider value={value}>{children}</Store.Provider>;
}

export function useAdmin() {
  const v = useContext(Store);
  if (!v) throw new Error('useAdmin must be used inside AdminStoreProvider');
  return v;
}

/** Shallow patch helper for editors: `patch(obj, onChange)('title')(value)`. */
export function patcher<T extends object>(value: T, onChange: (v: T) => void) {
  return <K extends keyof T>(key: K) => (v: T[K]) => onChange({ ...value, [key]: v });
}

export function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9؀-ۿ\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    .slice(0, 80);
}
