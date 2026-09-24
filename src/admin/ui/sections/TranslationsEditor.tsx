'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PlusIcon, SearchIcon, Undo2Icon } from 'lucide-react';
import { languages } from '../../../data/site';
import { useAdmin } from '../AdminStore';
import { Btn, Card, PageTitle, inputCls } from '../fields';

type Catalog = Record<string, string>;
const loaders: Record<string, () => Promise<{ default: Catalog }>> = {
  fa: () => import('../../../locales/fa.json'), ar: () => import('../../../locales/ar.json'), tr: () => import('../../../locales/tr.json'),
  de: () => import('../../../locales/de.json'), fr: () => import('../../../locales/fr.json'), es: () => import('../../../locales/es.json'),
  zh: () => import('../../../locales/zh.json'), ja: () => import('../../../locales/ja.json'), ru: () => import('../../../locales/ru.json'),
};
const PAGE = 50;

export function TranslationsEditor() {
  const { draft, set } = useAdmin();
  const [lang, setLang] = useState('fa');
  const [catalog, setCatalog] = useState<Catalog>({});
  const [query, setQuery] = useState('');
  const [onlyEdited, setOnlyEdited] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const overrides = draft.translations[lang] ?? {};
  const rtl = lang === 'fa' || lang === 'ar';

  useEffect(() => { let live = true; loaders[lang]().then((m) => live && setCatalog(m.default)); return () => { live = false; }; }, [lang]);
  useEffect(() => setLimit(PAGE), [lang, query, onlyEdited]);

  const setOverride = (key: string, value: string | null) => {
    const next = { ...overrides };
    if (value === null || value === '') delete next[key]; else next[key] = value;
    set('translations', { ...draft.translations, [lang]: next });
  };

  const rows = useMemo(() => {
    const keys = Array.from(new Set([...Object.keys(overrides), ...Object.keys(catalog)]));
    const q = query.trim().toLowerCase();
    return keys.filter((k) => {
      if (onlyEdited && !(k in overrides)) return false;
      return !q || k.toLowerCase().includes(q) || (catalog[k] ?? '').toLowerCase().includes(q) || (overrides[k] ?? '').toLowerCase().includes(q);
    });
  }, [catalog, overrides, query, onlyEdited]);

  return (
    <div className="grid gap-6">
      <PageTitle title="ترجمه‌ها" lead="سایت به انگلیسی نوشته شده و به ۹ زبان دیگر ترجمه می‌شود. هر ترجمه‌ای را که دقیق نیست اینجا اصلاح کنید؛ اصلاح شما همیشه بر ترجمه خودکار مقدم است. نام محصولات و اصطلاحات تخصصی عمداً ترجمه نمی‌شوند." />
      <div className="flex flex-wrap gap-1.5">
        {languages.filter((l) => l.code !== 'en').map((l) => (
          <button key={l.code} type="button" onClick={() => setLang(l.code)}
            className={`rounded-md px-3 py-1.5 text-[12.5px] ${lang === l.code ? 'bg-cyan/15 text-ink' : 'text-ink-faint hover:text-ink'}`}>
            {l.label}{draft.translations[l.code] && Object.keys(draft.translations[l.code]).length ? ` (${Object.keys(draft.translations[l.code]).length})` : ''}
          </button>
        ))}
      </div>

      <Card title="افزودن ترجمه برای متن جدید" hint="برای متنی که در فهرست نیست (مثلاً متنی که تازه به سایت اضافه کرده‌اید). متن انگلیسی را دقیقاً همان‌طور که روی سایت است بنویسید.">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input dir="ltr" className={inputCls} placeholder="English text" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
          <input dir={rtl ? 'rtl' : 'ltr'} className={inputCls} placeholder="ترجمه" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
          <Btn kind="primary" disabled={!newKey.trim() || !newValue.trim()} onClick={() => { setOverride(newKey.trim(), newValue.trim()); setNewKey(''); setNewValue(''); }}><PlusIcon className="h-4 w-4" />افزودن</Btn>
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[14rem] flex-1">
          <SearchIcon className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجو در متن انگلیسی یا ترجمه…" className={`${inputCls} ps-8`} />
        </div>
        <label className="flex items-center gap-2 text-[12.5px] text-ink-muted"><input type="checkbox" checked={onlyEdited} onChange={(e) => setOnlyEdited(e.target.checked)} className="accent-cyan" />فقط اصلاح‌شده‌ها</label>
        <span className="text-[12px] text-ink-faint">{rows.length} مورد</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-line">
        {rows.slice(0, limit).map((key) => {
          const edited = key in overrides;
          return (
            <div key={key} className={`grid gap-2 border-b border-line p-3 last:border-0 md:grid-cols-2 md:gap-4 ${edited ? 'bg-cyan/[0.04]' : 'bg-space-1/80'}`}>
              <div dir="ltr" className="text-left text-[13px] leading-6 text-ink-muted">{key}</div>
              <div className="flex items-start gap-2">
                <textarea dir={rtl ? 'rtl' : 'ltr'} rows={Math.min(4, Math.ceil(Math.max(key.length, 1) / 60))}
                  className={`${inputCls} resize-y text-[13px] ${edited ? 'border-cyan/40' : ''}`}
                  value={overrides[key] ?? catalog[key] ?? ''}
                  placeholder={catalog[key] ? '' : 'ترجمه خودکار'}
                  onChange={(e) => setOverride(key, e.target.value === catalog[key] ? null : e.target.value)} />
                {edited && <button type="button" title="بازگشت به ترجمه اصلی" onClick={() => setOverride(key, null)} className="mt-2 text-ink-faint hover:text-ink"><Undo2Icon className="h-4 w-4" /></button>}
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <div className="p-8 text-center text-[13px] text-ink-faint">موردی پیدا نشد.</div>}
      </div>
      {rows.length > limit && <div className="text-center"><Btn onClick={() => setLimit(limit + PAGE * 2)}>نمایش بیشتر ({rows.length - limit})</Btn></div>}
    </div>
  );
}
