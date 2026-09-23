'use client';

import React from 'react';
import { Button } from '../components/ui/Button';
import { Starfield } from '../components/ui/Starfield';

export function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden bg-space-0 pt-[72px]">
      <Starfield />
      <div className="relative px-5 text-center">
        <span className="font-mono text-[10.5px] tracking-label text-cyan">404 / NOT FOUND</span>
        <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-ink lg:text-5xl">
          This page is not part of the platform
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-ink-muted">
          The address may have changed, or the content exists in another language path.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button to="/">Return home</Button>
          <Button to="/products" variant="outline">
            Explore products
          </Button>
        </div>
      </div>
    </section>);

}