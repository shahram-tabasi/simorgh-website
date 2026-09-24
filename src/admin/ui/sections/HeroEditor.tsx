'use client';

import React, { useState } from 'react';
import { languages } from '../../../data/site';
import type { HeroContent, HeroText } from '../../../content/types';
import { patcher, useAdmin } from '../AdminStore';
import { Area, Card, Field, Grid, ImageField, PageTitle, Text } from '../fields';

const EMPTY: HeroText = { eyebrow: '', headline: '', accent: '', subtitle: '', primary: '', secondary: '', kicker: '' };

export function HeroEditor() {
  const { draft, set } = useAdmin();
  const hero = draft.hero;
  const change = (v: HeroContent) => set('hero', v);
  const p = patcher(hero, change);
  const [lang, setLang] = useState('fa');
  const text = hero.text[lang] ?? EMPTY;
  const setText = (k: keyof HeroText) => (v: string) => change({ ...hero, text: { ...hero.text, [lang]: { ...text, [k]: v } } });
  const rtl = lang === 'fa' || lang === 'ar';

  return (
    <div className="grid gap-6">
      <PageTitle title="بخش اول صفحه اصلی" lead="اولین چیزی که بازدیدکننده می‌بیند: تصویر یا ویدئوی تمام‌صفحه، شعار و دکمه‌ها. شعار ما: دنیا به سمت رباتیک و هوش مصنوعی می‌رود؛ سیمرغ دوقلوی دیجیتال همان ربات را می‌سازد." />

      <Card title="تصویر پس‌زمینه">
        <Grid>
          <ImageField label="تصویر یا ویدئو (دسکتاپ)" value={hero.image} onChange={p('image')} folder="backgrounds" accept="any"
            hint="عکس افقی ۱۹۲۰ پیکسل یا بیشتر، یا ویدئوی کوتاه MP4/WebM بی‌صدا." />
          <ImageField label="تصویر موبایل (اختیاری)" value={hero.mobileImage} onChange={p('mobileImage')} folder="backgrounds" aspect="aspect-[3/4] max-h-72"
            hint="خالی = همان تصویر دسکتاپ." />
        </Grid>
        <Grid cols={3}>
          <Field label={`تیرگی روی تصویر: ${Math.round(hero.overlay * 100)}٪`} hint="برای خوانایی بهتر متن.">
            <input type="range" min={0} max={0.65} step={0.01} value={hero.overlay} onChange={(e) => p('overlay')(Number(e.target.value))} className="w-full accent-cyan" />
          </Field>
          <Text label="نقطه تمرکز تصویر" value={hero.focal} onChange={p('focal')} ltr hint="مثلاً 50% 40% (افقی عمودی)" />
          <div />
          <Text label="لینک دکمه اول" value={hero.primaryTo} onChange={p('primaryTo')} ltr />
          <Text label="لینک دکمه دوم" value={hero.secondaryTo} onChange={p('secondaryTo')} ltr />
        </Grid>
      </Card>

      <Card title="متن‌ها" hint="برای هر زبان جدا. اگر زبانی خالی باشد، متن انگلیسی نمایش داده می‌شود.">
        <div className="flex flex-wrap gap-1.5">
          {languages.map((l) => (
            <button key={l.code} type="button" onClick={() => setLang(l.code)}
              className={`rounded-md px-3 py-1.5 text-[12.5px] ${lang === l.code ? 'bg-cyan/15 text-ink' : 'text-ink-faint hover:text-ink'}`}>{l.label}</button>
          ))}
        </div>
        <div dir={rtl ? 'rtl' : 'ltr'} className="grid gap-4">
          <Grid>
            <Text label="خط بالای عنوان (eyebrow)" value={text.eyebrow} onChange={setText('eyebrow')} />
            <Text label="خط پایانی (kicker)" value={text.kicker} onChange={setText('kicker')} />
            <Text label="عنوان" value={text.headline} onChange={setText('headline')} />
            <Text label="بخش رنگی عنوان" value={text.accent} onChange={setText('accent')} />
          </Grid>
          <Area label="زیرعنوان" value={text.subtitle} onChange={setText('subtitle')} rows={3} />
          <Grid>
            <Text label="متن دکمه اول" value={text.primary} onChange={setText('primary')} />
            <Text label="متن دکمه دوم" value={text.secondary} onChange={setText('secondary')} />
          </Grid>
        </div>

        <div className="relative mt-2 overflow-hidden rounded-lg border border-line">
          {hero.image && !/\.(mp4|webm)$/i.test(hero.image) && <img src={hero.image} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: hero.focal }} />}
          {hero.image && /\.(mp4|webm)$/i.test(hero.image) && <video src={hero.image} muted autoPlay loop playsInline className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-space-0" style={{ opacity: hero.overlay + 0.35 }} />
          <div dir={rtl ? 'rtl' : 'ltr'} className="relative px-8 py-12">
            <div className="text-[10.5px] tracking-[0.2em] text-cyan">{text.eyebrow}</div>
            <div className="mt-3 max-w-xl text-[26px] font-bold leading-tight text-ink">{text.headline} <span className="text-cyan-soft">{text.accent}</span></div>
            <p className="mt-3 max-w-lg text-[13px] leading-6 text-ink-muted">{text.subtitle}</p>
            <div className="mt-5 flex gap-2">
              {text.primary && <span className="rounded bg-cyan px-3 py-1.5 text-[12px] text-space-0">{text.primary}</span>}
              {text.secondary && <span className="rounded border border-line px-3 py-1.5 text-[12px] text-ink">{text.secondary}</span>}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
