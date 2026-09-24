'use client';

import React from 'react';
import { useAdmin } from '../AdminStore';
import { Area, Card, Grid, ListEditor, PageTitle, Select, Text } from '../fields';
import { ICONS } from './ProductsEditor';

export function SectionsEditor() {
  const { draft, set } = useAdmin();
  return (
    <div className="grid gap-6">
      <PageTitle title="بخش‌های صفحه اصلی" lead="مطالعات موردی، اکوسیستم، زنجیره هوش و لایه‌های هوش مصنوعی که در صفحه اصلی و صفحه فناوری نمایش داده می‌شوند. متن‌ها را انگلیسی بنویسید؛ ترجمه خودکار است." />

      <Card title="مطالعات موردی (Case studies)">
        <ListEditor label="موارد" items={draft.caseStudies} onChange={(v) => set('caseStudies', v)} itemTitle={(c) => c.title || c.client}
          make={() => ({ slug: `case-${Date.now()}`, client: '', sector: '', title: '', result: '', metric: '', metricLabel: '' })}
          render={(c, setC) => (
            <div className="grid gap-3">
              <Grid>
                <Text label="مشتری" value={c.client} onChange={(client) => setC({ ...c, client })} ltr />
                <Text label="حوزه" value={c.sector} onChange={(sector) => setC({ ...c, sector })} ltr />
              </Grid>
              <Text label="عنوان" value={c.title} onChange={(title) => setC({ ...c, title })} ltr />
              <Area label="نتیجه" value={c.result} onChange={(result) => setC({ ...c, result })} ltr rows={2} />
              <Grid>
                <Text label="عدد شاخص" value={c.metric} onChange={(metric) => setC({ ...c, metric })} ltr placeholder="-62%" />
                <Text label="برچسب عدد" value={c.metricLabel} onChange={(metricLabel) => setC({ ...c, metricLabel })} ltr />
              </Grid>
            </div>
          )} />
      </Card>

      <Card title="اکوسیستم">
        <ListEditor label="حوزه‌ها" items={draft.ecosystem} onChange={(v) => set('ecosystem', v)} itemTitle={(e) => e.title}
          make={() => ({ key: `k${Date.now()}`, code: '', title: '', body: '', icon: 'ai' })}
          render={(e, setE) => (
            <div className="grid gap-3">
              <Grid cols={3}>
                <Text label="کد کوتاه" value={e.code} onChange={(code) => setE({ ...e, code })} ltr />
                <Text label="عنوان" value={e.title} onChange={(title) => setE({ ...e, title })} ltr />
                <Select label="آیکون" value={e.icon} onChange={(icon) => setE({ ...e, icon })} options={ICONS} />
              </Grid>
              <Area label="توضیح" value={e.body} onChange={(body) => setE({ ...e, body })} ltr rows={2} />
            </div>
          )} />
      </Card>

      <Card title="زنجیره هوش (Intelligence chain)">
        <ListEditor label="مراحل" items={draft.intelligenceChain} onChange={(v) => set('intelligenceChain', v)} itemTitle={(s, i) => `${i + 1}. ${s.label}`}
          make={() => ({ label: '', detail: '' })}
          render={(s, setS) => (<Grid><Text label="عنوان" value={s.label} onChange={(label) => setS({ ...s, label })} ltr /><Text label="توضیح" value={s.detail} onChange={(detail) => setS({ ...s, detail })} ltr /></Grid>)} />
      </Card>

      <Card title="لایه‌های هوش مصنوعی">
        <ListEditor label="لایه‌ها" items={draft.aiLayers} onChange={(v) => set('aiLayers', v)} itemTitle={(l) => l.title}
          make={() => ({ title: '', body: '' })}
          render={(l, setL) => (<div className="grid gap-3"><Text label="عنوان" value={l.title} onChange={(title) => setL({ ...l, title })} ltr /><Area label="توضیح" value={l.body} onChange={(body) => setL({ ...l, body })} ltr rows={2} /></div>)} />
      </Card>
    </div>
  );
}
