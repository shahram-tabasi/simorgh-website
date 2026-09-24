'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DownloadIcon, MailIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react';
import { Btn, Card, PageTitle, inputCls } from '../fields';

interface Submission { id: string; type: 'contact' | 'demo'; createdAt: string; status: 'new' | 'contacted' | 'qualified' | 'closed'; fields: Record<string, string>; note?: string }

const STATUS = { new: 'جدید', contacted: 'تماس گرفته شد', qualified: 'مشتری بالقوه', closed: 'بسته شد' } as const;
const STATUS_CLS = { new: 'bg-gold/15 text-gold', contacted: 'bg-blue/20 text-blue-soft', qualified: 'bg-cyan/15 text-cyan', closed: 'bg-space-3 text-ink-faint' } as const;
const LABELS: Record<string, string> = {
  name: 'نام', firstName: 'نام', lastName: 'نام خانوادگی', email: 'ایمیل', phone: 'تلفن', company: 'شرکت', organisation: 'سازمان',
  position: 'سمت', country: 'کشور', product: 'محصول', industry: 'صنعت', message: 'پیام', kind: 'موضوع',
};

export function RequestsInbox() {
  const [items, setItems] = useState<Submission[] | null>(null);
  const [filter, setFilter] = useState<'all' | 'contact' | 'demo' | 'new'>('all');
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/requests', { cache: 'no-store' });
    setItems(res.ok ? await res.json() : []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const patch = async (body: Record<string, unknown>) => {
    const res = await fetch('/api/admin/requests', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) setItems(await res.json());
  };

  const visible = useMemo(() => (items ?? []).filter((i) => filter === 'all' || (filter === 'new' ? i.status === 'new' : i.type === filter)), [items, filter]);

  const exportCsv = () => {
    const keys = Array.from(new Set((items ?? []).flatMap((i) => Object.keys(i.fields))));
    const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['date', 'type', 'status', ...keys, 'note'], ...(items ?? []).map((i) => [i.createdAt, i.type, i.status, ...keys.map((k) => i.fields[k] ?? ''), i.note ?? ''])];
    const blob = new Blob(['﻿' + rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `simorgh-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div>
      <PageTitle title="پیام‌ها و درخواست‌های دمو" lead="هر پیامی که از فرم «تماس با ما» یا «درخواست دمو» ارسال شود اینجا ثبت می‌شود."
        actions={<><Btn onClick={load}><RefreshCwIcon className="h-4 w-4" />تازه‌سازی</Btn><Btn onClick={exportCsv} disabled={!items?.length}><DownloadIcon className="h-4 w-4" />خروجی Excel (CSV)</Btn></>} />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {([['all', 'همه'], ['new', 'جدید'], ['demo', 'درخواست دمو'], ['contact', 'تماس']] as const).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setFilter(k)} className={`rounded-md px-3 py-1.5 text-[12.5px] ${filter === k ? 'bg-space-3 text-ink' : 'text-ink-faint hover:text-ink'}`}>{l}</button>
        ))}
      </div>

      {items === null ? <p className="text-[13px] text-ink-faint">در حال بارگذاری…</p> : visible.length === 0 ? (
        <Card><p className="py-6 text-center text-[13px] text-ink-faint">پیامی نیست.</p></Card>
      ) : (
        <div className="grid gap-2">
          {visible.map((r) => (
            <div key={r.id} className="overflow-hidden rounded-xl border border-line bg-space-1/80">
              <button type="button" onClick={() => setOpen(open === r.id ? null : r.id)} className="flex w-full flex-wrap items-center gap-3 p-4 text-start hover:bg-space-2">
                <span className={`rounded px-2 py-0.5 text-[11px] ${STATUS_CLS[r.status]}`}>{STATUS[r.status]}</span>
                <span className="text-[11.5px] text-ink-faint">{r.type === 'demo' ? 'درخواست دمو' : 'تماس'}</span>
                <span className="min-w-0 flex-1 truncate text-[14px] text-ink" dir="auto">{r.fields.name || [r.fields.firstName, r.fields.lastName].filter(Boolean).join(' ')} <span className="text-ink-faint">{r.fields.company || r.fields.organisation ? `· ${r.fields.company || r.fields.organisation}` : ''}</span></span>
                <span className="text-[11.5px] text-ink-faint">{new Date(r.createdAt).toLocaleString('fa-IR')}</span>
              </button>
              {open === r.id && (
                <div className="grid gap-4 border-t border-line p-4">
                  <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                    {Object.entries(r.fields).map(([k, v]) => v && (
                      <div key={k} className={k === 'message' ? 'sm:col-span-2' : ''}>
                        <dt className="text-[11.5px] text-ink-faint">{LABELS[k] ?? k}</dt>
                        <dd dir="auto" className="whitespace-pre-wrap text-[13.5px] leading-7 text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <textarea className={`${inputCls} text-[13px]`} rows={2} placeholder="یادداشت داخلی…" defaultValue={r.note ?? ''} onBlur={(e) => e.target.value !== (r.note ?? '') && patch({ id: r.id, note: e.target.value })} />
                  <div className="flex flex-wrap items-center gap-2">
                    {(Object.keys(STATUS) as Submission['status'][]).map((s) => (
                      <button key={s} type="button" onClick={() => patch({ id: r.id, status: s })} className={`rounded-md border px-2.5 py-1 text-[12px] ${r.status === s ? 'border-cyan/50 text-ink' : 'border-line text-ink-faint hover:text-ink'}`}>{STATUS[s]}</button>
                    ))}
                    <div className="flex-1" />
                    {r.fields.email && <a href={`mailto:${r.fields.email}`} className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-[12px] text-ink-muted hover:text-ink"><MailIcon className="h-3.5 w-3.5" />پاسخ با ایمیل</a>}
                    <Btn small kind="danger" onClick={() => confirm('حذف شود؟') && patch({ id: r.id, remove: true })}><Trash2Icon className="h-3.5 w-3.5" />حذف</Btn>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
