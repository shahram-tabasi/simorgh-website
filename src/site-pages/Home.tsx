'use client';

import React from 'react';
import { Hero } from '../components/home/Hero';
import { IntelligenceSection } from '../components/home/IntelligenceSection';
import { EcosystemSection } from '../components/home/EcosystemSection';
import { ProductsSection } from '../components/home/ProductsSection';
import { IndustriesSection } from '../components/home/IndustriesSection';
import { DigitalTwinSection } from '../components/home/DigitalTwinSection';
import { AISection } from '../components/home/AISection';
import { CaseStudiesSection } from '../components/home/CaseStudiesSection';
import { InsightsSection } from '../components/home/InsightsSection';
import { FinalCTA } from '../components/home/FinalCTA';

export function Home() {
  return (
    <>
      <Hero />
      <IntelligenceSection />
      <EcosystemSection />
      <ProductsSection />
      <IndustriesSection />
      <DigitalTwinSection />
      <AISection />
      <CaseStudiesSection />
      <InsightsSection />
      <FinalCTA />
    </>);

}