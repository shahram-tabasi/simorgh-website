'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRightIcon, CopyIcon, ExternalLinkIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import type { ProductEntry } from '../../../content/types';
import type { DomainKey } from '../../../types/content';
import { iconNames } from '../../../components/ui/Icon';
import { patcher, slugify, useAdmin } from '../AdminStore';
import { Area, Btn, Card, Grid, ImageField, ListEditor, NumberInput, PageTitle, SeoFields, Select, StatusBadge, Tags, Text, Toggle } from '../fields';

export const DOMAINS: { value: DomainKey; label: string }[] = [
  { value: 'engineering', label: 'مهندسی و اتوماسیون' },
  { value: 'grid', label: 'شبکه برق و انرژی' },
  { value: 'twin', label: 'دوقلوی دیجیتال' },
  { value: 'enterprise', label: 'سازمانی / کسب‌وکار' },
  { value: 'ai', label: 'هوش مصنوعی' },
  { value: 'cloud', label: 'ابر و زیرساخت' },
];

export const ICONS = iconNames.map((n) => ({ value: n, label: n }));

function blankProduct(order: number): ProductEntry {
  return {
    slug: `new-product-${order}`, name: 'SIMORGH New Product', short: 'New Product', domain: 'engineering', icon: 'ai',
    tagline: '', summary: '', capabilities: [], industries: [], pipeline: [], metrics: [], faq: [],
    image: '', accent: '', headerImage: '', gallery: [], schematics: [], status: 'draft', order,
    seo: { title: '', description: '', keywords: '', image: '' },
  };
}

