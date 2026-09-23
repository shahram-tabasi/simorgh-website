import type { Product } from '../types/content';

export const products: Product[] = [
{
  slug: 'simorgh-design-suite',
  name: 'SIMORGH DESIGN SUITE',
  short: 'Design Suite',
  domain: 'engineering',
  icon: 'drafting',
  tagline: 'AI-powered electrical engineering and design automation.',
  summary:
  'Design Suite reads technical documentation the way an experienced engineer does — extracting equipment, parameters and constraints, then generating single line diagrams and electrical design output that stays consistent with your engineering standards.',
  featured: true,
  capabilities: [
  { title: 'Document understanding', body: 'Datasheets, specifications and tender documents parsed into structured engineering objects.' },
  { title: 'Equipment intelligence', body: 'Transformers, breakers, cables and protection devices resolved against a governed component library.' },
  { title: 'Single line generation', body: 'SLDs generated from extracted topology, with rule checking against IEC and internal standards.' },
  { title: 'Design automation', body: 'Load flow inputs, cable sizing, protection coordination and bill of materials produced as one continuous pass.' },
  { title: 'EPLAN & CAD exchange', body: 'Round-trip exchange with EPLAN, DXF and native CAD formats without losing engineering metadata.' },
  { title: 'Review workspace', body: 'Every automated decision is traceable to the source document line that produced it.' }],

  industries: ['Switchgear', 'Industrial Automation', 'Electricity & Energy', 'Oil & Gas'],
  pipeline: [
  { label: 'Technical Documents', detail: 'Specifications, datasheets, tender packages and legacy drawings ingested in bulk.' },
  { label: 'AI Document Understanding', detail: 'Layout-aware models separate tables, notes, revisions and symbols.' },
  { label: 'Equipment & Parameters', detail: 'Devices, ratings, tags and relationships resolved into a typed engineering model.' },
  { label: 'Engineering Knowledge', detail: 'Standards, company rules and prior projects applied as a knowledge graph.' },
  { label: 'Single Line Diagram', detail: 'Topology drawn, validated and versioned against the source model.' },
  { label: 'Electrical Design', detail: 'Sizing, protection coordination and panel layout computed from the SLD.' },
  { label: 'Engineering Output', detail: 'Drawings, BOM, calculation sheets and CAD exports released as a package.' }],

  metrics: [
  { value: '72%', label: 'Reduction in document review hours' },
  { value: '4.1×', label: 'Faster SLD production' },
  { value: '100%', label: 'Traceability to source documents' }],

  faq: [
  { q: 'Does it replace our engineers?', a: 'No. Design Suite removes transcription and lookup work so engineers spend their time on design decisions and review. Every output is proposed, not committed.' },
  { q: 'Can it follow our internal standards?', a: 'Yes. Company standards are encoded in the knowledge layer alongside IEC rules and are applied during generation and validation.' },
  { q: 'How does it handle legacy scanned drawings?', a: 'Vision models detect symbols and connectivity in raster drawings, then flag low-confidence regions for engineer confirmation.' }]

},
{
  slug: 'simorgh-grid',
  name: 'SIMORGH GRID',
  short: 'Grid',
  domain: 'grid',
  icon: 'grid',
  tagline: 'Smart grid and electricity infrastructure intelligence.',
  summary:
  'Grid turns substation, feeder and meter telemetry into operational understanding — correlating events across the network, isolating probable fault causes and giving control room teams a defensible recommended action.',
  featured: true,
  capabilities: [
  { title: 'Network model', body: 'Substations, transformers and feeders represented as a live connected topology.' },
  { title: 'Event correlation', body: 'Thousands of raw events collapsed into a handful of ranked operational incidents.' },
  { title: 'Fault localisation', body: 'Probable fault section identified from protection signals and load behaviour.' },
  { title: 'Load & loss analytics', body: 'Transformer loading, technical loss and imbalance tracked per asset over time.' },
  { title: 'Outage intelligence', body: 'Restoration sequencing proposed with affected-customer impact made explicit.' },
  { title: 'Decision support', body: 'Every recommendation carries the evidence chain that produced it.' }],

  industries: ['Electricity & Energy', 'Utilities', 'Smart Cities', 'Infrastructure'],
  pipeline: [
  { label: 'Grid', detail: 'Distribution network topology and asset register.' },
  { label: 'Substation', detail: 'SCADA, protection relays and metering streams.' },
  { label: 'Transformer', detail: 'Loading, temperature and health indicators per unit.' },
  { label: 'Feeder', detail: 'Section-level flow, voltage profile and switching state.' },
  { label: 'Event', detail: 'Raw signals normalised into a single time-ordered stream.' },
  { label: 'Fault', detail: 'Candidate fault sections ranked by likelihood.' },
  { label: 'AI Analysis', detail: 'Cause classification against historical incident patterns.' },
  { label: 'Decision', detail: 'Recommended switching and restoration action for the operator.' }],

  metrics: [
  { value: '38%', label: 'Lower mean time to localise faults' },
  { value: '12k', label: 'Events correlated per hour' },
  { value: '99.2%', label: 'Model coverage of network assets' }],

  faq: [
  { q: 'Does Grid control switchgear directly?', a: 'No. Grid is a decision-support layer. Actions are proposed to operators and executed through your existing SCADA authority chain.' },
  { q: 'What data does it need?', a: 'A network model plus any combination of SCADA, AMI, protection event logs and outage records. Coverage improves with more sources.' },
  { q: 'Can it run on-premise?', a: 'Yes. Grid deploys on-premise, in a private cloud, or as a hybrid with local ingestion and central analytics.' }]

},
{
  slug: 'simorgh-digital-twin',
  name: 'SIMORGH DIGITAL TWIN',
  short: 'Digital Twin',
  domain: 'twin',
  icon: 'twin',
  tagline: 'Digital twin platform for cities, utilities and industry.',
  summary:
  'A twin is only useful when it can answer a question about the future. Digital Twin binds GIS, infrastructure, IoT telemetry and system dynamics models into an environment where scenarios can be run before they are funded.',
  featured: true,
  capabilities: [
  { title: 'Spatial foundation', body: 'GIS layers, networks and assets unified into one addressable model.' },
  { title: 'Live telemetry binding', body: 'IoT and operational streams attached to the objects they describe.' },
  { title: 'System dynamics', body: 'Feedback models for demand, capacity, growth and degradation.' },
  { title: 'Scenario studio', body: 'Compare interventions side by side with quantified outcomes.' },
  { title: 'Cross-domain view', body: 'Electricity, water, traffic and buildings analysed as one interacting system.' },
  { title: 'Open interfaces', body: 'Clean API boundaries for pipelines, model servers and external twin engines.' }],

  industries: ['Smart Cities', 'Utilities', 'Infrastructure', 'Manufacturing'],
  pipeline: [
  { label: 'City', detail: 'Administrative geography, population and growth baseline.' },
  { label: 'GIS', detail: 'Parcels, networks, terrain and spatial relationships.' },
  { label: 'Infrastructure', detail: 'Roads, water, telecom and energy corridors.' },
  { label: 'Electricity', detail: 'Distribution network bound to the spatial model.' },
  { label: 'Transformers', detail: 'Asset-level capacity and condition.' },
  { label: 'Industry', detail: 'Industrial demand centres and process load profiles.' },
  { label: 'IoT Data', detail: 'Sensor streams attached to physical objects.' },
  { label: 'AI', detail: 'Forecasting, anomaly detection and pattern recognition.' },
  { label: 'System Dynamics', detail: 'Causal models of growth, stress and feedback.' },
  { label: 'Digital Twin', detail: 'A queryable environment for scenario and impact analysis.' }],

  metrics: [
  { value: '9', label: 'Domain layers in a single model' },
  { value: '20yr', label: 'Scenario horizon supported' },
  { value: 'Open', label: 'API boundaries for external engines' }],

  faq: [
  { q: 'Is this a 3D city viewer?', a: 'Visualisation is one surface of the platform, not its purpose. The value is in the bound data model and the scenarios it can answer.' },
  { q: 'What if we have no IoT deployment yet?', a: 'The twin can be built from GIS and asset data first, then progressively bound to telemetry as instrumentation arrives.' },
  { q: 'Can it integrate with existing twin engines?', a: 'Yes. Integration boundaries are defined for IoT brokers, streaming pipelines, GIS servers, knowledge graphs and external simulation engines.' }]

},
{
  slug: 'simorgh-kara',
  name: 'SIMORGH KARA',
  short: 'Kara',
  domain: 'enterprise',
  icon: 'users',
  tagline: 'Smart workforce, attendance and industrial safety.',
  summary:
  'Kara connects workforce presence, shift structure and site safety into one operational record — using computer vision at site level to verify PPE compliance and restricted-zone entry without adding manual supervision.',
  capabilities: [
  { title: 'Attendance & shifts', body: 'Multi-site attendance, rosters, overtime and leave in one ledger.' },
  { title: 'Vision safety', body: 'PPE detection and restricted-zone monitoring from existing cameras.' },
  { title: 'Contractor control', body: 'Permit-to-work, induction status and access rules enforced at the gate.' },
  { title: 'Incident workflow', body: 'Observation to investigation to corrective action, tracked to closure.' },
  { title: 'Payroll interfaces', body: 'Clean export boundaries to existing HR and payroll systems.' },
  { title: 'Site analytics', body: 'Headcount, exposure hours and compliance trends per area.' }],

  industries: ['Manufacturing', 'Mining', 'Oil & Gas', 'Industrial Automation'],
  pipeline: [
  { label: 'Site Presence', detail: 'Gate, biometric and mobile check-in events.' },
  { label: 'Vision Layer', detail: 'PPE and zone compliance inferred from camera streams.' },
  { label: 'Rules', detail: 'Shift, permit and competency rules evaluated per person.' },
  { label: 'Exceptions', detail: 'Only deviations are surfaced to supervisors.' },
  { label: 'Action', detail: 'Corrective workflow with audit trail and closure evidence.' }],

  metrics: [
  { value: '6', label: 'Site systems replaced by one record' },
  { value: '24/7', label: 'Continuous safety observation' },
  { value: '<2%', label: 'Unresolved compliance exceptions' }],

  faq: [
  { q: 'Does vision monitoring require new cameras?', a: 'In most sites existing CCTV is sufficient. Camera placement is assessed during deployment planning.' },
  { q: 'How is personal data handled?', a: 'Processing runs on-site by default, with configurable retention and role-restricted access to identifiable footage.' },
  { q: 'Can it feed our payroll system?', a: 'Yes, through scheduled or event-driven export interfaces.' }]

},
{
  slug: 'simorgh-shop',
  name: 'SIMORGH SHOP',
  short: 'Shop',
  domain: 'enterprise',
  icon: 'ledger',
  tagline: 'Accounting, inventory and business management.',
  summary:
  'Shop is the commercial backbone for engineering and industrial organisations — accounting, inventory and procurement that understand project structure, equipment codes and long-lead supply chains.',
  capabilities: [
  { title: 'Project accounting', body: 'Cost, commitment and revenue tracked per project and per work package.' },
  { title: 'Engineering inventory', body: 'Stock managed by equipment code, not just SKU.' },
  { title: 'Procurement', body: 'Requisition to purchase order to receipt, with lead-time visibility.' },
  { title: 'Financial reporting', body: 'Statutory and management reporting from one ledger.' },
  { title: 'Multi-entity', body: 'Several legal entities and currencies under one consolidation.' },
  { title: 'Product interlock', body: 'Bills of material arriving directly from Design Suite.' }],

  industries: ['Manufacturing', 'Switchgear', 'Industrial Automation'],
  pipeline: [
  { label: 'Design BOM', detail: 'Engineering output becomes a costed material list.' },
  { label: 'Procurement', detail: 'Sourcing, lead times and supplier performance.' },
  { label: 'Inventory', detail: 'Receipt, reservation and issue against projects.' },
  { label: 'Accounting', detail: 'Ledger entries generated from operational events.' },
  { label: 'Reporting', detail: 'Project margin and consolidated financial position.' }],

  metrics: [
  { value: '1', label: 'Ledger across entities' },
  { value: '3d', label: 'Typical close acceleration' },
  { value: 'BOM', label: 'Direct link from engineering' }],

  faq: [
  { q: 'Is Shop a general ERP?', a: 'It covers accounting, inventory and procurement for engineering-led businesses. It is deliberately not a generic horizontal ERP.' },
  { q: 'Can it run standalone?', a: 'Yes, though the strongest case is alongside Design Suite where bills of material flow in automatically.' },
  { q: 'Does it support multiple currencies?', a: 'Yes, with entity-level functional currency and consolidation.' }]

},
{
  slug: 'simorgh-draw',
  name: 'SIMORGH DRAW',
  short: 'Draw',
  domain: 'engineering',
  icon: 'pen',
  tagline: 'Intelligent engineering drawing.',
  summary:
  'Draw is a drawing environment that understands what is being drawn. Symbols carry engineering meaning, connections carry electrical properties, and validation happens while the drawing is being made rather than at review.',
  capabilities: [
  { title: 'Semantic symbols', body: 'Every symbol is a typed engineering object with parameters.' },
  { title: 'Live validation', body: 'Rule violations surfaced as you draw, not at submission.' },
  { title: 'Standard libraries', body: 'IEC, ANSI and company symbol sets under version control.' },
  { title: 'Collaborative markup', body: 'Review comments anchored to objects, not coordinates.' },
  { title: 'Format exchange', body: 'DXF, EPLAN and PDF export with metadata preserved.' },
  { title: 'Revision control', body: 'Diffable revisions with engineering-level change history.' }],

  industries: ['Switchgear', 'Industrial Automation', 'Electricity & Energy'],
  pipeline: [
  { label: 'Symbol Library', detail: 'Governed, versioned, standards-aligned.' },
  { label: 'Drawing Canvas', detail: 'Objects and connections with electrical meaning.' },
  { label: 'Validation', detail: 'Continuous rule checking during authoring.' },
  { label: 'Review', detail: 'Object-anchored markup and approval.' },
  { label: 'Release', detail: 'Versioned issue with full change history.' }],

  metrics: [
  { value: '0', label: 'Rule checks deferred to review' },
  { value: '3', label: 'Standard symbol libraries included' },
  { value: 'Live', label: 'Multi-engineer collaboration' }],

  faq: [
  { q: 'Does it replace AutoCAD or EPLAN?', a: 'Draw targets electrical engineering drawing specifically and exchanges cleanly with both rather than forcing replacement.' },
  { q: 'Can we bring our own symbol library?', a: 'Yes. Company libraries can be imported and placed under the same versioning.' },
  { q: 'Is it browser based?', a: 'Yes, with a local rendering engine for large drawings.' }]

},
{
  slug: 'simorgh-cloud',
  name: 'SIMORGH CLOUD',
  short: 'Cloud',
  domain: 'cloud',
  icon: 'cloud',
  tagline: 'Cloud and AI infrastructure.',
  summary:
  'Every SIMORGH product runs on the same substrate: governed model serving, data pipelines and identity. Cloud is that substrate, available on your infrastructure or ours.',
  capabilities: [
  { title: 'Model serving', body: 'Versioned inference endpoints with evaluation and rollback.' },
  { title: 'Data pipelines', body: 'Batch and streaming ingestion with lineage tracking.' },
  { title: 'Knowledge layer', body: 'Vector and graph stores backing retrieval across products.' },
  { title: 'Identity & RBAC', body: 'One role model spanning every SIMORGH application.' },
  { title: 'Deployment modes', body: 'On-premise, private cloud or hybrid with local ingestion.' },
  { title: 'Observability', body: 'Model, pipeline and application telemetry in one place.' }],

  industries: ['Utilities', 'Manufacturing', 'Infrastructure', 'Oil & Gas'],
  pipeline: [
  { label: 'Ingestion', detail: 'Connectors for operational, spatial and document sources.' },
  { label: 'Knowledge', detail: 'Graph and vector representation of engineering context.' },
  { label: 'Models', detail: 'Training, evaluation and versioned serving.' },
  { label: 'Applications', detail: 'Every SIMORGH product consuming the same layer.' },
  { label: 'Governance', detail: 'Access, audit and lineage across the stack.' }],

  metrics: [
  { value: '3', label: 'Deployment topologies' },
  { value: 'RBAC', label: 'Unified across products' },
  { value: 'Audit', label: 'Lineage on every inference' }],

  faq: [
  { q: 'Must we use SIMORGH Cloud?', a: 'Products can run on your own Kubernetes footprint. Cloud is the managed path, not a requirement.' },
  { q: 'Where does data reside?', a: 'Residency is a deployment decision. Sovereign and fully air-gapped installations are supported.' },
  { q: 'Which models are used?', a: 'A mix of SIMORGH engineering models and selected third-party foundation models, chosen per workload and disclosed in the deployment record.' }]

}];


export const getProduct = (slug: string) => products.find((p) => p.slug === slug);