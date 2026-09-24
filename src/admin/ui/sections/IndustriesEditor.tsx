'use client';

import React, { useState } from 'react';
import { ArrowRightIcon, ExternalLinkIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import type { IndustryEntry } from '../../../content/types';
import { patcher, slugify, useAdmin } from '../AdminStore';
import { Area, Btn, Card, Grid, ImageField, ListEditor, NumberInput, PageTitle, SeoFields, Select, StatusBadge, Tags, Text } from '../fields';
import { ICONS } from './ProductsEditor';

export function IndustriesEditor() {
  const { draft, set } = useAdmin();
  const [editing, setEditing] = useState<number | null>(null);
  const items = draft.industries;

  const add = () => {
    const order = Math.max(0, ...items.map((i) => i.order)) + 1;
    const blank: IndustryEntry = { slug: `new-industry-${order}`, name: 'New Industry', lead: '', body: '', icon: 'factory', systems: [], outcomes: [], image: '', status: 'draft', order, seo: { title: '', description: '', keywords: '', image: '' } };
    set('industries', [...items, blank]);
    setEditing(items.length);
  };

  if (editing !== null && items[editing]) {
    const ind = items[editing];
    const onChange = (v: IndustryEntry) => set('industries', items.map((x, j) => (j === editing ? v : x)));
    const p = patcher(ind, onChange);
    return (
      <div className="grid gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <Btn onClick={() => setEditing(null)}><ArrowRightIcon className="h-4 w-4 ltr:rotate-180" />همه صنایع</Btn>
          <div className="flex-1" />
          {ind.status !== 'draft' && <a href={`/industries/${ind.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-[13px] text-ink-muted hover:text-ink"><ExternalLinkIcon className="h-4 w-4" />مشاهده</a>}
          <Btn kind="danger" onClick={() => { if (confirm('حذف شود؟')) { set('industries', items.filter((_, j) => j !== editing)); setEditing(null); } }}><Trash2Icon className="h-4 w-4" />حذف</Btn>
        </div>
        <PageTitle title={ind.name} />
        <Card title="اطلاعات">
          <Grid>
            <Text label="نام" value={ind.name} onChange={p('name')} ltr />
            <Text label="نامک (slug)" value={ind.slug} onChange={(v) => p('slug')(slugify(v))} ltr hint={`/industries/${ind.slug}`} />
          </Grid>
          <Area label="جمله اصلی (lead)" value={ind.lead} onChange={p('lead')} ltr rows={2} />
          <Area label="توضیح" value={ind.body} onChange={p('body')} ltr rows={4} />
          <Grid cols={3}>
            <Select label="آیکون" value={ind.icon} onChange={p('icon')} options={ICONS} />
            <NumberInput label="ترتیب" value={ind.order} onChange={p('order')} />
            <Select label="وضعیت" value={ind.status} onChange={p('status')} options={[{ value: 'published', label: 'منتشر شده' }, { value: 'draft', label: 'پیش‌نویس' }]} />
          </Grid>
          <ImageField label="تصویر سربرگ صفحه این صنعت" value={ind.image} onChange={p('image')} folder={`industries/${ind.slug}`} hint="خالی = پس‌زمینه صفحه صنایع." />
          <Tags label="سیستم‌ها" value={ind.systems} onChange={p('systems')} />
          <ListEditor label="نتایج (اعداد)" items={ind.outcomes} onChange={p('outcomes')} make={() => ({ value: '', label: '' })}
            render={(o, setO) => (<Grid><Text label="عدد" value={o.value} onChange={(value) => setO({ ...o, value })} ltr /><Text label="برچسب" value={o.label} onChange={(label) => setO({ ...o, label })} ltr /></Grid>)} />
        </Card>
        <SeoFields value={ind.seo} onChange={p('seo')} path={`/industries/${ind.slug}`} fallbackTitle={ind.name} fallbackDescription={ind.lead} />
      </div>
    );
  }

  return (
    <div>
      <PageTitle title="صنایع" lead="صنایعی که سیمرغ برایشان راهکار دارد؛ هر کدام صفحه جداگانه دارد." actions={<Btn kind="primary" onClick={add}><PlusIcon className="h-4 w-4" />صنعت جدید</Btn>} />
      <div className="overflow-hidden rounded-xl border border-line">
        {items.map((ind, i) => ({ ind, i })).sort((a, b) => a.ind.order - b.ind.order).map(({ ind, i }) => (
          <button key={i} type="button" onClick={() => setEditing(i)} className="flex w-full items-center gap-4 border-b border-line bg-space-1/80 p-3.5 text-start last:border-0 hover:bg-space-2">
            <span className="w-6 text-[12px] tabular-nums text-ink-faint">{ind.order}</span>
            <span className="flex-1 truncate text-[14px] text-ink" dir="ltr">{ind.name}</span>
            <StatusBadge status={ind.status} />
          </button>
        ))}
      </div>
    </div>
  );
}
