'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangleIcon, CheckCircle2Icon, PlusIcon } from 'lucide-react';
import { useAdmin } from '../AdminStore';
import { Card, PageTitle } from '../fields';
import { PAGE_INFO } from './PagesEditor';

interface Submission { id: string; type: string; createdAt: string; status: string; fields: Record<string, string> }

export function Dashboard() {
  const { draft: c } = useAdmin();
  const [requests, setRequests] = useState<Submission[] | null>(null);
  useEffect(() => { fetch('/api/admin/requests').then((r) => (r.ok ? r.json() : [])).then(setRequests).catch(() => setRequests([])); }, []);

  const live = <T extends { status?: string }>(xs: T[]) => xs.filter((x) => x.status !== 'draft').length;
  const stats = [
    { label: 'محصول منتشرشده', value: live(c.products), href: '/admin/products' },
    { label: 'مقاله منتشرشده', value: live(c.articles), href: '/admin/articles' },
    { label: 'صنعت', value: live(c.industries), href: '/admin/industries' },
    { label: 'پیام جدید', value: requests ? requests.filter((r) => r.status === 'new').length : '…', href: '/admin/requests' },
  ];

  // What still keeps the site from its best search ranking.
  const issues: { text: string; href: string }[] = [];
  if (!c.settings.siteUrl || c.settings.siteUrl.includes('localhost')) issues.push({ text: 'آدرس اصلی سایت (دامنه) تنظیم نشده است.', href: '/admin/settings' });
  if (!c.settings.verification.google) issues.push({ text: 'کد تأیید Google Search Console وارد نشده است.', href: '/admin/settings' });
  if (!c.settings.gaId) issues.push({ text: 'Google Analytics وصل نیست.', href: '/admin/settings' });
  for (const [key, info] of Object.entries(PAGE_INFO)) {
    const p = c.pages[key as keyof typeof c.pages];
    if (!p.seo.description) issues.push({ text: `صفحه «${info.label}» توضیح متا ندارد.`, href: '/admin/pages' });
  }
  for (const p of c.products) {
    if (p.status === 'draft') continue;
    if (!p.image) issues.push({ text: `محصول «${p.short}» بنر ندارد.`, href: '/admin/products' });
  }
  for (const a of c.articles) {
    if (a.status === 'draft') continue;
    if (!a.body.trim()) issues.push({ text: `مقاله «${a.title}» متن کامل ندارد؛ فقط خلاصه نمایش داده می‌شود.`, href: '/admin/articles' });
    if (!a.cover) issues.push({ text: `مقاله «${a.title}» تصویر کاور ندارد.`, href: '/admin/articles' });
  }

  return (
    <div className="grid gap-6">
      <PageTitle title="داشبورد" lead="همه بخش‌های سایت از این پنل قابل ویرایش است. بعد از هر تغییر، «ذخیره و انتشار» را بزنید تا بلافاصله روی سایت اعمال شود؛ نیازی به build دوباره نیست."
        actions={<>
          <Link href="/admin/articles?new=1" className="inline-flex items-center gap-1.5 rounded-md bg-cyan px-4 py-2 text-[13px] font-medium text-space-0 hover:bg-cyan-soft"><PlusIcon className="h-4 w-4" />مقاله جدید</Link>
          <Link href="/admin/products?new=1" className="inline-flex items-center gap-1.5 rounded-md border border-line px-4 py-2 text-[13px] text-ink-muted hover:text-ink"><PlusIcon className="h-4 w-4" />محصول جدید</Link>
        </>} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-xl border border-line bg-space-1/80 p-5 transition-colors hover:border-cyan/40">
            <div className="text-[28px] font-bold tabular-nums text-ink">{s.value}</div>
            <div className="mt-1 text-[12.5px] text-ink-faint">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="چک‌لیست سئو" hint="مواردی که هنوز جای بهتر شدن دارند.">
          {issues.length === 0 ? (
            <p className="flex items-center gap-2 text-[13px] text-cyan"><CheckCircle2Icon className="h-4 w-4" />همه موارد کامل است.</p>
          ) : (
            <ul className="grid gap-2">
              {issues.slice(0, 14).map((i, n) => (
                <li key={n}><Link href={i.href} className="flex items-start gap-2 text-[13px] leading-6 text-ink-muted hover:text-ink">
                  <AlertTriangleIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-gold" />{i.text}
                </Link></li>
              ))}
              {issues.length > 14 && <li className="text-[12px] text-ink-faint">و {issues.length - 14} مورد دیگر…</li>}
            </ul>
          )}
        </Card>

        <Card title="آخرین پیام‌ها" actions={<Link href="/admin/requests" className="text-[12px] text-cyan hover:underline">همه</Link>}>
          {requests === null ? <p className="text-[13px] text-ink-faint">…</p>
            : requests.length === 0 ? <p className="text-[13px] text-ink-faint">هنوز پیامی نرسیده است.</p>
              : (
                <ul className="divide-y divide-line">
                  {requests.slice(0, 6).map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                      <span className="min-w-0 truncate text-ink">{r.fields.name || r.fields.email} <span className="text-ink-faint">· {r.fields.organisation || r.fields.company || ''}</span></span>
                      <span className="shrink-0 text-[11.5px] text-ink-faint">{r.type === 'demo' ? 'دمو' : 'تماس'} · {new Date(r.createdAt).toLocaleDateString('fa-IR')}</span>
                    </li>
                  ))}
                </ul>
              )}
        </Card>
      </div>

      <Card title="راهنمای سریع">
        <ul className="grid gap-2 text-[13px] leading-7 text-ink-muted">
          <li>• <b className="text-ink">پس‌زمینه‌ها:</b> در «صفحات و پس‌زمینه‌ها» برای هر تب سایت یک تصویر سربرگ و سئوی جدا تعیین کنید.</li>
          <li>• <b className="text-ink">محصولات:</b> بنر اسلایدر، تصویر سربرگ، گالری عکس، شماتیک‌ها، ویژگی‌ها و سوالات متداول هر محصول.</li>
          <li>• <b className="text-ink">مقالات:</b> متن را با Markdown بنویسید؛ عکس و ویدئو (فایل، یوتیوب یا آپارات) هم پشتیبانی می‌شود.</li>
          <li>• <b className="text-ink">ترجمه:</b> متن‌ها به‌صورت خودکار به ۹ زبان ترجمه می‌شوند؛ هر ترجمه‌ای را که دوست ندارید در «ترجمه‌ها» اصلاح کنید.</li>
          <li>• <b className="text-ink">پشتیبان:</b> هر ذخیره یک نسخه پشتیبان می‌سازد؛ از «تنظیمات» می‌توانید به نسخه قبلی برگردید.</li>
        </ul>
      </Card>
    </div>
  );
}
