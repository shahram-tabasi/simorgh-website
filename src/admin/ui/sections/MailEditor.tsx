'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2Icon, CircleAlertIcon, CircleDashedIcon, CopyIcon, ExternalLinkIcon, KeyRoundIcon, PlusIcon, RefreshCwIcon, Trash2Icon, XCircleIcon } from 'lucide-react';
import { Btn, Card, Grid, PageTitle, Text, inputCls } from '../fields';
import { useAdmin } from '../AdminStore';

interface Mailbox { username: string; name: string; quotaMb: number; usedBytes: number; messages: number; active: boolean }
interface Alias { id: number; address: string; goto: string; active: boolean }
interface MailState {
  configured: boolean; ready?: boolean; domain: string; host: string; webmail: string; smtp: boolean;
  mailboxes?: Mailbox[]; aliases?: Alias[]; error?: string;
}
interface DnsRecord { type: string; name: string; value: string; priority?: number; noProxy?: boolean; purpose: string; status?: string; found?: string[] }

const size = (b: number) => (b > 1073741824 ? `${(b / 1073741824).toFixed(1)} GB` : `${Math.round(b / 1048576)} MB`);

/** A strong random password, readable enough to dictate. */
function makePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(14));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('').replace(/(.{7})/, '$1-');
}

async function post(body: Record<string, unknown>) {
  const res = await fetch('/api/admin/mail', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'خطا');
}

function Copy({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" title="کپی" onClick={() => { navigator.clipboard?.writeText(text); setDone(true); setTimeout(() => setDone(false), 1400); }}
      className="shrink-0 rounded p-1 text-ink-faint hover:text-ink">
      {done ? <CheckCircle2Icon className="h-3.5 w-3.5 text-cyan" /> : <CopyIcon className="h-3.5 w-3.5" />}
    </button>
  );
}

export function MailEditor() {
  const { notify } = useAdmin();
  const [state, setState] = useState<MailState | null>(null);
  const [tab, setTab] = useState<'boxes' | 'aliases' | 'dns' | 'clients'>('boxes');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/mail', { cache: 'no-store' });
    setState(res.ok ? await res.json() : null);
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (body: Record<string, unknown>, ok: string) => {
    setBusy(true);
    try { await post(body); notify(ok); await load(); return true; } catch (e) { notify((e as Error).message, 'error'); return false; } finally { setBusy(false); }
  };

  if (!state) return <p className="text-[13px] text-ink-faint">در حال بارگذاری…</p>;

  const tabs = [
    ['boxes', 'صندوق‌های ایمیل'], ['aliases', 'آدرس‌های فرعی و ارسال خودکار'], ['dns', 'رکوردهای DNS'], ['clients', 'اتصال موبایل و Outlook'],
  ] as const;

  return (
    <div className="grid gap-6">
      <PageTitle title="ایمیل سازمانی" lead={`ایمیل‌های @${state.domain} — ساخت صندوق برای افراد و بخش‌ها (info، sales، support …)، ارسال خودکار، و رکوردهایی که باید در آروان‌کلاد ثبت شوند.`}
        actions={<>
          <a href="/mail" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md bg-cyan px-4 py-2 text-[13px] font-medium text-space-0 hover:bg-cyan-soft"><ExternalLinkIcon className="h-4 w-4" />ورود به وب‌میل</a>
          <Btn onClick={load}><RefreshCwIcon className="h-4 w-4" />تازه‌سازی</Btn>
        </>} />

      {!state.configured && <SetupHelp />}
      {state.error && <div className="rounded-lg border border-red-400/30 bg-red-500/5 p-4 text-[13px] text-red-200">{state.error}</div>}
      {state.configured && !state.error && state.ready === false && (
        <Card title="راه‌اندازی دامنه" hint={`سرور ایمیل وصل است ولی دامنه ${state.domain} هنوز روی آن تعریف نشده. با یک کلیک دامنه و کلید DKIM ساخته می‌شود.`}>
          <div><Btn kind="primary" disabled={busy} onClick={() => run({ action: 'setup' }, 'دامنه روی سرور ایمیل ساخته شد.')}>راه‌اندازی {state.domain}</Btn></div>
        </Card>
      )}

      <div className="flex flex-wrap gap-1.5 border-b border-line">
        {tabs.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)}
            className={`-mb-px border-b-2 px-3 py-2 text-[13px] ${tab === k ? 'border-cyan text-ink' : 'border-transparent text-ink-faint hover:text-ink'}`}>{l}</button>
        ))}
      </div>

      {tab === 'boxes' && <Mailboxes state={state} busy={busy} run={run} />}
      {tab === 'aliases' && <Aliases state={state} busy={busy} run={run} />}
      {tab === 'dns' && <DnsRecords />}
      {tab === 'clients' && <Clients state={state} />}
    </div>
  );
}

