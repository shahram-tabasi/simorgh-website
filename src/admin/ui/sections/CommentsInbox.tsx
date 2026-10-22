'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckIcon, EyeOffIcon, ExternalLinkIcon, HeartIcon, MailIcon, PinIcon, RefreshCwIcon, SendIcon, Trash2Icon } from 'lucide-react';
import { Btn, Card, PageTitle, Select, Toggle, inputCls } from '../fields';
import { useAdmin } from '../AdminStore';

type Status = 'pending' | 'approved' | 'hidden';
type Moderation = 'all' | 'first' | 'none';
interface AdminComment {
  id: string; slug: string; parentId: string | null; name: string; email: string; headline: string; kind: string; text: string;
  createdAt: string; status: Status; team: boolean; pinned: boolean; answered: boolean; notify: boolean; likes: number; ip: string;
}
interface Data { settings: { enabled: boolean; moderation: Moderation }; comments: AdminComment[] }

const STATUS: Record<Status, string> = { pending: 'در انتظار تأیید', approved: 'منتشر شده', hidden: 'پنهان' };
const STATUS_CLS: Record<Status, string> = { pending: 'bg-gold/15 text-gold', approved: 'bg-cyan/10 text-cyan', hidden: 'bg-space-3 text-ink-faint' };
const KIND: Record<string, string> = { comment: 'دیدگاه', question: 'پرسش', idea: 'ایده', experience: 'تجربه' };

