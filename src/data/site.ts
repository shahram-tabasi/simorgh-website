import type { CaseStudy, Industry, Insight, NavItem } from '../types/content';
import { products } from './products';

export const REF_IMAGE_HERO = "/2.jpg";
export const REF_IMAGE_NEURAL = "/3.jpg";
export const REF_IMAGE_BIRD = "/4.png";
export const REF_IMAGE_PLANET = "/33.jpg";

export const languages = [
{ code: 'en', label: 'English', dir: 'ltr' as const },
{ code: 'fa', label: 'فارسی', dir: 'rtl' as const },
{ code: 'ar', label: 'العربية', dir: 'rtl' as const },
{ code: 'tr', label: 'Türkçe', dir: 'ltr' as const },
{ code: 'de', label: 'Deutsch', dir: 'ltr' as const },
{ code: 'fr', label: 'Français', dir: 'ltr' as const },
{ code: 'es', label: 'Español', dir: 'ltr' as const },
{ code: 'zh', label: '中文', dir: 'ltr' as const },
{ code: 'ja', label: '日本語', dir: 'ltr' as const },
{ code: 'ru', label: 'Русский', dir: 'ltr' as const }];


export const navigation: NavItem[] = [
{
  label: 'Products',
  to: '/products',
  children: products.map((p) => ({ label: p.short, to: `/products/${p.slug}`, note: p.tagline }))
},
{
  label: 'Solutions',
  to: '/solutions',
  children: [
  { label: 'Engineering Automation', to: '/solutions', note: 'Document to design, without transcription.' },
  { label: 'Energy Intelligence', to: '/solutions', note: 'Network awareness for distribution operators.' },
  { label: 'Urban Digital Twin', to: '/solutions', note: 'Scenario analysis for city infrastructure.' },
  { label: 'Industrial Safety', to: '/solutions', note: 'Vision-assisted compliance at site level.' }]

},
{
  label: 'Industries',
  to: '/industries',
  children: [
  { label: 'Smart Cities', to: '/industries/smart-cities' },
  { label: 'Electricity & Energy', to: '/industries/electricity-energy' },
  { label: 'Industrial Automation', to: '/industries/industrial-automation' },
  { label: 'Switchgear', to: '/industries/switchgear' },
  { label: 'Oil & Gas', to: '/industries/oil-gas' },
  { label: 'Mining', to: '/industries/mining' }]

},
{ label: 'Technology', to: '/technology' },
{ label: 'Insights', to: '/insights' },
{ label: 'Company', to: '/company' }];


export const ecosystem = [
{ key: 'ai', code: 'AI', title: 'Artificial Intelligence', body: 'Vision, document, retrieval and agent models trained on engineering material.', icon: 'ai' },
{ key: 'engineering', code: 'ENG', title: 'Engineering Automation', body: 'Design generation, validation and drawing intelligence for electrical systems.', icon: 'drafting' },
{ key: 'grid', code: 'GRID', title: 'Energy Intelligence', body: 'Network models, event correlation and operator decision support.', icon: 'grid' },
{ key: 'twin', code: 'TWIN', title: 'Cities & Industry', body: 'Spatial, telemetry and system-dynamics models bound into one environment.', icon: 'twin' },
{ key: 'enterprise', code: 'ENT', title: 'Business Software', body: 'Accounting, inventory and workforce systems built for engineering organisations.', icon: 'ledger' },
{ key: 'cloud', code: 'CLOUD', title: 'AI & Infrastructure', body: 'Model serving, pipelines, knowledge stores and identity under one governance model.', icon: 'cloud' }];


export const intelligenceChain = [
{ label: 'Data', detail: 'Documents, telemetry, spatial records and operational history.' },
{ label: 'AI', detail: 'Models that read, see, retrieve and reason over engineering material.' },
{ label: 'Knowledge', detail: 'Standards, company practice and prior projects as a governed graph.' },
{ label: 'Engineering', detail: 'Domain rules that make an output defensible, not merely plausible.' },
{ label: 'Digital Twin', detail: 'A bound model of the real system, queryable about the future.' },
{ label: 'Decision Intelligence', detail: 'Ranked options with the evidence chain attached.' },
{ label: 'Action', detail: 'An engineer or operator acting with full traceability.' }];


export const aiLayers = [
{ title: 'Computer Vision', body: 'Symbol detection in drawings, PPE and zone compliance on site, asset condition from imagery.' },
{ title: 'Document AI', body: 'Layout-aware extraction from specifications, datasheets and tender packages.' },
{ title: 'Engineering AI', body: 'Models trained on electrical topology, sizing and protection practice.' },
{ title: 'RAG', body: 'Retrieval grounded in your own standards and project archive, with citations.' },
{ title: 'Knowledge Graph', body: 'Equipment, projects, standards and people as one connected structure.' },
{ title: 'AI Agents', body: 'Bounded task agents for review, comparison and preparation work.' },
{ title: 'Digital Twin AI', body: 'Forecasting and anomaly detection over bound spatial and telemetry models.' },
{ title: 'Decision Intelligence', body: 'Options ranked against operational objectives, with evidence.' }];