type Run = (body: Record<string, unknown>, ok: string) => Promise<boolean>;

function Mailboxes({ state, busy, run }: { state: MailState; busy: boolean; run: Run }) {
  const [form, setForm] = useState({ localPart: '', name: '', password: makePassword(), quotaMb: 3072 });
  const [created, setCreated] = useState<{ user: string; password: string } | null>(null);
  const usable = state.configured && state.ready && !state.error;

  const add = async () => {
    const ok = await run({ action: 'add-mailbox', ...form }, `${form.localPart}@${state.domain} ساخته شد.`);
    if (ok) { setCreated({ user: `${form.localPart}@${state.domain}`, password: form.password }); setForm({ localPart: '', name: '', password: makePassword(), quotaMb: 3072 }); }
  };
  const resetPassword = async (m: Mailbox) => {
    const password = makePassword();
    if (!confirm(`رمز ${m.username} عوض شود؟ رمز جدید یک بار نمایش داده می‌شود.`)) return;
    if (await run({ action: 'edit-mailbox', username: m.username, password }, 'رمز عوض شد.')) setCreated({ user: m.username, password });
  };

  return (
    <div className="grid gap-6">
      <Card title="ساخت ایمیل جدید" hint="برای هر نفر یا بخش یک صندوق جدا بسازید. اگر فقط می‌خواهید ایمیل‌های یک آدرس به صندوق دیگری برود، از «آدرس‌های فرعی» استفاده کنید.">
        <Grid cols={4}>
          <label className="block sm:col-span-2 lg:col-span-1">
            <span className="mb-1.5 block text-[12.5px] font-medium text-ink-muted">آدرس</span>
            <div dir="ltr" className="flex items-center rounded-md border border-line bg-space-0/70 focus-within:border-cyan/60">
              <input className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[13.5px] text-ink outline-none" placeholder="info" value={form.localPart}
                onChange={(e) => setForm({ ...form, localPart: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') })} />
              <span className="pe-3 text-[12.5px] text-ink-faint">@{state.domain}</span>
            </div>
          </label>
          <Text label="نام نمایشی" value={form.name} onChange={(name) => setForm({ ...form, name })} placeholder="SIMORGH Sales" />
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-ink-muted">رمز عبور</span>
            <div className="flex gap-1.5">
              <input dir="ltr" className={`${inputCls} font-mono`} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" title="رمز تصادفی جدید" onClick={() => setForm({ ...form, password: makePassword() })} className="rounded-md border border-line px-2 text-ink-muted hover:text-ink"><KeyRoundIcon className="h-4 w-4" /></button>
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-ink-muted">حجم صندوق</span>
            <select className={inputCls} value={form.quotaMb} onChange={(e) => setForm({ ...form, quotaMb: Number(e.target.value) })}>
              {[1024, 3072, 5120, 10240, 20480].map((q) => <option key={q} value={q} className="bg-space-1">{q / 1024} GB</option>)}
            </select>
          </label>
        </Grid>
        <div className="flex flex-wrap items-center gap-2">
          <Btn kind="primary" disabled={!usable || busy || !form.localPart || form.password.length < 10} onClick={add}><PlusIcon className="h-4 w-4" />ساخت ایمیل</Btn>
          <span className="text-[11.5px] text-ink-faint">پیشنهاد: info، sales، support، hr، noreply (برای ارسال اعلان‌های سایت)</span>
        </div>
        {created && (
          <div className="rounded-lg border border-cyan/30 bg-cyan/5 p-4 text-[13px] leading-7">
            <div className="font-semibold text-ink">این اطلاعات را به صاحب ایمیل بدهید (رمز دوباره نمایش داده نمی‌شود):</div>
            <div dir="ltr" className="mt-2 grid gap-1 text-left font-mono text-[13px] text-ink">
              <div className="flex items-center gap-2">User: {created.user}<Copy text={created.user} /></div>
              <div className="flex items-center gap-2">Password: {created.password}<Copy text={created.password} /></div>
              <div>Webmail: {typeof window !== 'undefined' ? `${window.location.origin}/mail` : '/mail'}</div>
            </div>
            <button type="button" onClick={() => setCreated(null)} className="mt-2 text-[12px] text-ink-faint hover:text-ink">بستن</button>
          </div>
        )}
      </Card>

      <div className="overflow-hidden rounded-xl border border-line">
        {(state.mailboxes ?? []).map((m) => (
          <div key={m.username} className="flex flex-wrap items-center gap-3 border-b border-line bg-space-1/80 p-3.5 last:border-0">
            <span className={`h-2 w-2 rounded-full ${m.active ? 'bg-cyan' : 'bg-ink-faint'}`} />
            <div className="min-w-0 flex-1">
              <div dir="ltr" className="truncate text-left font-mono text-[13.5px] text-ink">{m.username}</div>
              <div className="text-[11.5px] text-ink-faint">{m.name} · {m.messages} پیام · {size(m.usedBytes)} از {m.quotaMb ? `${m.quotaMb / 1024} GB` : 'نامحدود'}</div>
            </div>
            <Btn small disabled={busy} onClick={() => resetPassword(m)}><KeyRoundIcon className="h-3.5 w-3.5" />رمز جدید</Btn>
            <Btn small disabled={busy} onClick={() => run({ action: 'edit-mailbox', username: m.username, active: !m.active }, m.active ? 'غیرفعال شد.' : 'فعال شد.')}>{m.active ? 'غیرفعال' : 'فعال'}</Btn>
            <Btn small kind="danger" disabled={busy} onClick={() => confirm(`${m.username} و همه ایمیل‌هایش برای همیشه حذف شود؟`) && run({ action: 'delete-mailbox', username: m.username }, 'حذف شد.')}><Trash2Icon className="h-3.5 w-3.5" /></Btn>
          </div>
        ))}
        {usable && !(state.mailboxes ?? []).length && <div className="p-8 text-center text-[13px] text-ink-faint">هنوز ایمیلی ساخته نشده است.</div>}
        {!usable && <div className="p-8 text-center text-[13px] text-ink-faint">بعد از اتصال سرور ایمیل، صندوق‌ها اینجا نمایش داده می‌شوند.</div>}
      </div>
    </div>
  );
}

function Aliases({ state, busy, run }: { state: MailState; busy: boolean; run: Run }) {
  const [localPart, setLocal] = useState('');
  const [goto, setGoto] = useState('');
  const usable = state.configured && state.ready && !state.error;
  return (
    <div className="grid gap-6">
      <Card title="آدرس فرعی جدید" hint="ایمیل‌هایی که به این آدرس می‌رسند به یک یا چند صندوق دیگر (حتی Gmail) فرستاده می‌شوند. مثلاً contact@ ← sales@ و info@.">
        <div className="grid gap-3 sm:grid-cols-[1fr_1.5fr_auto]">
          <div dir="ltr" className="flex items-center rounded-md border border-line bg-space-0/70 focus-within:border-cyan/60">
            <input className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[13.5px] text-ink outline-none" placeholder="contact" value={localPart} onChange={(e) => setLocal(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))} />
            <span className="pe-3 text-[12.5px] text-ink-faint">@{state.domain}</span>
          </div>
          <input dir="ltr" className={inputCls} placeholder={`sales@${state.domain}, info@${state.domain}`} value={goto} onChange={(e) => setGoto(e.target.value)} />
          <Btn kind="primary" disabled={!usable || busy || !localPart || !goto} onClick={async () => { if (await run({ action: 'add-alias', localPart, goto }, 'ساخته شد.')) { setLocal(''); setGoto(''); } }}><PlusIcon className="h-4 w-4" />افزودن</Btn>
        </div>
      </Card>
      <div className="overflow-hidden rounded-xl border border-line">
        {(state.aliases ?? []).map((a) => (
          <div key={a.id} dir="ltr" className="flex items-center gap-3 border-b border-line bg-space-1/80 p-3.5 text-left font-mono text-[13px] last:border-0">
            <span className="text-ink">{a.address}</span><span className="text-ink-faint">→</span>
            <span className="min-w-0 flex-1 truncate text-ink-muted">{a.goto.split(',').join(', ')}</span>
            <Btn small kind="danger" disabled={busy} onClick={() => confirm(`${a.address} حذف شود؟`) && run({ action: 'delete-alias', id: a.id }, 'حذف شد.')}><Trash2Icon className="h-3.5 w-3.5" /></Btn>
          </div>
        ))}
        {!(state.aliases ?? []).length && <div className="p-8 text-center text-[13px] text-ink-faint">آدرس فرعی وجود ندارد.</div>}
      </div>
    </div>
  );
}

function DnsRecords() {
  const [data, setData] = useState<{ domain: string; ip: string; records: DnsRecord[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const check = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/mail/dns', { cache: 'no-store' });
    setData(res.ok ? await res.json() : null);
    setLoading(false);
  }, []);
  useEffect(() => { check(); }, [check]);

  const icon = (s?: string) => s === 'ok' ? <CheckCircle2Icon className="h-4 w-4 text-cyan" />
    : s === 'different' ? <CircleAlertIcon className="h-4 w-4 text-gold" />
      : s === 'missing' ? <XCircleIcon className="h-4 w-4 text-red-300" /> : <CircleDashedIcon className="h-4 w-4 text-ink-faint" />;

  return (
    <div className="grid gap-4">
      <Card title="رکوردهایی که باید در آروان‌کلاد ثبت شوند" hint="در پنل آروان‌کلاد ← DNS ← افزودن رکورد. رکوردهای مربوط به ایمیل را «بدون پروکسی / ابر خاموش» ثبت کنید؛ ایمیل از CDN عبور نمی‌کند. بعد از ثبت، چند دقیقه تا چند ساعت طول می‌کشد تا وضعیت سبز شود."
        actions={<Btn onClick={check} disabled={loading}><RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />بررسی دوباره</Btn>}>
        {!data?.ip && <p className="rounded-md bg-gold/10 p-3 text-[12.5px] text-gold">IP عمومی سرور را در MAIL_SERVER_IP (فایل .env.local) بنویسید تا در رکوردها قرار بگیرد و بررسی شود.</p>}
        <div className="grid gap-2">
          {(data?.records ?? []).map((r, i) => (
            <div key={i} className="rounded-lg border border-line bg-space-0/50 p-3">
              <div className="flex flex-wrap items-center gap-2">
                {icon(r.status)}
                <span className="rounded bg-space-3 px-1.5 py-0.5 font-mono text-[11px] text-ink">{r.type}</span>
                <span dir="ltr" className="font-mono text-[12.5px] text-ink">{r.name}</span>
                {r.priority !== undefined && <span className="text-[11.5px] text-ink-faint">اولویت {r.priority}</span>}
                {r.noProxy && <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[10.5px] text-gold">بدون CDN</span>}
                <span className="text-[11.5px] text-ink-faint">— {r.purpose}</span>
              </div>
              <div dir="ltr" className="mt-2 flex items-start gap-2 rounded bg-space-0 px-2.5 py-1.5 text-left font-mono text-[12px] text-ink-muted">
                <span className="min-w-0 flex-1 break-all">{r.value}</span><Copy text={r.value} />
              </div>
              {r.status === 'different' && r.found && <div dir="ltr" className="mt-1 break-all text-left font-mono text-[11px] text-gold">now: {r.found.join(' | ')}</div>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Clients({ state }: { state: MailState }) {
  const rows = [
    ['Incoming (IMAP)', state.host, '993', 'SSL/TLS'],
    ['Outgoing (SMTP)', state.host, '465', 'SSL/TLS'],
    ['Outgoing (SMTP, alt.)', state.host, '587', 'STARTTLS'],
  ];
  return (
    <Card title="تنظیمات برنامه‌های ایمیل" hint="برای Outlook، Thunderbird، Gmail اپ، ایمیل آیفون و اندروید. نام کاربری = آدرس کامل ایمیل؛ رمز = رمز همان صندوق. اگر رکوردهای autodiscover ثبت شده باشند، بیشتر برنامه‌ها خودشان تنظیم می‌شوند.">
      <table dir="ltr" className="w-full text-left text-[13px]">
        <thead><tr className="text-[11.5px] text-ink-faint"><th className="py-2">Server</th><th>Host</th><th>Port</th><th>Security</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]} className="border-t border-line font-mono text-ink"><td className="py-2 font-sans text-ink-muted">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody>
      </table>
      <p className="text-[12.5px] leading-6 text-ink-faint">وب‌میل: <a href="/mail" target="_blank" rel="noreferrer" className="text-cyan hover:underline" dir="ltr">/mail</a> ← <span dir="ltr">{state.webmail}</span></p>
      <p className="text-[12.5px] leading-6 text-ink-faint">اعلان فرم‌های سایت با ایمیل: {state.smtp ? <span className="text-cyan">فعال است</span> : <span className="text-gold">SMTP روی سرور تنظیم نشده (SMTP_HOST / SMTP_USER / SMTP_PASS)</span>}</p>
    </Card>
  );
}

function SetupHelp() {
  return (
    <Card title="سرور ایمیل هنوز وصل نشده است" hint="ایمیل روی یک سرور ایمیل جداگانه (mailcow) روی همان سرور لینوکسی شما اجرا می‌شود؛ این پنل فقط آن را مدیریت می‌کند. راهنمای کامل قدم‌به‌قدم در فایل docs/EMAIL-SETUP.fa.md پروژه است.">
      <ol className="grid list-inside list-decimal gap-1.5 text-[13px] leading-7 text-ink-muted">
        <li>mailcow را روی سرور لینوکسی نصب کنید (دستورها در راهنما).</li>
        <li>در mailcow ← System ← Configuration ← Access ← API یک کلید Read-Write بسازید.</li>
        <li>در فایل <code dir="ltr">.env.local</code> سایت بنویسید و سایت را دوباره اجرا کنید:</li>
      </ol>
      <pre dir="ltr" className="overflow-x-auto rounded-md bg-space-0 p-3 text-left font-mono text-[12px] leading-6 text-ink">{`MAIL_DOMAIN=simorghai.com
MAIL_HOST=mail.simorghai.com
MAIL_SERVER_IP=<public IP>
MAILCOW_URL=http://127.0.0.1:8080
MAILCOW_API_KEY=<api key>`}</pre>
      <p className="text-[12.5px] text-ink-faint">تب «رکوردهای DNS» همین حالا هم کار می‌کند و رکوردهای لازم برای آروان‌کلاد را نشان می‌دهد.</p>
    </Card>
  );
}
