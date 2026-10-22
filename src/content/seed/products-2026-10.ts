// The products as they ship in October 2026: Kara (the enterprise organisation
// platform), Design Suite, Engineering AI and HR Assistant, on SIMORGH Cloud.
// Applied to stored content by migration "2026-10-production-products"
// (../migrations.ts). Statements describe what runs in production; work in
// progress is named as such.
import type { ProductEntry } from '../types';

type Text = Omit<ProductEntry, 'image' | 'headerImage' | 'gallery' | 'schematics' | 'status' | 'order' | 'seo'> & {
  seo: ProductEntry['seo'];
  image: string;
};

export const productionProducts: Text[] = [
  {
    slug: 'simorgh-kara',
    name: 'SIMORGH KARA',
    short: 'Kara',
    domain: 'enterprise',
    icon: 'users',
    accent: 'ENTERPRISE ORGANISATION PLATFORM',
    image: '/images/products/simorgh-kara/banner.webp',
    featured: true,
    tagline: 'One platform to run a complex, multi-company organisation, a virtual enterprise.',
    summary:
      'Kara is where people work: tasks and approvals, attendance and leave, partners, products and orders, calls and meetings, all on one screen with one sign-in. Behind it, Odoo keeps the books, stock and production as the ERP, while Kara keeps the work moving between people, teams and partner companies.',
    capabilities: [
      { title: 'Companies, holdings and partner networks', body: 'Each company has its own members, roles and permissions; holdings see across their companies; partner companies join a shared project without seeing each other’s data.' },
      { title: 'Kartabl and work desk', body: 'One inbox for every task and approval, with reminders, delegation and a full history of who decided what and when.' },
      { title: 'Attendance, shifts and leave', body: 'Work schedules, holidays, attendance devices and face check-in, leave and mission requests with multi-step approval and an AI leave assistant.' },
      { title: 'ERP backbone without the ERP screens', body: 'Partners, products, employees and sales orders live in Odoo; Kara reads and writes them through an audited connector, so people never have to learn the ERP.' },
      { title: 'Calls and meetings', body: 'Voice and video calls between colleagues and a meeting room for every company and project, on your own Jitsi server.' },
      { title: 'One sign-in, your servers', body: 'Keycloak single sign-on with two-step codes; everything runs on your own infrastructure, including the AI.' },
    ],
    industries: ['Switchgear', 'Manufacturing', 'Industrial Automation', 'Electricity & Energy'],
    pipeline: [
      { label: 'People and companies', detail: 'Accounts, organisations and roles in one identity service.' },
      { label: 'Work', detail: 'Tasks, approvals and requests in the kartabl, on BPMN processes.' },
      { label: 'Business records', detail: 'Partners, products, orders and stock in Odoo through the connector.' },
      { label: 'Events', detail: 'Every change published once on the message bus, in order.' },
      { label: 'Insight', detail: 'Read models, reports and process analytics built from those events.' },
    ],
    metrics: [
      { value: '1', label: 'Sign-in for every Simorgh application' },
      { value: '10', label: 'Business areas on one backbone, from sales to after-sales' },
      { value: '0', label: 'Bytes of company data sent to outside clouds' },
    ],
    faq: [
      { q: 'Do our people have to use Odoo?', a: 'No. Odoo is the ERP behind Kara: accounting, stock and production specialists may use it directly, everyone else works in Kara.' },
      { q: 'Can partner companies work with us in Kara?', a: 'Yes. A partner company gets its own organisation and sees only the projects, files and conversations shared with it.' },
      { q: 'Where does it run?', a: 'On your own servers or private cloud (Kubernetes). Sign-in, files, meetings, the ERP and the AI models all stay inside your network.' },
      { q: 'What is on the roadmap?', a: 'The BPMN process engine with a visual modeller, MRP II planning through Odoo, company chat, and a process lab that simulates what-if changes from your own event logs.' },
    ],
    seo: {
      title: 'Simorgh Kara — enterprise organisation platform',
      description: 'Kara runs a multi-company organisation on one screen: kartabl and approvals, attendance and leave, ERP records through Odoo, calls and meetings, one sign-in, on your own servers.',
      keywords: 'enterprise organisation software, virtual enterprise, Odoo, kartabl, BPMN, attendance, leave management',
      image: '',
    },
  },
  {
    slug: 'simorgh-design-suite',
    name: 'SIMORGH DESIGN SUITE',
    short: 'Design Suite',
    domain: 'engineering',
    icon: 'drafting',
    accent: 'ELECTRICAL ENGINEERING & SWITCHGEAR DESIGN',
    image: '/images/products/simorgh-design-suite/banner.webp',
    featured: true,
    tagline: 'From the client’s specification to the EPLAN project, in one traceable flow.',
    summary:
      'Design Suite takes a switchgear project from tender documents to engineering output. It reads specifications and single line diagrams with AI, proposes the scope for an engineer to confirm, builds the panels from a governed catalogue, runs the electrical studies and generates the EPLAN project and offer reports. Every value keeps a link to the document it came from.',
    capabilities: [
      { title: 'Specification and SLD analysis', body: 'Client specifications, load lists and single line diagrams are read by AI; values that agree, are new or conflict with your own rules are marked for an engineer to decide.' },
      { title: 'Project map', body: 'The requisition, scope, requirements and document register of a project in one model, each value with its source.' },
      { title: 'Catalogue and templates', body: 'Cubicles, breakers and basket catalogues with inheritance; templates built from them, with real part codes from your stock system.' },
      { title: 'Electrical studies', body: 'Load flow, short circuit to IEC 60909, harmonics and busbar sizing from the same project data.' },
      { title: 'EPLAN generation', body: 'The EPLAN project built from the design on your EPLAN workstation, as a background job.' },
      { title: 'Documents and reports', body: 'Project documents versioned in Git; offer reports, project data and MTO exported to your Excel templates.' },
    ],
    industries: ['Switchgear', 'Electricity & Energy', 'Industrial Automation', 'Oil & Gas'],
    pipeline: [
      { label: 'Tender documents', detail: 'Specifications, SLDs, load and I/O lists uploaded to the project.' },
      { label: 'AI analysis', detail: 'Text and vision models extract values and compare them with your rules.' },
      { label: 'Engineer review', detail: 'Proposals accepted or corrected; corrections become training data.' },
      { label: 'Scope and templates', detail: 'Panels built from the catalogue with real part codes.' },
      { label: 'Studies', detail: 'Load flow, short circuit and harmonics on the same data.' },
      { label: 'Output', detail: 'EPLAN project, MTO and offer reports.' },
    ],
    metrics: [
      { value: 'IEC 60909', label: 'Short-circuit calculation method' },
      { value: 'EPLAN', label: 'Project generated from the design' },
      { value: '100%', label: 'Of extracted values linked to their source' },
    ],
    faq: [
      { q: 'Does the AI decide the design?', a: 'No. It proposes; an engineer accepts or corrects every value, and the decision is recorded.' },
      { q: 'Can it use our own catalogue and rules?', a: 'Yes. The catalogue, templates and your company rules are part of every analysis and design.' },
      { q: 'Does it work with our existing EPLAN?', a: 'Yes. A small agent on your EPLAN workstation builds the project from the Design Suite data.' },
    ],
    seo: {
      title: 'Simorgh Design Suite — switchgear engineering from specification to EPLAN',
      description: 'AI analysis of specifications and single line diagrams, catalogue-based panel design, IEC 60909 studies and EPLAN project generation, with every value traceable to its source.',
      keywords: 'switchgear design software, single line diagram AI, EPLAN automation, IEC 60909, MTO, electrical engineering',
      image: '',
    },
  },
  {
    slug: 'simorgh-engineering-ai',
    name: 'SIMORGH ENGINEERING AI',
    short: 'Engineering AI',
    domain: 'ai',
    icon: 'ai',
    accent: 'TECHNICAL ASSISTANT ON YOUR OWN DOCUMENTS',
    image: '/images/products/simorgh-engineering-ai/banner.jpg',
    featured: true,
    tagline: 'A technical assistant that answers from your documents and shows where the answer came from.',
    summary:
      'Engineering AI answers technical questions from your standards, specifications, drawings and past projects. It quotes the pages it used, says when the documents do not contain an answer, and can open a Design Suite project to work on it. The language models run on your own GPU servers.',
    capabilities: [
      { title: 'Answers with sources', body: 'Every answer cites the documents and pages it used; a grounding check flags claims the sources do not support.' },
      { title: 'Your document library', body: 'Specifications, standards, manuals and drawings indexed with their full text and page images.' },
      { title: 'Works on design projects', body: 'Linked to Design Suite: reads a project, explains it and proposes changes for an engineer to apply.' },
      { title: 'Private models', body: 'Open models served on your own GPUs; nothing is sent to an outside AI service.' },
      { title: 'One AI service for every app', body: 'An OpenAI-compatible API with a key per application, so your other tools use the same models.' },
    ],
    industries: ['Switchgear', 'Electricity & Energy', 'Oil & Gas', 'Manufacturing'],
    pipeline: [
      { label: 'Documents', detail: 'Uploaded or synced from your document stores.' },
      { label: 'Indexing', detail: 'Text, tables and page images, per page.' },
      { label: 'Retrieval', detail: 'The passages that matter for the question.' },
      { label: 'Answer', detail: 'Written by the local model from those passages only.' },
      { label: 'Grounding check', detail: 'Unsupported claims are flagged before you rely on them.' },
    ],
    metrics: [
      { value: 'Local', label: 'Language models on your own GPUs' },
      { value: 'Cited', label: 'Every answer, with document and page' },
      { value: '1 API', label: 'Shared by all your applications' },
    ],
    faq: [
      { q: 'Does it invent standards?', a: 'It answers from your documents and says when they do not cover the question; a separate check marks claims without support.' },
      { q: 'Do our documents leave the company?', a: 'No. Indexing, search and the language models all run on your servers.' },
    ],
    seo: {
      title: 'Simorgh Engineering AI — technical assistant on your own documents',
      description: 'A private technical assistant that answers from your standards and project documents with page citations, runs on your own GPUs and works with Simorgh Design Suite.',
      keywords: 'engineering AI assistant, RAG, private LLM, technical documents, on-premise AI',
      image: '',
    },
  },
  {
    slug: 'simorgh-hr-assistant',
    name: 'SIMORGH HR ASSISTANT',
    short: 'HR Assistant',
    domain: 'enterprise',
    icon: 'users',
    accent: 'HR QUESTIONS ANSWERED, ANY TIME',
    image: '/images/products/simorgh-hr-assistant/banner.jpg',
    tagline: 'Employees ask about leave, pay and policies; the assistant answers from your HR rules.',
    summary:
      'HR Assistant answers employees’ questions about leave, working hours, benefits and procedures from your own HR policies and the labour law you give it, in Persian, English or German. Your HR team stops answering the same questions every day and keeps the policies in one place.',
    capabilities: [
      { title: 'Answers from your policies', body: 'Leave rules, working hours, benefits and procedures, taken from the documents HR maintains.' },
      { title: 'Three languages', body: 'Persian, English and German, in the interface and in the answers.' },
      { title: 'Simple sign-in', body: 'Email with verification or a Google account; an email domain list decides who may register.' },
      { title: 'Private by design', body: 'Conversations and documents stay on your servers; the model runs locally.' },
    ],
    industries: ['Manufacturing', 'Industrial Automation', 'Electricity & Energy', 'Mining'],
    pipeline: [
      { label: 'HR documents', detail: 'Policies, regulations and FAQs.' },
      { label: 'Knowledge base', detail: 'Indexed for search by meaning, not just words.' },
      { label: 'Question', detail: 'From any employee, in their language.' },
      { label: 'Answer', detail: 'Short, from the policies, with where to read more.' },
    ],
    metrics: [
      { value: '3', label: 'Languages: Persian, English, German' },
      { value: '24/7', label: 'Answers without waiting for HR' },
      { value: 'Local', label: 'Model and data on your servers' },
    ],
    faq: [
      { q: 'Can it see personal data?', a: 'It answers from policy documents. Personal records stay in your HR systems; Kara handles requests such as leave.' },
    ],
    seo: {
      title: 'Simorgh HR Assistant — answers to employees’ HR questions',
      description: 'An AI assistant that answers leave, working-hour and policy questions from your own HR documents, in Persian, English and German, on your own servers.',
      keywords: 'HR chatbot, HR assistant, leave policy, employee questions, private AI',
      image: '',
    },
  },
];

/** Products of the first site that are not in production: kept, unpublished. */
export const retiredProducts = ['simorgh-grid', 'simorgh-digital-twin', 'simorgh-shop', 'simorgh-draw'];