export const industries: Industry[] = [
{
  slug: 'smart-cities',
  name: 'Smart Cities',
  lead: 'Cities are interacting systems, not dashboards.',
  body: 'SIMORGH binds GIS, traffic, energy, water, buildings and IoT telemetry into one twin, then applies system dynamics so municipal teams can compare interventions before committing capital.',
  icon: 'city',
  systems: ['City', 'Traffic', 'Energy', 'Water', 'Infrastructure', 'Buildings', 'GIS', 'IoT', 'AI', 'Digital Twin', 'System Dynamics'],
  outcomes: [
  { value: '20yr', label: 'Planning horizon modelled' },
  { value: '11', label: 'Domain layers unified' },
  { value: '1', label: 'Shared municipal data model' }]

},
{
  slug: 'electricity-energy',
  name: 'Electricity & Energy',
  lead: 'From feeder telemetry to a defensible operator decision.',
  body: 'Distribution operators run on incomplete signals. SIMORGH Grid builds a live network model, correlates protection and metering events, localises faults and proposes restoration sequencing with the evidence attached.',
  icon: 'bolt',
  systems: ['Smart Grid', 'Distribution', 'Transformer', 'Feeder', 'Load', 'Fault', 'Outage', 'AI Analysis', 'Decision Support'],
  outcomes: [
  { value: '38%', label: 'Faster fault localisation' },
  { value: '12k', label: 'Events correlated per hour' },
  { value: '99.2%', label: 'Asset model coverage' }]

},
{
  slug: 'industrial-automation',
  name: 'Industrial Automation',
  lead: 'Electrical engineering work that no longer waits on documentation.',
  body: 'Switchgear design, SLD production, cable schedules, protection settings and PLC interfaces are generated from source documentation and validated against standards before an engineer reviews them.',
  icon: 'circuit',
  systems: ['Electrical Engineering', 'Switchgear', 'EPLAN Integration', 'SLD', 'Equipment', 'Cable', 'Protection', 'PLC', 'Industrial AI'],
  outcomes: [
  { value: '4.1×', label: 'Faster design throughput' },
  { value: '72%', label: 'Less document handling' },
  { value: '0', label: 'Checks deferred to review' }]

},
{
  slug: 'switchgear',
  name: 'Switchgear',
  lead: 'Panel engineering from tender to release.',
  body: 'Tender documents become equipment lists, single line diagrams, panel layouts and costed bills of material — with every figure traceable to the clause that produced it.',
  icon: 'panel',
  systems: ['Tender Analysis', 'Equipment Selection', 'SLD', 'Panel Layout', 'BOM', 'Costing', 'Release'],
  outcomes: [
  { value: '3×', label: 'More tenders answered' },
  { value: '100%', label: 'Clause-level traceability' },
  { value: 'BOM', label: 'Direct to procurement' }]

},
{
  slug: 'manufacturing',
  name: 'Manufacturing',
  lead: 'Production, workforce and commercial systems on one record.',
  body: 'Kara and Shop cover site presence, safety compliance, inventory and project accounting for plants where engineering and production share the same cost base.',
  icon: 'factory',
  systems: ['Workforce', 'Safety', 'Inventory', 'Procurement', 'Project Accounting', 'Site Analytics'],
  outcomes: [
  { value: '6', label: 'Systems consolidated' },
  { value: '24/7', label: 'Safety observation' },
  { value: '3d', label: 'Faster financial close' }]

},
{
  slug: 'oil-gas',
  name: 'Oil & Gas',
  lead: 'Documentation-heavy engineering, under control.',
  body: 'Decades of specifications, vendor packages and as-built drawings become a searchable engineering knowledge base that design and integrity teams can actually query.',
  icon: 'rig',
  systems: ['Document AI', 'Knowledge Graph', 'Electrical Design', 'Integrity Data', 'Permit & Safety', 'Vision Monitoring'],
  outcomes: [
  { value: '10yr+', label: 'Archive made queryable' },
  { value: 'RAG', label: 'Answers with citations' },
  { value: '24/7', label: 'Site compliance coverage' }]

},
{
  slug: 'mining',
  name: 'Mining',
  lead: 'Remote sites, continuous observation.',
  body: 'Workforce presence, restricted-zone compliance and electrical infrastructure health tracked continuously across sites where supervision cannot be everywhere at once.',
  icon: 'mining',
  systems: ['Workforce', 'Vision Safety', 'Electrical Assets', 'Energy Monitoring', 'Incident Workflow'],
  outcomes: [
  { value: '<2%', label: 'Open compliance exceptions' },
  { value: '24/7', label: 'Continuous observation' },
  { value: 'Multi', label: 'Site consolidation' }]

},
{
  slug: 'utilities',
  name: 'Utilities',
  lead: 'Network operators with an asset problem, not a data problem.',
  body: 'Asset registers, telemetry and outage history combined into one model that supports both daily operations and long-term capital planning.',
  icon: 'bolt',
  systems: ['Asset Register', 'Telemetry', 'Outage History', 'Loss Analytics', 'Capital Planning'],
  outcomes: [
  { value: '1', label: 'Operational model' },
  { value: '20yr', label: 'Capital scenarios' },
  { value: 'Open', label: 'Integration boundaries' }]

},
{
  slug: 'infrastructure',
  name: 'Infrastructure',
  lead: 'Long-lived assets modelled over their real lifetime.',
  body: 'Corridors, networks and facilities represented spatially and dynamically, so degradation, capacity and investment sequencing can be studied together.',
  icon: 'bridge',
  systems: ['GIS', 'Asset Lifecycle', 'Capacity', 'Degradation Models', 'Investment Sequencing'],
  outcomes: [
  { value: '20yr', label: 'Lifecycle horizon' },
  { value: 'GIS', label: 'Spatially bound' },
  { value: 'SD', label: 'System dynamics core' }]

}];


