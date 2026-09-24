'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { languages } from '../../data/site';
import { useContent } from '../../content/ContentProvider';
import { useI18n } from '../../i18n';

const columns = (products: { short: string; slug: string }[], industries: { name: string; slug: string }[]) => [
{
  title: 'Products',
  links: products.map((p) => ({ label: p.short, to: `/products/${p.slug}` }))
},
{
  title: 'Industries',
  links: industries.slice(0, 7).map((i) => ({ label: i.name, to: `/industries/${i.slug}` }))
},
{
  title: 'Company',
  links: [
  { label: 'About SIMORGH', to: '/company' },
  { label: 'Technology', to: '/technology' },
  { label: 'Insights', to: '/insights' },
  { label: 'Careers', to: '/company' },
  { label: 'Contact', to: '/contact' },
  { label: 'Request a Demo', to: '/request-demo' }]

}];


export function Footer() {
  const { products, industries } = useContent();
  const { t, locale } = useI18n();
  return (
    <footer className="relative border-t border-line bg-space-1">
      <div className="mx-auto max-w-shell px-5 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-faint">
              {locale === 'fa' ? 'نرم‌افزار هوشمند برای سیستم‌های واقعی؛ هوش مصنوعی، دانش مهندسی و زیرساخت در یک پلتفرم.' : 'Intelligent software for real-world systems — artificial intelligence, engineering knowledge and infrastructure, working as one platform.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-1.5" data-no-translate>
              {languages.map((l) =>
              <span key={l.code} className="border border-line px-2 py-1 font-mono text-[10px] text-ink-faint">
                  /{l.code}
                </span>
              )}
            </div>
          </div>

          {columns(products, industries).map((col) =>
          <div key={col.title}>
              <h3 className="font-mono text-[10px] tracking-label text-cyan/80">{(t.nav[col.title] ?? col.title).toUpperCase()}</h3>
              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((l) =>
              <li key={l.label}>
                    <Link
                  href={l.to}
                  className="text-[13.5px] text-ink-muted transition-colors duration-150 ease-sim hover:text-cyan-soft">
                  
                      {l.label}
                    </Link>
                  </li>
              )}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-8 text-[12.5px] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SIMORGH Intelligent Iranian Technology. All rights reserved.</p>
          <p className="font-mono text-[11px] tracking-[0.12em]">
            AI · ENGINEERING · SMART GRID · DIGITAL TWIN
          </p>
        </div>
      </div>
    </footer>);

}