export function ProductsEditor() {
  const { draft, set } = useAdmin();
  const [editing, setEditing] = useState<number | null>(null);
  const products = draft.products;
  const sorted = products.map((p, i) => ({ p, i })).sort((a, b) => a.p.order - b.p.order);

  const add = () => {
    const order = Math.max(0, ...products.map((p) => p.order)) + 1;
    set('products', [...products, blankProduct(order)]);
    setEditing(products.length);
  };

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('new')) { add(); window.history.replaceState(null, '', '/admin/products'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (editing !== null && products[editing]) {
    return (
      <ProductForm
        product={products[editing]}
        onBack={() => setEditing(null)}
        onChange={(v) => set('products', products.map((p, j) => (j === editing ? v : p)))}
        onDelete={() => {
          if (!confirm(`«${products[editing].short}» حذف شود؟ (بعد از ذخیره قابل برگشت از پشتیبان‌ها است)`)) return;
          set('products', products.filter((_, j) => j !== editing));
          setEditing(null);
        }}
        onDuplicate={() => {
          const src = products[editing];
          const copy = { ...structuredClone(src), slug: `${src.slug}-copy`, name: `${src.name} (copy)`, status: 'draft' as const, order: src.order + 0.5 };
          set('products', [...products, copy]);
          setEditing(products.length);
        }}
      />
    );
  }

  return (
    <div>
      <PageTitle title="محصولات" lead="محصولات به همین ترتیب در اسلایدر صفحه محصولات، منو و صفحه اصلی نمایش داده می‌شوند. محصول «پیش‌نویس» روی سایت دیده نمی‌شود."
        actions={<Btn kind="primary" onClick={add}><PlusIcon className="h-4 w-4" />محصول جدید</Btn>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map(({ p, i }) => (
          <button key={i} type="button" onClick={() => setEditing(i)} className="group overflow-hidden rounded-xl border border-line bg-space-1/80 text-start transition-colors hover:border-cyan/40">
            <div className="relative aspect-[16/9] bg-space-2">
              {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[12px] text-ink-faint">بدون بنر</div>}
              <span className="absolute start-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] tabular-nums text-ink">{p.order}</span>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2"><span className="truncate font-semibold text-ink" dir="ltr">{p.short}</span><StatusBadge status={p.status} /></div>
              <div className="mt-1 line-clamp-2 text-[12px] leading-5 text-ink-faint" dir="auto">{p.tagline || '—'}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductForm({ product, onChange, onBack, onDelete, onDuplicate }: {
  product: ProductEntry; onChange: (p: ProductEntry) => void; onBack: () => void; onDelete: () => void; onDuplicate: () => void;
}) {
  const p = patcher(product, onChange);
  const folder = `products/${product.slug}`;
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Btn onClick={onBack}><ArrowRightIcon className="h-4 w-4 ltr:rotate-180" />همه محصولات</Btn>
        <div className="flex-1" />
        {product.status !== 'draft' && <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-[13px] text-ink-muted hover:text-ink"><ExternalLinkIcon className="h-4 w-4" />مشاهده</a>}
        <Btn onClick={onDuplicate}><CopyIcon className="h-4 w-4" />کپی</Btn>
        <Btn kind="danger" onClick={onDelete}><Trash2Icon className="h-4 w-4" />حذف</Btn>
      </div>
      <PageTitle title={product.short || 'محصول'} lead="متن‌ها را به انگلیسی بنویسید؛ سایت خودش آن‌ها را به ۹ زبان دیگر ترجمه می‌کند (نام محصولات و اصطلاحات تخصصی ترجمه نمی‌شوند)." />

      <Card title="اطلاعات اصلی">
        <Grid>
          <Text label="نام کامل" value={product.name} onChange={p('name')} ltr />
          <Text label="نام کوتاه (منو و اسلایدر)" value={product.short} onChange={p('short')} ltr />
          <Text label="نامک (slug) — آدرس صفحه" value={product.slug} onChange={(v) => p('slug')(slugify(v))} ltr hint={`آدرس: /products/${product.slug}  —  بعد از انتشار تغییرش ندهید تا لینک‌ها خراب نشوند.`} />
          <Text label="خط بالای نام در اسلایدر (accent)" value={product.accent} onChange={p('accent')} ltr placeholder="SMART GRID & ENERGY INTELLIGENCE" />
        </Grid>
        <Text label="شعار کوتاه (tagline)" value={product.tagline} onChange={p('tagline')} ltr max={120} />
        <Area label="خلاصه / توضیح محصول" value={product.summary} onChange={p('summary')} rows={4} ltr max={400} />
        <Grid cols={4}>
          <Select label="حوزه" value={product.domain} onChange={p('domain')} options={DOMAINS} />
          <Select label="آیکون" value={product.icon} onChange={p('icon')} options={ICONS} />
          <NumberInput label="ترتیب نمایش" value={product.order} onChange={p('order')} step={1} />
          <Select label="وضعیت" value={product.status} onChange={p('status')} options={[{ value: 'published', label: 'منتشر شده' }, { value: 'draft', label: 'پیش‌نویس' }]} />
        </Grid>
        <Toggle label="محصول ویژه" hint="در صفحه اصلی برجسته‌تر نمایش داده می‌شود." checked={!!product.featured} onChange={p('featured')} />
      </Card>

      <Card title="تصاویر" hint={`پیشنهاد: فایل‌ها در پوشه ${folder} بارگذاری شوند.`}>
        <Grid>
          <ImageField label="بنر (کارت اسلایدر محصولات)" value={product.image} onChange={p('image')} folder={folder} hint="افقی ۱۶:۹، حداقل ۱۶۰۰×۹۰۰." />
          <ImageField label="تصویر سربرگ صفحه محصول" value={product.headerImage} onChange={p('headerImage')} folder={folder} hint="خالی = همان بنر." />
        </Grid>
      </Card>

      <Card title="گالری عکس" hint="اسکرین‌شات‌ها و عکس‌های محصول. اگر خالی باشد، بخش گالری نمایش داده نمی‌شود.">
        <ListEditor label="عکس‌ها" items={product.gallery} onChange={p('gallery')} make={() => ''} addLabel="افزودن عکس"
          render={(src, setSrc, i) => <ImageField label={`عکس ${i + 1}`} value={src} onChange={setSrc} folder={`${folder}/gallery`} aspect="aspect-[16/9] max-h-48" />} />
      </Card>

      <Card title="شماتیک‌ها و نقشه‌ها" hint={`دیاگرام‌ها، نقشه‌های تک‌خطی و شماتیک‌ها با توضیح زیر هر کدام. مسیر پیشنهادی: ${folder}/schematics — عکس (PNG/WebP) یا PDF. اگر خالی باشد، این بخش نمایش داده نمی‌شود.`}>
        <ListEditor label="شماتیک‌ها" items={product.schematics} onChange={p('schematics')} make={() => ({ src: '', caption: '' })} addLabel="افزودن شماتیک"
          render={(s, setS, i) => (
            <Grid>
              <ImageField label={`شماتیک ${i + 1}`} value={s.src} onChange={(src) => setS({ ...s, src })} folder={`${folder}/schematics`} accept="any" aspect="aspect-[4/3] max-h-48" />
              <Area label="توضیح زیر تصویر" value={s.caption} onChange={(caption) => setS({ ...s, caption })} ltr rows={3} />
            </Grid>
          )} />
      </Card>

      <Card title="قابلیت‌ها">
        <ListEditor label="قابلیت‌ها" items={product.capabilities} onChange={p('capabilities')} make={() => ({ title: '', body: '' })} itemTitle={(c) => c.title || 'قابلیت'}
          render={(c, setC) => (<div className="grid gap-3"><Text label="عنوان" value={c.title} onChange={(title) => setC({ ...c, title })} ltr /><Area label="توضیح" value={c.body} onChange={(body) => setC({ ...c, body })} ltr rows={2} /></div>)} />
      </Card>

      <Card title="روند کار (pipeline) و اعداد کلیدی">
        <ListEditor label="مراحل" items={product.pipeline} onChange={p('pipeline')} make={() => ({ label: '', detail: '' })} itemTitle={(s, i) => `${i + 1}. ${s.label}`}
          render={(s, setS) => (<Grid><Text label="مرحله" value={s.label} onChange={(label) => setS({ ...s, label })} ltr /><Text label="جزئیات" value={s.detail} onChange={(detail) => setS({ ...s, detail })} ltr /></Grid>)} />
        <ListEditor label="اعداد کلیدی" items={product.metrics} onChange={p('metrics')} make={() => ({ value: '', label: '' })} itemTitle={(m) => `${m.value} ${m.label}`}
          render={(m, setM) => (<Grid><Text label="عدد" value={m.value} onChange={(value) => setM({ ...m, value })} ltr placeholder="80%" /><Text label="برچسب" value={m.label} onChange={(label) => setM({ ...m, label })} ltr /></Grid>)} />
        <Tags label="صنایع مرتبط" value={product.industries} onChange={p('industries')} />
      </Card>

      <Card title="سوالات متداول (FAQ)" hint="در گوگل به‌صورت نتیجه غنی (FAQ) نمایش داده می‌شود — برای سئو بسیار مفید است.">
        <ListEditor label="سوال‌ها" items={product.faq} onChange={p('faq')} make={() => ({ q: '', a: '' })} itemTitle={(f) => f.q || 'سوال'}
          render={(f, setF) => (<div className="grid gap-3"><Text label="سوال" value={f.q} onChange={(q) => setF({ ...f, q })} ltr /><Area label="پاسخ" value={f.a} onChange={(a) => setF({ ...f, a })} ltr rows={3} /></div>)} />
      </Card>

      <SeoFields value={product.seo} onChange={p('seo')} path={`/products/${product.slug}`} fallbackTitle={product.name} fallbackDescription={product.summary} />
    </div>
  );
}
