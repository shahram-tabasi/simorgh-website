'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, GlobeIcon, MenuIcon, XIcon, ChevronDownIcon } from 'lucide-react';
import { Logo } from './Logo';
import { SearchOverlay } from './SearchOverlay';
import { Button } from '../ui/Button';
import { languages, navigation } from '../../data/site';
import { useI18n, type Locale } from '../../i18n';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { locale: lang, setLocale, t } = useI18n();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setLangOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ease-sim ${
        scrolled || mobileOpen ? 'border-b border-line bg-space-0/92 backdrop-blur-xl' : 'border-b border-transparent'}`
        }
        onMouseLeave={() => setOpenMenu(null)}>
        
        <div className="mx-auto flex h-[72px] max-w-shell items-center justify-between gap-8 px-5 lg:px-10">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {navigation.map((item) =>
            <div key={item.label} onMouseEnter={() => setOpenMenu(item.children ? item.label : null)}>
                <Link
                href={item.to}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-[13.5px] transition-colors duration-150 ease-sim ${
                pathname.startsWith(item.to) ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
                }>
                
                  {t.nav[item.label] ?? item.label}
                  {item.children && <ChevronDownIcon className="h-3.5 w-3.5 opacity-50" strokeWidth={1.6} />}
                </Link>
              </div>
            )}
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="flex h-9 w-9 items-center justify-center text-ink-muted transition-colors duration-150 ease-sim hover:text-ink">
              
              <SearchIcon className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>

            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangOpen((v) => !v)}
                aria-expanded={langOpen}
                aria-label="Change language"
                className="flex h-9 items-center gap-1.5 px-2 text-ink-muted transition-colors duration-150 ease-sim hover:text-ink">
                
                <GlobeIcon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                <span className="font-mono text-[11px] uppercase" data-no-translate>{lang}</span>
              </button>
              <AnimatePresence>
                {langOpen &&
                <motion.ul
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute right-0 top-11 w-44 border border-line bg-space-1 py-1.5"
                  data-no-translate>
                  
                    {languages.map((l) =>
                  <li key={l.code}>
                        <button
                      onClick={() => {
                        setLocale(l.code as Locale);
                        setLangOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2 text-[13px] transition-colors duration-150 ease-sim hover:bg-space-2 ${
                      l.code === lang ? 'text-cyan' : 'text-ink-muted'}`
                      }>
                      
                          <span>{l.label}</span>
                          <span className="font-mono text-[10px] text-ink-faint">/{l.code}</span>
                        </button>
                      </li>
                  )}
                  </motion.ul>
                }
              </AnimatePresence>
            </div>

            <Button to="/request-demo" size="sm" className="ml-2 hidden sm:inline-flex">
              {t.common.requestDemo}
            </Button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="ml-1 flex h-9 w-9 items-center justify-center text-ink lg:hidden">
              
              {mobileOpen ? <XIcon className="h-5 w-5" strokeWidth={1.5} /> : <MenuIcon className="h-5 w-5" strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {openMenu &&
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="hidden border-t border-line bg-space-1/97 backdrop-blur-xl lg:block">
            
              <div className="mx-auto grid max-w-shell grid-cols-3 gap-x-10 gap-y-1 px-10 py-8">
                {navigation.
              find((n) => n.label === openMenu)?.
              children?.map((child) =>
              <Link
                key={child.label}
                href={child.to}
                className="group border-l border-transparent py-3 pl-4 transition-colors duration-150 ease-sim hover:border-cyan">
                
                      <div className="text-sm text-ink group-hover:text-cyan-soft">{child.label}</div>
                      {child.note && <div className="mt-1 text-[13px] leading-snug text-ink-faint">{child.note}</div>}
                    </Link>
              )}
              </div>
            </motion.div>
          }
        </AnimatePresence>

        <AnimatePresence>
          {mobileOpen &&
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden border-t border-line bg-space-0 lg:hidden">
            
              <nav className="max-h-[70vh] overflow-y-auto px-5 py-4" aria-label="Mobile">
                {navigation.map((item) =>
              <div key={item.label} className="border-b border-line/60 py-3">
                    <Link href={item.to} className="block text-[15px] text-ink">
                      {t.nav[item.label] ?? item.label}
                    </Link>
                    {item.children &&
                <div className="mt-2 flex flex-col gap-1.5">
                        {item.children.map((c) =>
                  <Link key={c.label} href={c.to} className="text-[13px] text-ink-faint">
                            {c.label}
                          </Link>
                  )}
                      </div>
                }
                  </div>
              )}
                <Button to="/request-demo" className="mt-5 w-full">
                  {t.common.requestDemo}
                </Button>
              </nav>
            </motion.div>
          }
        </AnimatePresence>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>);

}