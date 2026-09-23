'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { I18nProvider } from '../../i18n';
import { AutoTranslate } from '../i18n/AutoTranslate';
import { SimorghAIChat } from '../ai/SimorghAIChat';

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <I18nProvider>
      <div className="flex min-h-screen w-full flex-col bg-space-0">
      <Header />
      <AutoTranslate />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <SimorghAIChat />
      </div>
    </I18nProvider>);

}