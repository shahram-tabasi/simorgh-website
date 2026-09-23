'use client';

import { useEffect } from 'react';
import { useI18n } from '../../i18n';

const CACHE_PREFIX = 'simorgh-auto-translation:';
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA', 'INPUT', 'OPTION']);

function isTranslatable(node: Text) {
  const parent = node.parentElement;
  if (!parent || SKIP_TAGS.has(parent.tagName)) return false;
  if (parent.closest('[data-no-translate]')) return false;
  const value = node.nodeValue?.replace(/\s+/g, ' ').trim() || '';
  if (value.length < 2 || !/[A-Za-z]/.test(value)) return false;
  if (/^(https?:\/\/|www\.|\/[A-Za-z0-9_-]+|#[A-Za-z0-9_-]+|[A-Z0-9_./:+-]{2,})$/.test(value)) return false;
  return true;
}

function textNodes(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node as Text;
    if (isTranslatable(text)) nodes.push(text);
  }
  return nodes;
}

export function AutoTranslate() {
  const { locale } = useI18n();

  useEffect(() => {
    if (locale === 'en') return;
    let cancelled = false;
    let observer: MutationObserver | null = null;
    let running = false;

    const run = async () => {
      if (running || cancelled) return;
      running = true;
      const nodes = textNodes(document.body);
      const unique = new Map<string, Text[]>();
      for (const node of nodes) {
        const raw = node.nodeValue?.replace(/\s+/g, ' ').trim() || '';
        if (!raw) continue;
        const list = unique.get(raw) || [];
        list.push(node);
        unique.set(raw, list);
      }

      const cacheKey = `${CACHE_PREFIX}${locale}`;
      let cache: Record<string, string> = {};
      try { cache = JSON.parse(localStorage.getItem(cacheKey) || '{}'); } catch {}
      const missing = [...unique.keys()].filter((text) => !cache[text]);

      observer?.disconnect();
      for (const [source, targets] of unique) {
        if (cache[source]) targets.forEach((n) => { n.nodeValue = cache[source]; });
      }

      for (let i = 0; i < missing.length; i += 35) {
        if (cancelled) break;
        const chunk = missing.slice(i, i + 35);
        try {
          const response = await fetch('/api/translate', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locale, texts: chunk })
          });
          const data = await response.json();
          if (Array.isArray(data.translations) && data.translations.length === chunk.length) {
            chunk.forEach((source, index) => {
              cache[source] = data.translations[index];
              unique.get(source)?.forEach((n) => { n.nodeValue = data.translations[index]; });
            });
            try { localStorage.setItem(cacheKey, JSON.stringify(cache)); } catch {}
          }
        } catch {}
      }

      running = false;
      if (!cancelled) {
        observer = new MutationObserver(() => {
          window.clearTimeout((observer as MutationObserver & { timer?: number }).timer);
          (observer as MutationObserver & { timer?: number }).timer = window.setTimeout(run, 300);
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }
    };

    run();
    return () => { cancelled = true; observer?.disconnect(); };
  }, [locale]);

  return null;
}
