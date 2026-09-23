'use client';

import React from 'react';
import { PageHero } from '../components/ui/PageHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Reveal } from '../components/ui/Reveal';
import { Button } from '../components/ui/Button';
import { Pipeline } from '../components/product/Pipeline';
import { aiLayers, intelligenceChain, REF_IMAGE_HERO } from '../data/site';

const architecture = [
{ tier: 'Experience', body: 'Product interfaces, dashboards and the future SIMORGH AI assistant, all speaking to the same APIs.' },
{ tier: 'Decision', body: 'Ranking, scenario evaluation and recommendation services with mandatory evidence attachment.' },
{ tier: 'Model', body: 'Vision, document, retrieval and forecasting models, versioned and evaluated before promotion.' },
{ tier: 'Knowledge', body: 'Engineering knowledge graph plus vector indexes over standards, projects and archives.' },
{ tier: 'Data', body: 'Batch and streaming ingestion from documents, SCADA, GIS, IoT and business systems, with lineage.' },
{ tier: 'Platform', body: 'Identity, RBAC, audit, observability and deployment topology — on-premise, private or hybrid.' }];


export function Technology() {
  return (
    <>
      <PageHero
        eyebrow="TECHNOLOGY"
        title="The intelligence layer beneath every product"
        lead="Six tiers, one governance model. Engineering context is not bolted onto a general model — it is the substrate everything else is built from."
        crumbs={[{ label: 'Technology' }]}
        image={REF_IMAGE_HERO} />
      

      <section className="border-b border-line bg-space-0">
        <div className="mx-auto max-w-shell px-5 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <SectionHeader index="ARCHITECTURE" title="How the platform is layered" />
          </Reveal>
          <ol className="mt-14 border border-line">
            {architecture.map((row, i) =>
            <li
              key={row.tier}
              className="grid gap-4 border-b border-line bg-space-1 px-6 py-6 last:border-b-0 lg:grid-cols-[60px_200px_1fr] lg:items-center lg:gap-10 lg:px-10">
              
                <span className="font-mono text-[10px] text-ink-faint">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-display text-[17px] font-semibold tracking-tight text-cyan-soft">{row.tier}</span>
                <span className="text-[14px] leading-relaxed text-ink-muted">{row.body}</span>
              </li>
            )}
          </ol>
        </div>
      </section>

      <section className="border-b border-line bg-space-1">
        <div className="mx-auto max-w-shell px-5 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <SectionHeader
              index="SIMORGH AI"
              title="Eight capability families"
              lead="Each is available to every product through the same serving and governance path." />
            
          </Reveal>
          <ul className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {aiLayers.map((layer, i) =>
            <li key={layer.title} className="flex flex-col bg-space-1 p-7">
                <span className="font-mono text-[10px] text-ink-faint/80">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-5 font-display text-[16px] font-semibold tracking-tight text-ink">{layer.title}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-faint">{layer.body}</p>
              </li>
            )}
          </ul>
        </div>
      </section>

      <section className="border-b border-line bg-space-0">
        <div className="mx-auto max-w-shell px-5 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <SectionHeader index="CHAIN" title="From raw data to defensible action" />
          </Reveal>
          <Reveal delay={0.06} className="mt-14">
            <Pipeline
              steps={intelligenceChain.map((s) => ({ label: s.label, detail: s.detail }))}
              label="INTELLIGENCE CHAIN" />
            
          </Reveal>
        </div>
      </section>

      <section className="bg-space-1">
        <div className="mx-auto max-w-shell px-5 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <SectionHeader
              index="ROADMAP"
              title="Built for what comes next"
              lead="Integration boundaries are defined now so that IoT brokers, streaming pipelines, external twin engines and the SIMORGH AI assistant attach without re-architecture. Nothing on this site simulates a real-time system that is not deployed." />
            
          </Reveal>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Button to="/request-demo" size="lg">
              Talk to an engineer
            </Button>
            <Button to="/products" size="lg" variant="outline">
              Explore products
            </Button>
          </div>
        </div>
      </section>
    </>);

}