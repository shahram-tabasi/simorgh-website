'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BoxIcon, ExternalLinkIcon, FactoryIcon, FileTextIcon, GaugeIcon, ImagesIcon, InboxIcon, LanguagesIcon,
  LayersIcon, LayoutTemplateIcon, LogOutIcon, MenuIcon, SaveIcon, SettingsIcon, SparklesIcon, Undo2Icon, XIcon,
} from 'lucide-react';
import { useAdmin } from './AdminStore';

const NAV = [
  { href: '/admin', label: 'داشبورد', icon: GaugeIcon },
  { href: '/admin/pages', label: 'صفحات و پس‌زمینه‌ها', icon: LayoutTemplateIcon },
  { href: '/admin/hero', label: 'بخش اول صفحه اصلی', icon: SparklesIcon },
  { href: '/admin/products', label: 'محصولات', icon: BoxIcon },
  { href: '/admin/articles', label: 'مقالات و اخبار', icon: FileTextIcon },
  { href: '/admin/industries', label: 'صنایع', icon: FactoryIcon },
  { href: '/admin/sections', label: 'بخش‌های صفحه اصلی', icon: LayersIcon },
  { href: '/admin/media', label: 'کتابخانه رسانه', icon: ImagesIcon },
  { href: '/admin/requests', label: 'پیام‌ها و درخواست دمو', icon: InboxIcon },
  { href: '/admin/translations', label: 'ترجمه‌ها', icon: LanguagesIcon },
  { href: '/admin/settings', label: 'تنظیمات و سئو', icon: SettingsIcon },
];

/** Pages that edit the draft; the save bar only matters there. */
const NO_SAVE = ['/admin/media', '/admin/requests'];

export function AdminShell({ user, children }: { user: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const { dirty, saving, save, discard, notice } = useAdmin();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href));
  const showSave = !NO_SAVE.some((p) => pathname.startsWith(p)) || dirty;

  const logout = async () => {
    if (dirty && !confirm('تغییرات ذخیره‌نشده از بین می‌رود. خارج می‌شوید؟')) return;
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: I }) => (
        <Link key={href} href={href} onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-md px-3 py-2 text-[13.5px] transition-colors ${active(href) ? 'bg-cyan/10 text-cyan-soft' : 'text-ink-muted hover:bg-space-2 hover:text-ink'}`}>
          <I className="h-4 w-4 shrink-0" strokeWidth={1.6} />{label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden border-e border-line bg-space-1/90 lg:block">
        <div className="sticky top-0 flex h-screen flex-col p-4">
          <Brand />
          <div className="mt-6 flex-1 overflow-y-auto">{nav}</div>
          <Footer user={user} logout={logout} />
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)}>
          <div className="flex h-full w-72 flex-col bg-space-1 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><Brand /><button onClick={() => setOpen(false)} aria-label="بستن" className="p-1 text-ink-muted"><XIcon className="h-5 w-5" /></button></div>
            <div className="mt-6 flex-1 overflow-y-auto">{nav}</div>
            <Footer user={user} logout={logout} />
          </div>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-space-0/85 px-4 py-3 backdrop-blur sm:px-6">
          <button className="rounded-md p-1.5 text-ink-muted hover:text-ink lg:hidden" onClick={() => setOpen(true)} aria-label="منو"><MenuIcon className="h-5 w-5" /></button>
          <div className="flex-1 text-[12.5px]">
            {dirty
              ? <span className="inline-flex items-center gap-2 text-gold"><span className="h-2 w-2 rounded-full bg-gold" />تغییرات ذخیره نشده</span>
              : <span className="text-ink-faint">همه تغییرات ذخیره شده است</span>}
          </div>
          {showSave && (
            <>
              <button type="button" disabled={!dirty || saving} onClick={discard}
                className="hidden items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[12.5px] text-ink-muted hover:text-ink disabled:opacity-40 sm:inline-flex">
                <Undo2Icon className="h-3.5 w-3.5" />لغو تغییرات
              </button>
              <button type="button" disabled={!dirty || saving} onClick={save}
                className="inline-flex items-center gap-1.5 rounded-md bg-cyan px-4 py-1.5 text-[13px] font-semibold text-space-0 hover:bg-cyan-soft disabled:opacity-40">
                <SaveIcon className="h-4 w-4" />{saving ? 'در حال ذخیره…' : 'ذخیره و انتشار'}
              </button>
            </>
          )}
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">{children}</main>
      </div>

      {notice && (
        <div key={notice.id} role="status"
          className={`fixed bottom-5 start-1/2 z-50 max-w-md -translate-x-1/2 rounded-lg border px-4 py-3 text-[13px] shadow-2xl rtl:translate-x-1/2 ${notice.kind === 'error' ? 'border-red-400/40 bg-[#2a0f16] text-red-200' : 'border-cyan/30 bg-space-2 text-ink'}`}>
          {notice.text}
        </div>
      )}
    </div>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-3 px-2">
      <img src="/simorgh/logo-mark-192.png" alt="" className="h-9 w-9" />
      <span>
        <span className="block text-[14px] font-bold tracking-wide text-ink">SIMORGH</span>
        <span className="block text-[11px] text-ink-faint">پنل مدیریت سایت</span>
      </span>
    </Link>
  );
}

function Footer({ user, logout }: { user: string; logout: () => void }) {
  return (
    <div className="mt-4 grid gap-1 border-t border-line pt-4">
      <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] text-ink-muted hover:bg-space-2 hover:text-ink">
        <ExternalLinkIcon className="h-4 w-4" />مشاهده سایت
      </a>
      <button type="button" onClick={logout} className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] text-ink-muted hover:bg-space-2 hover:text-red-300">
        <LogOutIcon className="h-4 w-4" />خروج <span className="ms-auto text-[11px] text-ink-faint">{user}</span>
      </button>
    </div>
  );
}
