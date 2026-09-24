'use client';

import React from 'react';
import { MediaBrowser } from '../MediaPicker';
import { Card, PageTitle } from '../fields';

export function MediaEditor() {
  return (
    <div className="grid gap-6">
      <PageTitle title="کتابخانه رسانه" lead="همه عکس‌ها، ویدئوها و PDFهای سایت. فایل‌های بارگذاری‌شده بلافاصله با آدرس /media/… در دسترس‌اند و نیازی به build دوباره نیست." />
      <Card title="قرارداد پوشه‌ها" hint="برای نظم بهتر، فایل‌ها را در این پوشه‌ها بارگذاری کنید (در فیلد «پوشه مقصد»):">
        <ul dir="ltr" className="grid gap-1 overflow-x-auto whitespace-pre text-left font-mono text-[12px] text-ink-muted">
          <li>backgrounds/                     <span className="text-ink-faint">— page header backgrounds</span></li>
          <li>products/&lt;slug&gt;/                <span className="text-ink-faint">— banner, header image</span></li>
          <li>products/&lt;slug&gt;/gallery/        <span className="text-ink-faint">— screenshots</span></li>
          <li>products/&lt;slug&gt;/schematics/     <span className="text-ink-faint">— diagrams, SLDs, schematics (PNG / WebP / PDF)</span></li>
          <li>articles/&lt;slug&gt;/                <span className="text-ink-faint">— article cover and images</span></li>
          <li>industries/&lt;slug&gt;/ · seo/        <span className="text-ink-faint">— industry headers, share images</span></li>
        </ul>
        <p className="text-[12px] leading-6 text-ink-faint">روی سرور این فایل‌ها در <code dir="ltr">storage/uploads/</code> ذخیره می‌شوند؛ از این پوشه نسخه پشتیبان بگیرید.</p>
      </Card>
      <MediaBrowser />
    </div>
  );
}