export function CommentsInbox() {
  const { draft } = useAdmin();
  const [data, setData] = useState<Data | null>(null);
  const [filter, setFilter] = useState<'pending' | 'questions' | 'all'>('pending');
  const [reply, setReply] = useState<Record<string, string>>({});

  const titles = useMemo(() => Object.fromEntries(draft.articles.map((a) => [a.slug, a.title])), [draft]);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/comments', { cache: 'no-store' });
    if (res.ok) setData(await res.json());
  }, []);
  useEffect(() => { load(); }, [load]);

  const send = async (method: 'PATCH' | 'POST', body: Record<string, unknown>) => {
    const res = await fetch('/api/admin/comments', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) setData(await res.json());
    return res.ok;
  };

  const all = data?.comments ?? [];
  const byId = useMemo(() => new Map(all.map((c) => [c.id, c])), [all]);
  const visible = all.filter((c) => filter === 'all'
    || (filter === 'pending' ? c.status === 'pending' : c.kind === 'question' && !c.answered && c.status === 'approved'));
  const pending = all.filter((c) => c.status === 'pending').length;
  const open = all.filter((c) => c.kind === 'question' && !c.answered && c.status === 'approved').length;

  const answer = async (c: AdminComment) => {
    const text = (reply[c.id] || '').trim();
    if (!text) return;
    if (await send('POST', { slug: c.slug, parentId: c.parentId || c.id, text })) setReply((r) => ({ ...r, [c.id]: '' }));
  };

  return (
    <div>
      <PageTitle title="دیدگاه‌های مقالات" lead="دیدگاه‌ها، پرسش‌ها و پاسخ‌های خوانندگان زیر مقالات. پاسخ شما با نشان تیم سیمرغ نمایش داده می‌شود و اگر نویسنده خواسته باشد، برایش ایمیل می‌شود."
        actions={<Btn onClick={load}><RefreshCwIcon className="h-4 w-4" />تازه‌سازی</Btn>} />

      {data && (
        <Card title="تنظیمات">
          <div className="grid gap-4 sm:grid-cols-2">
            <Toggle label="دیدگاه‌ها باز است" checked={data.settings.enabled} onChange={(v) => send('PATCH', { settings: { enabled: v } })}
              hint="خاموش: فرم ارسال پنهان می‌شود؛ دیدگاه‌های منتشرشده می‌مانند." />
            <Select<Moderation> label="بررسی پیش از انتشار" value={data.settings.moderation} onChange={(v) => send('PATCH', { settings: { moderation: v } })}
              options={[
                { value: 'first', label: 'اولین دیدگاه هر نفر بررسی شود (پیشنهادی)' },
                { value: 'all', label: 'همه دیدگاه‌ها بررسی شوند' },
                { value: 'none', label: 'بدون بررسی منتشر شوند' },
              ]}
              hint="دیدگاهی با بیش از یک لینک همیشه منتظر تأیید می‌ماند." />
          </div>
        </Card>
      )}

      <div className="mb-4 mt-6 flex flex-wrap gap-1.5">
        {([['pending', `در انتظار تأیید (${pending})`], ['questions', `پرسش‌های بی‌پاسخ (${open})`], ['all', `همه (${all.length})`]] as const).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setFilter(k)} className={`rounded-md px-3 py-1.5 text-[12.5px] ${filter === k ? 'bg-space-3 text-ink' : 'text-ink-faint hover:text-ink'}`}>{l}</button>
        ))}
      </div>

      {data === null ? <p className="text-[13px] text-ink-faint">در حال بارگذاری…</p> : visible.length === 0 ? (
        <Card><p className="py-6 text-center text-[13px] text-ink-faint">موردی نیست.</p></Card>
      ) : (
        <div className="grid gap-2">
          {visible.map((c) => {
            const parent = c.parentId ? byId.get(c.parentId) : null;
            return (
              <div key={c.id} className="rounded-xl border border-line bg-space-1/80 p-4">
                <div className="flex flex-wrap items-center gap-2 text-[12px]">
                  <span className={`rounded px-2 py-0.5 text-[11px] ${STATUS_CLS[c.status]}`}>{STATUS[c.status]}</span>
                  {c.parentId ? <span className="text-ink-faint">پاسخ</span> : <span className="text-ink-faint">{KIND[c.kind] ?? c.kind}</span>}
                  {c.answered && <span className="rounded bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-300">پاسخ داده شد</span>}
                  {c.pinned && <span className="inline-flex items-center gap-1 text-ink-faint"><PinIcon className="h-3 w-3" />سنجاق</span>}
                  {c.team && <span className="rounded bg-blue/20 px-2 py-0.5 text-[11px] text-blue-soft">تیم سیمرغ</span>}
                  <span className="inline-flex items-center gap-1 text-ink-faint"><HeartIcon className="h-3 w-3" />{c.likes}</span>
                  <span className="ms-auto text-ink-faint">{new Date(c.createdAt).toLocaleString('fa-IR')}</span>
                </div>
                <a href={`/insights/${c.slug}#comment-${c.id}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12px] text-cyan hover:underline" dir="auto">
                  {titles[c.slug] ?? c.slug}<ExternalLinkIcon className="h-3 w-3" />
                </a>
                {parent && <p dir="auto" className="mt-2 border-s-2 border-line ps-3 text-[12.5px] text-ink-faint">در پاسخ به {parent.name}: {parent.text.slice(0, 160)}{parent.text.length > 160 ? '…' : ''}</p>}
                <div className="mt-2 text-[13.5px] text-ink" dir="auto">
                  <b>{c.name}</b>
                  {c.headline && <span className="text-ink-faint"> · {c.headline}</span>}
                  {!c.team && <span className="text-ink-faint" dir="ltr"> · {c.email}</span>}
                </div>
                <p dir="auto" className="mt-1 whitespace-pre-wrap text-[13.5px] leading-7 text-ink-muted">{c.text}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {c.status !== 'approved' && <Btn small kind="primary" onClick={() => send('PATCH', { id: c.id, status: 'approved' })}><CheckIcon className="h-3.5 w-3.5" />تأیید و انتشار</Btn>}
                  {c.status === 'approved' && <Btn small onClick={() => send('PATCH', { id: c.id, status: 'hidden' })}><EyeOffIcon className="h-3.5 w-3.5" />پنهان کن</Btn>}
                  {!c.parentId && <Btn small onClick={() => send('PATCH', { id: c.id, pinned: !c.pinned })}><PinIcon className="h-3.5 w-3.5" />{c.pinned ? 'برداشتن سنجاق' : 'سنجاق'}</Btn>}
                  {!c.parentId && c.kind === 'question' && <Btn small onClick={() => send('PATCH', { id: c.id, answered: !c.answered })}>{c.answered ? 'بی‌پاسخ' : 'پاسخ داده شد'}</Btn>}
                  {!c.team && <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-[12px] text-ink-muted hover:text-ink"><MailIcon className="h-3.5 w-3.5" />ایمیل</a>}
                  <div className="flex-1" />
                  <Btn small kind="danger" onClick={() => confirm(c.parentId ? 'این پاسخ حذف شود؟' : 'این دیدگاه و پاسخ‌هایش حذف شوند؟') && send('PATCH', { id: c.id, remove: true })}><Trash2Icon className="h-3.5 w-3.5" />حذف</Btn>
                </div>

                {!c.team && (
                  <div className="mt-3 flex items-start gap-2">
                    <textarea className={`${inputCls} text-[13px]`} rows={2} dir="auto" placeholder="پاسخ تیم سیمرغ… (به زبان دیدگاه)"
                      value={reply[c.id] ?? ''} onChange={(e) => setReply((r) => ({ ...r, [c.id]: e.target.value }))} />
                    <Btn onClick={() => answer(c)} disabled={!(reply[c.id] || '').trim()}><SendIcon className="h-4 w-4" />پاسخ</Btn>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
