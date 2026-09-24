'use client';

import React, { useEffect, useState } from 'react';
import { DownloadIcon, HistoryIcon } from 'lucide-react';
import type { Settings, SeoGlobal } from '../../../content/types';
import { patcher, useAdmin } from '../AdminStore';
import { Area, Btn, Card, Grid, ImageField, PageTitle, Text } from '../fields';

const SOCIAL: { key: keyof Settings['social']; label: string }[] = [
  { key: 'linkedin', label: 'LinkedIn' }, { key: 'instagram', label: 'Instagram' }, { key: 'telegram', label: 'Telegram' },
  { key: 'x', label: 'X (Twitter)' }, { key: 'youtube', label: 'YouTube' }, { key: 'aparat', label: 'Aparat' }, { key: 'github', label: 'GitHub' },
];

/** "content-2026-09-24T10-11-12-345Z.json" → a readable date. */
function backupDate(name: string) {
  const m = name.match(/content-(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})/);
  if (!m) return name;
  const d = new Date(`${m[1]}T${m[2]}:${m[3]}:${m[4]}Z`);
  return d.toLocaleString('fa-IR');
}

export function SettingsEditor() {
  const { draft, set, dirty, replaceAll, notify } = useAdmin();
  const s = patcher<Settings>(draft.settings, (v) => set('settings', v));
  const seo = patcher<SeoGlobal>(draft.seo, (v) => set('seo', v));
  const social = (k: keyof Settings['social']) => (v: string) => set('settings', { ...draft.settings, social: { ...draft.settings.social, [k]: v } });
  const verify = (k: keyof Settings['verification']) => (v: string) => set('settings', { ...draft.settings, verification: { ...draft.settings.verification, [k]: v.trim() } });
  const [backups, setBackups] = useState<string[] | null>(null);

  const loadBackups = () => fetch('/api/admin/backups').then((r) => (r.ok ? r.json() : [])).then(setBackups).catch(() => setBackups([]));
  useEffect(() => { loadBackups(); }, []);

  const restore = async (name: string) => {
    if (dirty && !confirm('تغییرات ذخیره‌نشده از بین می‌رود. ادامه می‌دهید؟')) return;
    if (!confirm(`سایت به نسخه ${backupDate(name)} برگردد؟ (نسخه فعلی هم به‌عنوان پشتیبان نگه داشته می‌شود)`)) return;
    const res = await fetch('/api/admin/backups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    if (!res.ok) { notify('بازگردانی انجام نشد.', 'error'); return; }
    replaceAll(await res.json());
    notify('نسخه قبلی بازگردانی و منتشر شد.');
    loadBackups();
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `simorgh-content-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  // Google verification: accept either the bare code or the whole <meta> tag.
  const metaCode = (v: string) => v.match(/content=["']([^"']+)["']/)?.[1] ?? v;

  return (
    <div className="grid gap-6">
      <PageTitle title="تنظیمات و سئو" />

      <Card title="اطلاعات سایت و تماس" hint="در پاورقی، صفحه تماس و داده‌های ساختاریافته گوگل (Organization) استفاده می‌شود.">
        <Grid>
          <Text label="نام سایت" value={draft.settings.siteName} onChange={s('siteName')} ltr />
          <Text label="نام حقوقی شرکت" value={draft.settings.legalName} onChange={s('legalName')} ltr />
          <Text label="آدرس اصلی سایت (دامنه)" value={draft.settings.siteUrl} onChange={s('siteUrl')} ltr placeholder="https://simorgh.tech"
            hint="بسیار مهم برای سئو: لینک‌های canonical، نقشه سایت و اشتراک‌گذاری از این آدرس ساخته می‌شوند." />
          <Text label="ایمیل" value={draft.settings.email} onChange={s('email')} ltr />
          <Text label="تلفن" value={draft.settings.phone} onChange={s('phone')} ltr />
          <Text label="آدرس" value={draft.settings.address} onChange={s('address')} />
        </Grid>
      </Card>

      <Card title="شبکه‌های اجتماعی" hint="لینک کامل صفحه. به گوگل کمک می‌کند این صفحه‌ها را به برند سیمرغ ربط دهد.">
        <Grid cols={3}>
          {SOCIAL.map(({ key, label }) => <Text key={key} label={label} value={draft.settings.social[key]} onChange={social(key)} ltr placeholder="https://" />)}
        </Grid>
      </Card>

      <Card title="سئوی کلی سایت">
        <Grid>
          <Text label="عنوان پیش‌فرض" value={draft.seo.defaultTitle} onChange={seo('defaultTitle')} max={65} />
          <Text label="قالب عنوان صفحات" value={draft.seo.titleTemplate} onChange={seo('titleTemplate')} ltr hint="%s جای عنوان هر صفحه می‌نشیند." />
        </Grid>
        <Area label="توضیح پیش‌فرض" value={draft.seo.description} onChange={seo('description')} max={160} />
        <Area label="کلمات کلیدی کلی" value={draft.seo.keywords} onChange={seo('keywords')} rows={2} hint="با کاما جدا کنید؛ فارسی و انگلیسی." />
        <Grid>
          <ImageField label="تصویر پیش‌فرض اشتراک‌گذاری" value={draft.seo.ogImage} onChange={seo('ogImage')} folder="seo" hint="۱۲۰۰×۶۳۰ پیکسل؛ وقتی لینک سایت در تلگرام، واتساپ یا لینکدین فرستاده می‌شود." />
          <Text label="حساب X (توییتر)" value={draft.seo.twitterHandle} onChange={seo('twitterHandle')} ltr placeholder="@simorgh" />
        </Grid>
      </Card>

      <Card title="ابزارهای گوگل و موتورهای جستجو" hint="کد تأیید را از Google Search Console (روش HTML tag)، Bing Webmaster و Yandex Webmaster بگیرید. می‌توانید کل تگ meta را هم بچسبانید.">
        <Grid>
          <Text label="Google Search Console" value={draft.settings.verification.google} onChange={(v) => verify('google')(metaCode(v))} ltr />
          <Text label="Bing Webmaster" value={draft.settings.verification.bing} onChange={(v) => verify('bing')(metaCode(v))} ltr />
          <Text label="Yandex Webmaster" value={draft.settings.verification.yandex} onChange={(v) => verify('yandex')(metaCode(v))} ltr />
          <Text label="Google Analytics 4" value={draft.settings.gaId} onChange={(v) => s('gaId')(v.trim())} ltr placeholder="G-XXXXXXXXXX" />
        </Grid>
        <p className="text-[12px] leading-6 text-ink-faint">
          بعد از تأیید در Search Console، نقشه سایت را ثبت کنید: <code dir="ltr" className="rounded bg-space-3 px-1.5">{(draft.settings.siteUrl || '').replace(/\/+$/, '')}/sitemap.xml</code>
        </p>
      </Card>

      <Card title="نسخه‌های پشتیبان" hint="هر بار ذخیره، نسخه قبلی نگه داشته می‌شود (۳۰ نسخه آخر)." actions={<Btn onClick={download}><DownloadIcon className="h-4 w-4" />دانلود کل محتوا (JSON)</Btn>}>
        {backups === null ? <p className="text-[13px] text-ink-faint">…</p> : backups.length === 0 ? <p className="text-[13px] text-ink-faint">هنوز نسخه پشتیبانی وجود ندارد.</p> : (
          <ul className="divide-y divide-line">
            {backups.map((b) => (
              <li key={b} className="flex items-center justify-between gap-3 py-2">
                <span className="text-[13px] text-ink-muted">{backupDate(b)}</span>
                <Btn small onClick={() => restore(b)}><HistoryIcon className="h-3.5 w-3.5" />بازگردانی</Btn>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
