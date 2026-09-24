'use client';

import { useEffect } from 'react';
import { dictionaryValues, useI18n, type Locale } from '../../i18n';
import { isProtectedOnly } from '../../data/glossary';
import { useContent } from '../../content/ContentProvider';

// Translates the rendered page in place.
//
// Most of the site's copy is written in English in the components and data
// files. Rather than threading a dictionary through every one of them, this
// walks the DOM and swaps each English string for its translation:
//
//   1. The bundled catalog for the locale (src/locales/<locale>.json) —
//      reviewed translations of every string on the site, so switching
//      language works with no network and no API key.
//   2. Anything the catalog does not have (content edited in the admin, a new
//      page) goes to /api/translate, and the answer is cached per browser.
//
// Product and program names, standards and technical acronyms are never
// translated (see data/glossary.ts), and neither is anything inside
// [data-no-translate].
//
// Every node remembers its English source, so switching from Persian to
// German translates from English again rather than from Persian, and
// switching back to English restores the original text exactly.

type Catalog = Record<string, string>;
/** A catalog entry with slots, e.g. "Discuss a {0} deployment" — for sentences built around a name. */
type Pattern = { regex: RegExp; slots: number[]; template: string };

const CACHE_PREFIX = 'simorgh-auto-translation:v2:';
const LEGACY_CACHE_PREFIX = 'simorgh-auto-translation:';
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA', 'SVG']);
const ATTRIBUTES = ['placeholder', 'aria-label', 'title', 'alt'] as const;
const API_BATCH = 40;

const catalogLoaders: Record<Exclude<Locale, 'en'>, () => Promise<{ default: Catalog }>> = {
  fa: () => import('../../locales/fa.json'),
  ar: () => import('../../locales/ar.json'),
  tr: () => import('../../locales/tr.json'),
  de: () => import('../../locales/de.json'),
  fr: () => import('../../locales/fr.json'),
  es: () => import('../../locales/es.json'),
  zh: () => import('../../locales/zh.json'),
  ja: () => import('../../locales/ja.json'),
  ru: () => import('../../locales/ru.json'),
};

const catalogs = new Map<Locale, { entries: Catalog; patterns: Pattern[] }>();
/** Set once the API has said it cannot translate (no key configured), so we stop asking. */
let apiUnavailable = false;

/** The English a text node or attribute holds, and the translation we last wrote over it. */
type Slot = { source: string; applied: string | null };
const textSlots = new WeakMap<Text, Slot>();
const attributeSlots = new WeakMap<Element, Map<string, Slot>>();

const normalise = (value: string) => value.replace(/\s+/g, ' ').trim();

function compilePatterns(entries: Catalog): Pattern[] {
  return Object.entries(entries)
    .filter(([key]) => /\{\d\}/.test(key))
    .map(([key, template]) => {
      const slots: number[] = [];
      const source = key
        .split(/(\{\d\})/)
        .map((part) => {
          const slot = part.match(/^\{(\d)\}$/);
          if (slot) { slots.push(Number(slot[1])); return '(.+?)'; }
          return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        })
        .join('');
      return { regex: new RegExp(`^${source}$`), slots, template };
    });
}

function readCache(locale: Locale): Catalog {
  try { return JSON.parse(localStorage.getItem(CACHE_PREFIX + locale) || '{}'); } catch { return {}; }
}

function writeCache(locale: Locale, cache: Catalog) {
  try { localStorage.setItem(CACHE_PREFIX + locale, JSON.stringify(cache)); } catch {}
}

