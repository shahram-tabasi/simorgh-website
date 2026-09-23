import { REF_IMAGE_HERO, REF_IMAGE_NEURAL, REF_IMAGE_PLANET } from './site';

export interface HeroMedia {
  /** Admin-selectable hero media type. Swapping to 'video' requires no code change. */
  type: 'image' | 'video';
  /** Desktop / tablet / mobile compositions are addressed separately, never cropped from one source. */
  desktop: string;
  tablet: string;
  mobile: string;
  /** Used when type is 'video'. MP4 and WebM sources are both supported. */
  videoMp4?: string;
  videoWebm?: string;
  focal: string;
}

export interface HeroSlide {
  id: string;
  active: boolean;
  order: number;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subtitle: string;
  kicker: string;
  primaryCta: {label: string;to: string;};
  secondaryCta: {label: string;to: string;};
  overlay: number;
  media: HeroMedia;
  startDate?: string;
  endDate?: string;
}

export const heroSlides: HeroSlide[] = [
{
  id: 'hero-primary',
  active: true,
  order: 1,
  eyebrow: 'SIMORGH INTELLIGENT TECHNOLOGY',
  headline: 'Engineering Intelligence',
  headlineAccent: 'for a Smarter World',
  subtitle:
  'AI-powered software, intelligent engineering systems, digital twins and smart infrastructure for industry, utilities and cities.',
  kicker: 'AI · INDUSTRY · DIGITAL TWIN · SMART GRID',
  primaryCta: { label: 'Explore Our Technology', to: '/technology' },
  secondaryCta: { label: 'Explore Products', to: '/products' },
  overlay: 0.55,
  media: {
    type: 'image',
    desktop: REF_IMAGE_HERO,
    tablet: REF_IMAGE_HERO,
    mobile: REF_IMAGE_HERO,
    focal: '50% 42%'
  }
},
{
  id: 'hero-digital-twin',
  active: false,
  order: 2,
  eyebrow: 'SIMORGH DIGITAL TWIN',
  headline: 'A City You Can',
  headlineAccent: 'Ask About Tomorrow',
  subtitle:
  'GIS, infrastructure, telemetry and system dynamics bound into one environment where interventions are tested before they are funded.',
  kicker: 'GIS · IoT · SYSTEM DYNAMICS · SCENARIO ANALYSIS',
  primaryCta: { label: 'Explore Digital Twin', to: '/products/simorgh-digital-twin' },
  secondaryCta: { label: 'Request a Demo', to: '/request-demo' },
  overlay: 0.6,
  media: {
    type: 'image',
    desktop: REF_IMAGE_PLANET,
    tablet: REF_IMAGE_PLANET,
    mobile: REF_IMAGE_NEURAL,
    focal: '50% 50%'
  }
}];


export const activeHero = heroSlides.filter((s) => s.active).sort((a, b) => a.order - b.order)[0];