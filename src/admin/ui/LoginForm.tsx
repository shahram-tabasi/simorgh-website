'use client';

import React, { useEffect, useState } from 'react';
import { LockIcon } from 'lucide-react';
import { inputCls } from './fields';

const OIDC_ERRORS: Record<string, string> = {
  forbidden: 'این حساب دسترسی مدیریت سایت ندارد.',
  cancelled: 'ورود لغو شد.',
  expired: 'زمان ورود گذشت؛ دوباره امتحان کنید.',
  failed: 'ورود ممکن نشد؛ کمی بعد دوباره امتحان کنید.',
  'not-configured': 'ورود با حساب سیمرغ روی سرور تنظیم نشده است.',
};

/** Sign-in through Keycloak (realm website): one button. */
function OidcLogin() {
  // Read after mounting, so the server's HTML and the browser's agree.
  const [{ error, href }, setState] = useState({ error: '', href: '/api/admin/oidc/login' });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    setState({ error: params.get('error') || '', href: `/api/admin/oidc/login${next ? `?next=${encodeURIComponent(next)}` : ''}` });
  }, []);
  return (
    <div className="grid gap-4 rounded-xl border border-line bg-space-1/90 p-6">
      <p className="text-center text-[13px] leading-7 text-ink-muted">ورود مدیران با حساب سیمرغ و کد دومرحله‌ای انجام می‌شود.</p>
      {error && <p role="alert" className="text-center text-[12.5px] text-red-300">{OIDC_ERRORS[error] || OIDC_ERRORS.failed}</p>}
      <a href={href} className="inline-flex items-center justify-center gap-2 rounded-md bg-cyan py-2.5 text-[14px] font-semibold text-space-0 hover:bg-cyan-soft">
        <LockIcon className="h-4 w-4" />ورود با حساب سیمرغ
      </a>
    </div>
  );
}

export function LoginForm({ configured, oidc = false }: { configured: boolean; oidc?: boolean }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      if (res.ok) {
        const next = new URLSearchParams(window.location.search).get('next');
        window.location.href = next && next.startsWith('/admin') ? next : '/admin';
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(
        data.error === 'too-many' ? `تلاش‌های زیاد. ${data.retryIn} ثانیه دیگر دوباره امتحان کنید.`
          : data.error === 'not-configured' ? 'رمز مدیر روی سرور تنظیم نشده است.'
            : 'نام کاربری یا رمز عبور اشتباه است.',
      );
    } catch {
      setError('ارتباط با سرور برقرار نشد.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_top,#101a35,transparent_60%)] p-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src="/simorgh/logo-mark-192.png" alt="" className="h-16 w-16" />
          <h1 className="mt-4 text-[20px] font-bold text-ink">پنل مدیریت SIMORGH</h1>
          <p className="mt-1 text-[12.5px] text-ink-faint">برای ویرایش سایت وارد شوید</p>
        </div>

        {oidc && configured ? (
          <OidcLogin />
        ) : !configured ? (
          <div className="rounded-xl border border-gold/30 bg-gold/5 p-5 text-[13px] leading-7 text-ink-muted">
            <p className="font-semibold text-gold">پنل هنوز فعال نشده است.</p>
            <p className="mt-2">در پوشه اصلی پروژه روی سرور فایل <code dir="ltr" className="rounded bg-space-3 px-1">.env.local</code> بسازید:</p>
            <pre dir="ltr" className="mt-2 overflow-x-auto rounded-md bg-space-0 p-3 text-left font-mono text-[12px] text-ink">{`ADMIN_USERNAME=admin
ADMIN_PASSWORD=یک-رمز-طولانی
ADMIN_SECRET=یک-رشته-تصادفی-طولانی`}</pre>
            <p className="mt-2">رمز حداقل ۸ کاراکتر باشد. سپس سایت را دوباره اجرا کنید.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4 rounded-xl border border-line bg-space-1/90 p-6">
            <label>
              <span className="mb-1.5 block text-[12.5px] text-ink-muted">نام کاربری</span>
              <input dir="ltr" autoComplete="username" className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} required />
            </label>
            <label>
              <span className="mb-1.5 block text-[12.5px] text-ink-muted">رمز عبور</span>
              <input dir="ltr" type="password" autoComplete="current-password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
            </label>
            {error && <p role="alert" className="text-[12.5px] text-red-300">{error}</p>}
            <button type="submit" disabled={busy} className="mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-cyan py-2.5 text-[14px] font-semibold text-space-0 hover:bg-cyan-soft disabled:opacity-50">
              <LockIcon className="h-4 w-4" />{busy ? 'در حال ورود…' : 'ورود'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
