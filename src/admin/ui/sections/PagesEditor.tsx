'use client';

import React, { useState } from 'react';
import type { PageContent, PageKey } from '../../../content/types';
import { useAdmin } from '../AdminStore';
import { Card, Grid, ImageField, PageTitle, SeoFields, Toggle } from '../fields';

export const PAGE_INFO: Record<PageKey, { label: string; path: string; story: string }> = {
  home: { label: 'صفحه اصلی', path: '/', story: 'تصویر «۲»: ربات‌ها و سیمرغ از دل زمین بیرون می‌آیند — دنیا به سمت رباتیک و هوش مصنوعی می‌رود و ما دوقلوی دیجیتال همان ربات را می‌سازیم. (تصویر بخش اول صفحه اصلی در «بخش اول صفحه اصلی» تنظیم می‌شود.)' },
  products: { label: 'محصولات', path: '/products', story: 'تصویر «۳۳»: نوری که از زمین بیرون می‌زند. پشت اسلایدر محصولات هم همین تصویر است.' },
  solutions: { label: 'راهکارها', path: '/solutions', story: 'تصویر «۳»: مرکز دنیا.' },
  industries: { label: 'صنایع', path: '/industries', story: 'صفحه آبی از نقطه‌های نورانی.' },
  technology: { label: 'فناوری', path: '/technology', story: 'صفحه آبی از نقطه‌های نورانی.' },
  insights: { label: 'مقالات (Insights)', path: '/insights', story: 'تصویر «۳۳» آینه‌شده: زمینی که بسته می‌شود.' },
  company: { label: 'درباره ما', path: '/company', story: 'تصویر «۴»: خود سیمرغ.' },
  contact: { label: 'تماس با ما', path: '/contact', story: 'صفحه آبی از نقطه‌های نورانی.' },
  requestDemo: { label: 'درخواست دمو', path: '/request-demo', story: 'تصویر «۳۳».' },
};

export function PagesEditor() {
  const { draft, set } = useAdmin();
  const [key, setKey] = useState<PageKey>('products');
  const page = draft.pages[key];
  const info = PAGE_INFO[key];
  const change = (v: PageContent) => set('pages', { ...draft.pages, [key]: v });

  return (
    <div>
      <PageTitle title="صفحات و پس‌زمینه‌ها" lead="هر تب سایت یک تصویر سربرگ (پس‌زمینه بالای صفحه) و تنظیمات سئوی خودش را دارد. ترتیب تصویرها داستان سایت را روایت می‌کند." />
      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(PAGE_INFO) as PageKey[]).map((k) => (
          <button key={k} type="button" onClick={() => setKey(k)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] transition-colors ${k === key ? 'border-cyan/50 bg-cyan/10 text-ink' : 'border-line text-ink-muted hover:text-ink'}`}>
            {draft.pages[k].heroImage
              ? <img src={draft.pages[k].heroImage} alt="" className={`h-6 w-9 rounded object-cover ${draft.pages[k].heroFlip ? '-scale-y-100' : ''}`} />
              : <span className="h-6 w-9 rounded border border-dashed border-line" />}
            {PAGE_INFO[k].label}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        <Card title={`پس‌زمینه «${info.label}»`} hint={info.story}>
          <Grid>
            <ImageField label="تصویر سربرگ" value={page.heroImage} onChange={(v) => change({ ...page, heroImage: v })} folder="backgrounds"
              hint="عکس افقی و تیره با کیفیت بالا (حداقل ۱۹۲۰ پیکسل عرض). اگر خالی باشد، فقط آسمان پرستاره نمایش داده می‌شود." />
            <div className="grid content-start gap-4">
              <Toggle label="آینه عمودی تصویر" hint="برای «زمینی که بسته می‌شود» — تصویر وارونه می‌شود." checked={!!page.heroFlip} onChange={(v) => change({ ...page, heroFlip: v })} />
              {page.heroImage && (
                <div className="relative aspect-[21/9] overflow-hidden rounded-lg border border-line">
                  <img src={page.heroImage} alt="" className={`absolute inset-0 h-full w-full object-cover opacity-70 ${page.heroFlip ? '-scale-y-100' : ''}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-space-0 via-space-0/40 to-transparent" />
                  <div className="absolute bottom-3 start-4 text-[15px] font-semibold text-ink">پیش‌نمایش سربرگ</div>
                </div>
              )}
            </div>
          </Grid>
        </Card>
        <SeoFields value={page.seo} onChange={(seo) => change({ ...page, seo })} path={info.path}
          fallbackTitle={info.label} fallbackDescription={draft.seo.description} titleTemplate={draft.seo.titleTemplate} />
      </div>
    </div>
  );
}
