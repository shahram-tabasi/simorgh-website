'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { I18nProvider } from '../../i18n';
import { AutoTranslate } from '../i18n/AutoTranslate';
import { SimorghAIChat } from '../ai/SimorghAIChat';
import { Starfield } from '../ui/Starfield';
import { SimorghFlight } from '../ui/SimorghFlight';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <I18nProvider>
      {/* The site-wide sky: fixed behind everything, seen through the translucent sections. */}
      <div aria-hidden="true" className="sim-sky pointer-events-none fixed inset-0 -z-10">
        <Starfield fixed meteorEvery={[6, 13]} />
      </div>
      <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <AutoTranslate />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <SimorghFlight />
      <SimorghAIChat />
      </div>
    </I18nProvider>);

}