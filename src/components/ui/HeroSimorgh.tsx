'use client';

import React, { useEffect, useRef } from 'react';

// The Simorgh keeping the sky of a page header: it flies on the empty side of
// the hero — the end side, so on the right in left-to-right languages and on
// the left (mirrored, facing the other way) in Persian and Arabic — riding the
// air in a slow loop while its wings beat, and shedding a thin trail of
// stardust. The bird is the keyed brand film as an animated WebP, which plays
// everywhere without autoplay rules.

type Spark = { x: number; y: number; vx: number; vy: number; life: number; age: number; size: number; hue: number };

export function HeroSimorgh() {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const birdRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const area = areaRef.current;
    const bird = birdRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!area || !bird || !canvas || !ctx) return;

    let sparks: Spark[] = [];
    let last = performance.now();
    let frame = 0;
    let visible = true;

    const size = () => {
      const r = area.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const a = area.getBoundingClientRect();
      const b = bird.getBoundingClientRect();
      const rtl = getComputedStyle(area).direction === 'rtl';
      // The tail tip sits low and toward the bird's back.
      const tx = b.left - a.left + b.width * (rtl ? 0.64 : 0.36);
      const ty = b.top - a.top + b.height * 0.92;
      if (b.width > 0 && Math.random() < 0.55) {
        sparks.push({
          x: tx + (Math.random() - 0.5) * 14, y: ty + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 24, vy: 10 + Math.random() * 22,
          life: 1.2 + Math.random() * 1.4, age: 0, size: 0.6 + Math.random() * 1.5, hue: Math.random(),
        });
      }
      ctx.clearRect(0, 0, a.width, a.height);
      ctx.globalCompositeOperation = 'lighter';
      sparks = sparks.filter((p) => p.age < p.life);
      for (const p of sparks) {
        p.age += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const k = p.age / p.life;
        ctx.globalAlpha = Math.max(0, (1 - k) * (0.55 + 0.45 * Math.sin(p.age * 13 + p.hue * 6)));
        ctx.fillStyle = p.hue < 0.6 ? '#dff1ff' : p.hue < 0.88 ? '#8fdcff' : '#ffd98a';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - k * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      if (visible) frame = requestAnimationFrame(step);
    };

    // Only animate the trail while the hero is on screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) { last = performance.now(); frame = requestAnimationFrame(step); }
    });
    io.observe(area);
    window.addEventListener('resize', size);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', size);
    };
  }, []);

  return (
    <div
      ref={areaRef}
      aria-hidden="true"
      data-no-translate
      className="pointer-events-none absolute inset-y-0 end-0 w-full md:w-[48%]"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Mirrored in right-to-left layouts, drift included, so it always flies toward the edge. */}
      <div className="absolute end-[4%] top-[16%] w-[46vw] opacity-60 rtl:-scale-x-100 sm:w-[38vw] md:end-[3%] md:top-[15%] md:w-[min(30vw,400px)] md:opacity-95">
        <div className="sim-hero-bird">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={birdRef}
            src="/simorgh/simorgh-flight.webp"
            alt=""
            loading="eager"
            decoding="async"
            className="block h-auto w-full mix-blend-screen drop-shadow-[0_0_22px_rgba(150,205,255,0.45)]"
          />
        </div>
      </div>
    </div>
  );
}
