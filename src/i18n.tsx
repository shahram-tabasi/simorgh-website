'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { languages } from './data/site';
import { dictionaries, type Dictionary, type Locale } from './i18n-dictionaries';

export type { Locale };

const I18nContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}>({ locale: 'en', setLocale: () => undefined, t: dictionaries.en });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = window.localStorage.getItem('simorgh-locale') as Locale | null;
    if (saved && dictionaries[saved]) setLocaleState(saved);
  }, []);

  useEffect(() => {
    const lang = languages.find((item) => item.code === locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = lang?.dir ?? 'ltr';
    document.body.dataset.locale = locale;
    document.body.classList.toggle('locale-fa', locale === 'fa');
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem('simorgh-locale', next);
  };

  const value = useMemo(() => ({ locale, setLocale, t: dictionaries[locale] }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Every string a locale's dictionary already renders, lower-cased. These are
 * localised at the source, so the page translator must leave them alone
 * (German "Produkte" is not English waiting to be translated).
 */
export function dictionaryValues(locale: Locale) {
  const values = new Set<string>();
  const walk = (value: unknown) => {
    if (typeof value === 'string') values.add(value.replace(/\s+/g, ' ').trim().toLowerCase());
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  if (locale !== 'en') walk(dictionaries[locale]);
  return values;
}

export function useI18n() {
  return useContext(I18nContext);
}
