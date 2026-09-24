'use client';

import React from 'react';
import Image from 'next/image';
import { PageHero } from '../components/ui/PageHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Reveal } from '../components/ui/Reveal';
import { Button } from '../components/ui/Button';
import { REF_IMAGE_HERO } from '../data/site';

const pillars = [
{ title: 'Vision', body: 'Engineering knowledge should be executable. The systems that run a city or a plant deserve software that understands them, not software they are forced to accommodate.' },
{ title: 'Technology', body: 'One intelligence layer beneath every product: models, knowledge graph, governance and deployment topology shared across the platform.' },
{ title: 'Innovation', body: 'Capability is built where a real engagement demands it, then generalised — never invented in isolation from the sites it must work on.' },
{ title: 'Research', body: 'Applied work on document understanding, engineering reasoning, spatial models and system dynamics, published in our knowledge centre.' }];


const positions = [
{ role: 'Senior Electrical Engineer — Design Automation', place: 'Engineering' },
{ role: 'Machine Learning Engineer — Document AI', place: 'AI Research' },
{ role: 'Platform Engineer — Data Pipelines', place: 'Cloud' },
{ role: 'Solution Architect — Utilities', place: 'Delivery' }];


export function Company() {
  return (
    <>
      <PageHero
        eyebrow="COMPANY"
        title="SIMORGH Intelligent Iranian Technology"
        lead="An engineering and artificial intelligence company building software for the systems that physically run industry, energy and cities."
        crumbs={[{ label: 'Company' }]}
        image={REF_IMAGE_HERO} />
      

      <section className="border-b border-line bg-space-0">
        <div className="mx-auto max-w-shell px-5 py-20 lg:px-10 lg:py-24">
          <Reveal className="grid items-center gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
            <SectionHeader
              index="ABOUT"
              title="Engineers who write software, not the other way round"
              lead="SIMORGH was founded by electrical and industrial engineers who kept running into the same wall: the knowledge required to make a decision existed, but not in a form any system could use. The platform is the answer to that." />
            <div data-no-simorgh className="relative mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl border border-line bg-[#07132a] shadow-[0_0_80px_rgba(232,182,90,.12)]">
              <Image src="/company.jpg" alt="SIMORGH company logo" width={481} height={442} className="h-auto w-full" />
            </div>
          </Reveal>

          <ul className="mt-16 grid gap-px border border-line bg-line sm:grid-cols-2">
            {pillars.map((p) =>
            <li key={p.title} className="bg-space-1 p-9">
                <h2 className="font-display text-[18px] font-semibold tracking-tight text-cyan-soft">{p.title}</h2>
                <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">{p.body}</p>
              </li>
            )}
          </ul>
        </div>
      </section>

      <section className="bg-space-1">
        <div className="mx-auto grid max-w-shell gap-14 px-5 py-20 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:px-10 lg:py-24">
          <div>
            <SectionHeader index="CAREERS" title="Open positions" />
            <ul className="mt-10 border-t border-line">
              {positions.map((p) =>
              <li key={p.role} className="flex items-center justify-between gap-6 border-b border-line py-5">
                  <span className="text-[14.5px] text-ink">{p.role}</span>
                  <span className="shrink-0 font-mono text-[10px] tracking-label text-ink-faint">
                    {p.place.toUpperCase()}
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <SectionHeader index="CONTACT" title="Talk to us" lead="Sales, enterprise, partnership and support enquiries are routed to the relevant engineering or commercial team." />
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button to="/contact" size="lg">
                Contact SIMORGH
              </Button>
              <Button to="/request-demo" size="lg" variant="outline">
                Request a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>);

}