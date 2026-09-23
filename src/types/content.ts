export type DomainKey = 'ai' | 'engineering' | 'grid' | 'twin' | 'enterprise' | 'cloud';

export interface PipelineStep {
  label: string;
  detail: string;
}

export interface Product {
  slug: string;
  name: string;
  short: string;
  domain: DomainKey;
  icon: string;
  tagline: string;
  summary: string;
  capabilities: {title: string;body: string;}[];
  industries: string[];
  pipeline: PipelineStep[];
  metrics: {value: string;label: string;}[];
  faq: {q: string;a: string;}[];
  featured?: boolean;
}

export interface Industry {
  slug: string;
  name: string;
  lead: string;
  body: string;
  icon: string;
  systems: string[];
  outcomes: {value: string;label: string;}[];
}

export interface Insight {
  slug: string;
  title: string;
  kind: 'Technical Article' | 'Case Study' | 'Video' | 'Whitepaper' | 'News';
  category: string;
  readTime: string;
  excerpt: string;
  date: string;
}

export interface CaseStudy {
  slug: string;
  client: string;
  sector: string;
  title: string;
  result: string;
  metric: string;
  metricLabel: string;
}

export interface NavItem {
  label: string;
  to: string;
  children?: {label: string;to: string;note?: string;}[];
}