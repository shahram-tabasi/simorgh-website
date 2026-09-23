'use client';

import React, { useEffect, useRef } from 'react';

interface Props {
  density?: number;
  className?: string;
}

/** Extremely slow drifting star layer. Canvas based so it stays cheap at full-bleed sizes. */
export function Starfield({ density = 0.00012, className = '' }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let stars: {x: number;y: number;r: number;a: number;v: number;p: number;}[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(rect.width * rect.height * density);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        r: Math.random() * 1.1 + 0.25,
        a: Math.random() * 0.5 + 0.15,
        v: Math.random() * 0.045 + 0.008,
        p: Math.random() * Math.PI * 2
      }));
    };

    const draw = (t: number) => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      for (const s of stars) {
        if (!reduced) {
          s.y -= s.v;
          if (s.y < -2) s.y = rect.height + 2;
        }
        const twinkle = reduced ? 1 : 0.65 + 0.35 * Math.sin(t / 2200 + s.p);
        ctx.globalAlpha = s.a * twinkle;
        ctx.fillStyle = s.r > 1 ? '#9fd8ff' : '#dce8ff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}