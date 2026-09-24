// The starting content: everything the site shipped with, in the editable
// shape. storage/content.json is layered over this, so a fresh install (or a
// field added in a later version) always has a value.
//
// Page backgrounds follow the site's story, one step per tab:
//   Home        — earth-rising-hero: robots and the Simorgh rising out of the earth.
//                 (The world is heading into robotics and AI; SIMORGH builds the
//                 digital twin of that robot.)
//   Products    — earth-light: light breaking out of the earth.
//   Solutions   — world-core: the centre of the world.
//   Industries,
//   Technology  — blue-dots: a field of luminous blue points.
//   Insights    — earth-light mirrored: the earth closing again.
//   Company     — simorgh-wings: the Simorgh itself.

import { products as baseProducts } from '../data/products';
import { aiLayers, caseStudies, ecosystem, industries as baseIndustries, insights, intelligenceChain } from '../data/site';
import { dictionaries } from '../i18n-dictionaries';
import type { HeroText, PageContent, PageKey, SiteContent } from './types';

export const BACKGROUNDS = {
  earthRising: '/images/backgrounds/earth-rising-hero.webp',
  earthLight: '/images/backgrounds/earth-light.webp',
  worldCore: '/images/backgrounds/world-core.webp',
  blueDots: '/images/backgrounds/blue-dots.jpg',
  simorghWings: '/images/backgrounds/simorgh-wings.webp',
} as const;

const productMeta: Record<string, { accent: string; gallery?: string[] }> = {
  'simorgh-design-suite': { accent: 'ELECTRICAL ENGINEERING & AUTOMATION' },
  'simorgh-grid': { accent: 'SMART GRID & ENERGY INTELLIGENCE' },
  'simorgh-digital-twin': { accent: 'SMART MONITORING & DIGITAL TWIN' },
  'simorgh-kara': { accent: 'WORKFORCE & INDUSTRIAL SAFETY' },
  'simorgh-shop': {
    accent: 'PROJECT & BUSINESS MANAGEMENT',
    gallery: ['shop', 'professional', 'elementary', 'scanner'].map((n) => `/images/products/simorgh-shop/editions/${n}.webp`),
  },
  'simorgh-draw': { accent: 'INTELLIGENT ENGINEERING DRAWING' },
  'simorgh-cloud': { accent: 'AI & INFRASTRUCTURE' },
};

const heroText = (): Record<string, HeroText> =>
  Object.fromEntries(Object.entries(dictionaries).map(([code, d]) => [code, { ...d.hero }]));

const page = (heroImage: string, title: string, description: string, heroFlip = false): PageContent =>
  ({ heroImage, heroFlip, seo: { title, description, keywords: '', image: '' } });

const pages: Record<PageKey, PageContent> = {
  home: page(BACKGROUNDS.earthRising, 'SIMORGH — Engineering Intelligence for a Smarter World',
    'AI-powered software, intelligent engineering systems, digital twins and smart infrastructure for industry, utilities and cities.'),
  products: page(BACKGROUNDS.earthLight, 'Products',
    'SIMORGH Design Suite, Grid, Digital Twin, Kara, Shop, Draw and Cloud: seven products sharing one intelligence layer, from electrical design to digital twin.'),
  solutions: page(BACKGROUNDS.worldCore, 'Solutions',
    'Engineering automation, energy intelligence, urban digital twins and industrial safety — the problems SIMORGH solves and the products that solve them.'),
  industries: page(BACKGROUNDS.blueDots, 'Industries',
    'Smart cities, electricity and energy, industrial automation, switchgear, manufacturing, oil and gas, mining, utilities and infrastructure.'),
  technology: page(BACKGROUNDS.blueDots, 'Technology',
    'One intelligence layer beneath every product: computer vision, document AI, engineering AI, RAG, knowledge graphs, agents and digital-twin AI.'),
  insights: page(BACKGROUNDS.earthLight, 'Insights',
    'Technical articles, case studies, recorded walkthroughs and whitepapers from the engineering teams building SIMORGH.', true),
  company: page(BACKGROUNDS.simorghWings, 'About SIMORGH',
    'SIMORGH Intelligent Iranian Technology: an engineering and artificial intelligence company building software for the systems that run industry, energy and cities.'),
  contact: page(BACKGROUNDS.blueDots, 'Contact',
    'Contact SIMORGH for sales, enterprise, partnership and support enquiries.'),
  requestDemo: page(BACKGROUNDS.earthLight, 'Request a demo',
    'See the SIMORGH platform run on a representative sample of your own documentation, telemetry or spatial data.'),
};

export function defaultContent(): SiteContent {
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    settings: {
      siteName: 'SIMORGH',
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://simorgh.tech',
      legalName: 'SIMORGH Intelligent Iranian Technology',
      email: 'contact@simorgh.tech',
      phone: '+98 21 0000 0000',
      address: 'Tehran · Iran',
      social: { linkedin: '', x: '', instagram: '', telegram: '', youtube: '', github: '', aparat: '' },
      gaId: '',
      verification: { google: '', bing: '', yandex: '' },
    },
    seo: {
      defaultTitle: 'SIMORGH — Engineering Intelligence for a Smarter World',
      titleTemplate: '%s | SIMORGH',
      description:
        'SIMORGH builds AI-powered engineering software, digital twins and smart-grid intelligence for industry, utilities and cities — Design Suite, Grid, Digital Twin, Kara, Shop, Draw and Cloud.',
      keywords:
        'SIMORGH, سیمرغ, AI, artificial intelligence, digital twin, smart grid, EPLAN, single line diagram, SLD, switchgear design, electrical engineering software, industrial AI, SCADA, GIS, IoT',
      ogImage: '/images/og-default.jpg',
      twitterHandle: '',
    },
    hero: {
      image: BACKGROUNDS.earthRising,
      mobileImage: '',
      overlay: 0.55,
      focal: '50% 42%',
      primaryTo: '/technology',
      secondaryTo: '/products',
      text: heroText(),
    },
    pages,
    products: baseProducts.map((p, i) => ({
      ...p,
      image: `/images/products/${p.slug}/banner.webp`,
      accent: productMeta[p.slug]?.accent ?? '',
      headerImage: '',
      gallery: productMeta[p.slug]?.gallery ?? [],
      schematics: [],
      status: 'published',
      order: i + 1,
      seo: { title: '', description: '', keywords: '', image: '' },
    })),
    industries: baseIndustries.map((ind, i) => ({
      ...ind,
      image: '',
      status: 'published',
      order: i + 1,
      seo: { title: '', description: '', keywords: '', image: '' },
    })),
    articles: insights.map((a) => ({
      ...a,
      cover: '',
      author: 'SIMORGH',
      body: '',
      video: '',
      status: 'published',
      seo: { title: '', description: '', keywords: '', image: '' },
    })),
    caseStudies,
    ecosystem,
    intelligenceChain,
    aiLayers,
    translations: {},
  };
}