function dropLegacyCache() {
  // The old cache stored untranslated English whenever the API had no key,
  // and then served it forever. It is not worth keeping.
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(LEGACY_CACHE_PREFIX) && !key.startsWith(CACHE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {}
}

function skippedElement(element: Element | null) {
  if (!element) return true;
  if (SKIP_TAGS.has(element.tagName.toUpperCase())) return true;
  return Boolean(element.closest('[data-no-translate], [contenteditable="true"], svg'));
}

/** The source (English) of a slot, noticing when React has written new text over our translation. */
function sourceOf(slot: Slot | undefined, current: string) {
  if (slot && slot.applied !== null && current === slot.applied) return slot.source;
  return current;
}

export function AutoTranslate() {
  const { locale } = useI18n();
  // Translations the admin added or corrected win over the bundled catalog.
  const overrides = useContent().translations?.[locale];

  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | null = null;
    let flushTimer: number | undefined;
    const localised = dictionaryValues(locale);
    const cache = locale === 'en' ? {} : readCache(locale);
    const missing = new Set<string>();
    let catalog = catalogs.get(locale) ?? { entries: {}, patterns: [] };

    const lookup = (key: string): string | undefined => {
      const direct = catalog.entries[key] ?? cache[key];
      if (direct !== undefined) return direct;
      for (const pattern of catalog.patterns) {
        const match = key.match(pattern.regex);
        if (!match) continue;
        // The filled-in parts are translated too when the catalog knows them ("sales"),
        // and left alone when it does not (a product name, an email address).
        return pattern.slots.reduce((text, slot, index) => {
          const value = match[index + 1];
          return text.replace(`{${slot}}`, catalog.entries[value] ?? cache[value] ?? value);
        }, pattern.template);
      }
      return undefined;
    };

    const translatable = (key: string) => {
      if (key.length < 2 || !/[A-Za-z]/.test(key)) return false;
      if (/^(https?:\/\/|www\.|\/[\w-]*$|#[\w-]+$)/.test(key) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) return false;
      if (localised.has(key.toLowerCase())) return false;
      return true;
    };

    /** What `source` should read as in the current locale; `source` itself when there is nothing (yet). */
    const target = (source: string) => {
      if (locale === 'en') return source;
      const key = normalise(source);
      if (!translatable(key)) return source;
      const translated = lookup(key);
      if (translated === undefined) {
        if (!isProtectedOnly(key)) missing.add(key);
        return source;
      }
      // Keep the whitespace around the text: it is what separates it from its neighbours.
      const lead = source.match(/^\s*/)?.[0] ?? '';
      const trail = source.match(/\s*$/)?.[0] ?? '';
      return lead + translated + trail;
    };

    const applyText = (node: Text) => {
      if (skippedElement(node.parentElement)) return;
      const current = node.nodeValue ?? '';
      const source = sourceOf(textSlots.get(node), current);
      const next = target(source);
      textSlots.set(node, { source, applied: next === source ? null : next });
      if (next !== current) node.nodeValue = next;
    };

    const applyAttribute = (element: Element, name: string) => {
      const current = element.getAttribute(name);
      // Only opt-outs matter here: an <input>'s or <textarea>'s placeholder is still translated.
      if (current === null || element.closest('[data-no-translate], svg')) return;
      let slots = attributeSlots.get(element);
      if (!slots) { slots = new Map(); attributeSlots.set(element, slots); }
      const source = sourceOf(slots.get(name), current);
      const next = target(source);
      slots.set(name, { source, applied: next === source ? null : next });
      if (next !== current) element.setAttribute(name, next);
    };

    const applyTree = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) { applyText(root as Text); return; }
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      const element = root as Element;
      if (element.closest('[data-no-translate], [contenteditable="true"], svg')) return;
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) applyText(node as Text);
      const selector = ATTRIBUTES.map((name) => `[${name}]`).join(',');
      if (element.matches(selector)) ATTRIBUTES.forEach((name) => applyAttribute(element, name));
      element.querySelectorAll(selector).forEach((child) => ATTRIBUTES.forEach((name) => applyAttribute(child, name)));
    };

    /** Anything neither the catalog nor the cache knows goes to the API, a batch at a time. */
    const flushMissing = async () => {
      if (cancelled || apiUnavailable || missing.size === 0) return;
      const texts = [...missing];
      missing.clear();
      let learned = false;
      for (let i = 0; i < texts.length && !cancelled && !apiUnavailable; i += API_BATCH) {
        const chunk = texts.slice(i, i + API_BATCH);
        try {
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locale, texts: chunk }),
          });
          const data = await response.json();
          if (data.unavailable) { apiUnavailable = true; break; }
          if (data.fallback) continue;
          if (Array.isArray(data.translations) && data.translations.length === chunk.length) {
            chunk.forEach((source, index) => {
              if (typeof data.translations[index] === 'string') cache[source] = data.translations[index];
            });
            learned = true;
          }
        } catch {
          break;
        }
      }
      if (learned && !cancelled) {
        writeCache(locale, cache);
        run(document.body);
      }
    };

    const scheduleFlush = () => {
      if (missing.size === 0 || apiUnavailable) return;
      window.clearTimeout(flushTimer);
      flushTimer = window.setTimeout(flushMissing, 400);
    };

    const observe = () => observer?.observe(document.body, {
      childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [...ATTRIBUTES],
    });

    const run = (root: Node) => {
      observer?.disconnect();
      applyTree(root);
      observe();
      scheduleFlush();
    };

    // Runs synchronously inside the mutation callback — before the browser
    // paints — so new content appears already translated, without a flash of English.
    observer = new MutationObserver((records) => {
      observer?.disconnect();
      for (const record of records) {
        if (record.type === 'childList') record.addedNodes.forEach(applyTree);
        else if (record.type === 'characterData') applyText(record.target as Text);
        else if (record.type === 'attributes' && record.attributeName) applyAttribute(record.target as Element, record.attributeName);
      }
      observe();
      scheduleFlush();
    });

    const start = async () => {
      dropLegacyCache();
      if (locale !== 'en' && !catalogs.has(locale)) {
        try {
          const entries = (await catalogLoaders[locale as Exclude<Locale, 'en'>]()).default;
          catalogs.set(locale, { entries, patterns: compilePatterns(entries) });
        } catch {
          catalogs.set(locale, { entries: {}, patterns: [] });
        }
      }
      if (cancelled) return;
      catalog = catalogs.get(locale) ?? { entries: {}, patterns: [] };
      if (overrides && Object.keys(overrides).length) {
        const entries = { ...catalog.entries, ...overrides };
        catalog = { entries, patterns: compilePatterns(entries) };
      }
      run(document.body);
    };

    start();
    return () => {
      cancelled = true;
      window.clearTimeout(flushTimer);
      observer?.disconnect();
    };
  }, [locale, overrides]);

  return null;
}
