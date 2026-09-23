'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboardIcon,
  FileStackIcon,
  ImageIcon,
  SlidersHorizontalIcon,
  InboxIcon,
  SearchCheckIcon,
  LogOutIcon,
  ShieldCheckIcon,
  ArrowLeftIcon } from
'lucide-react';
import { useAdminAuth, type Role } from '../../contexts/AdminAuthContext';
import { Button } from '../ui/Button';
import { TextField } from '../forms/Field';

const links = [
{ to: '/admin', label: 'Dashboard', icon: LayoutDashboardIcon, end: true },
{ to: '/admin/content', label: 'Content', icon: FileStackIcon },
{ to: '/admin/hero', label: 'Hero & Sliders', icon: SlidersHorizontalIcon },
{ to: '/admin/media', label: 'Media Library', icon: ImageIcon },
{ to: '/admin/requests', label: 'Demo Requests', icon: InboxIcon },
{ to: '/admin/seo', label: 'SEO', icon: SearchCheckIcon }];


const roles: Role[] = ['Super Admin', 'Admin', 'Content Manager', 'Marketing', 'Editor', 'Media Manager', 'Sales', 'Support'];

function SignIn() {
  const { signIn } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Super Admin');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 6) {
      setError('Enter a valid email and a password of at least 6 characters.');
      return;
    }
    signIn(email, role);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-space-0 px-5">
      <div className="w-full max-w-md border border-line bg-space-1 p-9">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-label text-cyan">
          <ShieldCheckIcon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          SIMORGH CONSOLE
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">Sign in</h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-faint">
          Access is role-based. Every action in the console is written to the audit log.
        </p>

        <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-5">
          <TextField label="Email" name="admin-email" type="email" required value={email} onChange={setEmail} />
          <TextField label="Password" name="admin-password" type="password" required value={password} onChange={setPassword} />
          <div>
            <label htmlFor="admin-role" className="mb-2 block font-mono text-[10px] tracking-label text-ink-faint">
              ROLE
            </label>
            <select
              id="admin-role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="h-11 w-full border border-line bg-space-0 px-3.5 text-[14px] text-ink outline-none focus:border-cyan/60">
              
              {roles.map((r) =>
              <option key={r}>{r}</option>
              )}
            </select>
          </div>
          {error && <p className="text-[12px] text-gold">{error}</p>}
          <Button type="submit" size="lg" className="mt-2">
            Enter console
          </Button>
        </form>

        <Link href="/" className="mt-8 inline-flex items-center gap-2 text-[13px] text-ink-faint hover:text-cyan">
          <ArrowLeftIcon className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
          Back to website
        </Link>
      </div>
    </div>);

}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session, signOut } = useAdminAuth();
  const pathname = usePathname();

  if (!session) return <SignIn />;

  return (
    <div className="flex min-h-screen w-full bg-space-0">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-space-1 lg:flex">
        <div className="flex h-[72px] items-center gap-2 border-b border-line px-6 font-mono text-[10px] tracking-label text-cyan">
          <ShieldCheckIcon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          SIMORGH CONSOLE
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Console">
          {links.map((l) =>
          <Link
            key={l.to}
            href={l.to}
            className={`flex items-center gap-3 px-3 py-2.5 text-[13.5px] transition-colors duration-150 ease-sim ${(l.end ? pathname === l.to : pathname.startsWith(l.to)) ? 'bg-space-2 text-cyan' : 'text-ink-muted hover:bg-space-2 hover:text-ink'}`}>
              <l.icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              {l.label}
            </Link>
          )}
        </nav>
        <div className="border-t border-line p-4">
          <div className="text-[12.5px] text-ink">{session.email}</div>
          <div className="mt-1 font-mono text-[10px] tracking-label text-cyan/80">{session.role.toUpperCase()}</div>
          <button
            onClick={signOut}
            className="mt-4 inline-flex items-center gap-2 text-[12.5px] text-ink-faint transition-colors duration-150 ease-sim hover:text-ink">
            
            <LogOutIcon className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] items-center justify-between gap-4 border-b border-line px-5 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto lg:hidden">
            {links.map((l) =>
            <Link
              key={l.to}
              href={l.to}
              className={`whitespace-nowrap font-mono text-[10px] tracking-label ${(l.end ? pathname === l.to : pathname.startsWith(l.to)) ? 'text-cyan' : 'text-ink-faint'}`}>
                {l.label.toUpperCase()}
            </Link>
            )}
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/" className="text-[13px] text-ink-faint transition-colors duration-150 ease-sim hover:text-cyan">
              View site
            </Link>
            <button onClick={signOut} className="text-[13px] text-ink-faint hover:text-ink lg:hidden">
              Sign out
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>);

}