export const getIndustry = (slug: string) => industries.find((i) => i.slug === slug);

export const caseStudies: CaseStudy[] = [
{
  slug: 'regional-dso-fault-localisation',
  client: 'Regional Distribution Operator',
  sector: 'Electricity & Energy',
  title: 'Fault localisation across 4,200 km of medium-voltage feeders',
  result: 'Protection events, metering and outage records correlated into ranked incidents with a recommended switching sequence for the control room.',
  metric: '38%',
  metricLabel: 'faster localisation'
},
{
  slug: 'switchgear-tender-automation',
  client: 'Switchgear Manufacturer',
  sector: 'Switchgear',
  title: 'From tender package to costed single line diagram in one pass',
  result: 'Document understanding and engineering knowledge applied to tender packages, producing equipment lists, SLDs and bills of material for engineer review.',
  metric: '3×',
  metricLabel: 'tender capacity'
},
{
  slug: 'metropolitan-digital-twin',
  client: 'Metropolitan Authority',
  sector: 'Smart Cities',
  title: 'A city twin binding GIS, energy and mobility for capital planning',
  result: 'Nine domain layers unified with system dynamics models, letting planners compare twenty-year intervention scenarios before funding.',
  metric: '9',
  metricLabel: 'domain layers bound'
}];


export const insights: Insight[] = [
{
  slug: 'why-sld-generation-is-a-knowledge-problem',
  title: 'Why single line diagram generation is a knowledge problem, not a drawing problem',
  kind: 'Technical Article',
  category: 'Engineering',
  readTime: '9 min',
  excerpt: 'Extracting topology is the easy half. Making the result defensible requires standards, company practice and project history to be present at generation time.',
  date: '2026-09-04'
},
{
  slug: 'event-correlation-in-distribution-networks',
  title: 'Event correlation in distribution networks: collapsing 12,000 signals into six incidents',
  kind: 'Technical Article',
  category: 'Smart Grid',
  readTime: '12 min',
  excerpt: 'Control rooms do not suffer from missing data. They suffer from undifferentiated data. A look at how topology-aware correlation changes the operator picture.',
  date: '2026-08-21'
},
{
  slug: 'digital-twin-scenario-studio',
  title: 'Inside the scenario studio: system dynamics for urban infrastructure',
  kind: 'Video',
  category: 'Digital Twin',
  readTime: '14 min',
  excerpt: 'A walkthrough of how feedback models, GIS layers and telemetry combine to answer questions about a city twenty years out.',
  date: '2026-08-09'
},
{
  slug: 'rag-for-engineering-archives',
  title: 'Retrieval over engineering archives without hallucinated standards',
  kind: 'Whitepaper',
  category: 'AI',
  readTime: '22 min',
  excerpt: 'Grounding, citation and refusal behaviour when the source material is decades of specifications and the cost of a wrong answer is physical.',
  date: '2026-07-30'
},
{
  slug: 'vision-safety-brownfield-sites',
  title: 'Deploying vision-based safety monitoring on brownfield industrial sites',
  kind: 'Case Study',
  category: 'Industrial AI',
  readTime: '7 min',
  excerpt: 'What existing CCTV can and cannot support, and how compliance exceptions should reach a supervisor.',
  date: '2026-07-12'
},
{
  slug: 'simorgh-cloud-sovereign-deployment',
  title: 'SIMORGH Cloud adds fully air-gapped deployment topology',
  kind: 'News',
  category: 'Software',
  readTime: '4 min',
  excerpt: 'Model serving, knowledge stores and identity now deployable with no external network dependency for sovereign installations.',
  date: '2026-06-28'
}];