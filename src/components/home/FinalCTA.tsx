'use client';

import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Starfield } from '../ui/Starfield';
import { REF_IMAGE_BIRD } from '../../data/site';
import { useI18n } from '../../i18n';

export function FinalCTA() {
  const { t, locale } = useI18n();
  return (
    <section className="relative w-full overflow-hidden border-t border-line bg-space-0">
      <div className="absolute inset-0">
        <img src={REF_IMAGE_BIRD} alt="" aria-hidden="true" loading="lazy" className="h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-space-0 via-space-0/75 to-space-0" />
      </div>
      <Starfield className="opacity-70" />

      <div className="relative mx-auto max-w-shell px-5 py-28 text-center lg:px-10 lg:py-36">
        <span className="font-mono text-[10.5px] tracking-label text-cyan">10 / BUILD THE INTELLIGENT FUTURE</span>
        <h2 className="mx-auto mt-7 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white lg:text-[56px]">
          {locale === 'fa' ? 'آینده هوشمند را بسازید' : 'Build the Intelligent Future'}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-ink-muted lg:text-[17px]">
          Talk to the engineers behind the platform about your network, your plant or your city — and what an
          intelligent layer over it would actually change.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button to="/products" size="lg">
            {locale === 'fa' ? 'کشف سیمرغ' : 'Explore SIMORGH'}
            <ArrowRightIcon className="h-4 w-4" strokeWidth={1.6} />
          </Button>
          <Button to="/request-demo" size="lg" variant="outline">
            {t.common.requestDemo}
          </Button>
        </div>
      </div>
    </section>);

}