// The shape of everything the admin panel can edit. Stored as one JSON file
// (storage/content.json, see ./store.ts) and read by the site on every build
// of a page; saving from the admin revalidates the site, so edits go live
// without a rebuild.

import type { CaseStudy, DomainKey, Industry, Insight, PipelineStep } from '../types/content';

/** A media URL: a built-in /public path ("/2.jpg") or an upload ("/media/…"). Empty string = none. */
export type MediaUrl = string;

export interface Seo {
  /** <title> for the page; the site-wide template adds "| SIMORGH". */
  title?: string;
  /** Meta description: what search engines show under the title. ~150 characters. */
  description?: string;
  /** Comma separated. */
  keywords?: string;
  /** Social-share image (Open Graph / Twitter); falls back to the page's hero image. */
  image?: MediaUrl;
  /** Keep this page out of search engines. */
  noindex?: boolean;
}

export type Status = 'published' | 'draft';

export type PageKey =
  | 'home' | 'products' | 'solutions' | 'industries' | 'technology' | 'insights'
  | 'company' | 'contact' | 'requestDemo';

export interface PageContent {
  /** Background of the page header. */
  heroImage: MediaUrl;
  /** Mirror the background vertically (the "closing earth"). */
  heroFlip?: boolean;
  seo: Seo;
}

export interface HeroText {
  eyebrow: string;
  headline: string;
  accent: string;
  subtitle: string;
  primary: string;
  secondary: string;
  kicker: string;
}

export interface HeroContent {
  image: MediaUrl;
  mobileImage: MediaUrl;
  /** 0–1: how dark the scrim over the image is. */
  overlay: number;
  /** CSS object-position of the image, e.g. "50% 42%". */
  focal: string;
  primaryTo: string;
  secondaryTo: string;
  /** Per-language texts. Missing languages fall back to English. */
  text: Record<string, HeroText>;
}

export interface Schematic {
  src: MediaUrl;
  caption: string;
}

export interface ProductEntry {
  slug: string;
  name: string;
  short: string;
  domain: DomainKey;
  icon: string;
  tagline: string;
  summary: string;
  capabilities: { title: string; body: string }[];
  industries: string[];
  pipeline: PipelineStep[];
  metrics: { value: string; label: string }[];
  faq: { q: string; a: string }[];
  featured?: boolean;
  /** Banner: the product's card in the products slider. */
  image: MediaUrl;
  /** The small upper-case line above the name in the slider. */
  accent: string;
  /** Background of the product page header; falls back to the banner. */
  headerImage: MediaUrl;
  /** Screenshots and photos, shown as a gallery on the product page. */
  gallery: MediaUrl[];
  /** Diagrams / schematics with captions, shown on the product page. */
  schematics: Schematic[];
  status: Status;
  order: number;
  seo: Seo;
}

export interface IndustryEntry extends Industry {
  image: MediaUrl;
  status: Status;
  order: number;
  seo: Seo;
}

export interface Article extends Insight {
  /** Cover image for the list and the article header. */
  cover: MediaUrl;
  author: string;
  /** The article itself, in Markdown. */
  body: string;
  /** For kind "Video": an uploaded video or a YouTube/Aparat URL. */
  video: string;
  status: Status;
  seo: Seo;
}

export interface Settings {
  siteName: string;
  /** Public address of the site, e.g. https://simorgh.tech — used for canonical links, sitemap and sharing. */
  siteUrl: string;
  legalName: string;
  email: string;
  phone: string;
  address: string;
  social: { linkedin: string; x: string; instagram: string; telegram: string; youtube: string; github: string; aparat: string };
  /** Google Analytics 4 measurement id (G-XXXX). Empty = no analytics. */
  gaId: string;
  verification: { google: string; bing: string; yandex: string };
}

export interface SeoGlobal {
  defaultTitle: string;
  titleTemplate: string;
  description: string;
  keywords: string;
  ogImage: MediaUrl;
  twitterHandle: string;
}

export interface SiteContent {
  version: 1;
  updatedAt: string;
  settings: Settings;
  seo: SeoGlobal;
  hero: HeroContent;
  pages: Record<PageKey, PageContent>;
  products: ProductEntry[];
  industries: IndustryEntry[];
  articles: Article[];
  caseStudies: CaseStudy[];
  ecosystem: { key: string; code: string; title: string; body: string; icon: string }[];
  intelligenceChain: { label: string; detail: string }[];
  aiLayers: { title: string; body: string }[];
  /** Translation overrides and additions, per language: English text → translation. */
  translations: Record<string, Record<string, string>>;
}

/** What the site's pages get on the client: everything but the long article bodies. */
export type PublicContent = Omit<SiteContent, 'articles'> & { articles: Omit<Article, 'body'>[] };
