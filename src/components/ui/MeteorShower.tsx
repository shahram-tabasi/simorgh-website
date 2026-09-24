'use client';

import React, { useEffect, useRef } from 'react';

// Shooting stars, drawn on a clear layer over the page (under the header), so
// they are seen whatever sits beneath: hero images, cards, sliders. Rare
// enough to stay a surprise — one every few seconds, now and then a pair —
// and bright enough to be noticed: a white-hot head, a glow, a long cooling
// tail.

type Meteor = { x: number; y: number; vx: number; vy: number; length: number; life: number; age: number; width: number };

const EVERY: [number, number] = [3.5, 8];

export function MeteorShower() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let W = 0;
    let H = 0;
    const size = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    // A soft round glow for the head, drawn once.
    const head = document.createElement('canvas');
    head.width = head.height = 64;
    const hg = head.getContext('2d')!;
    const grad = hg.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.2, 'rgba(210,235,255,0.85)');
    grad.addColorStop(0.5, 'rgba(120,190,255,0.25)');
    grad.addColorStop(1, 'rgba(120,190,255,0)');
    hg.fillStyle = grad;
    hg.fillRect(0, 0, 64, 64);

    let meteors: Meteor[] = [];
    let last = performance.now();
    let next = last + 1800;
    let frame = 0;

    const spawn = () => {
      const fromLeft = Math.random() < 0.5;
      const angle = (Math.PI / 180) * (25 + Math.random() * 22); // below the horizon, 25–47°
      const speed = 900 + Math.random() * 700;
      meteors.push({
        x: fromLeft ? Math.random() * W * 0.55 : W * 0.45 + Math.random() * W * 0.55,
        y: Math.random() * H * 0.4,
        vx: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
        vy: Math.sin(angle) * speed,
        length: 220 + Math.random() * 260,
        life: 0.7 + Math.random() * 0.6,
        age: 0,
        width: 1.8 + Math.random() * 1.6,
      });
    };

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (now > next) {
        spawn();
        if (Math.random() < 0.2) window.setTimeout(spawn, 180 + Math.random() * 400);
        next = now + (EVERY[0] + Math.random() * (EVERY[1] - EVERY[0])) * 1000;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      meteors = meteors.filter((m) => m.age < m.life);
      for (const m of meteors) {
        m.age += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const k = m.age / m.life;
        const alpha = Math.min(1, k * 7) * (1 - k) ** 1.2;
        const speed = Math.hypot(m.vx, m.vy);
        const ux = m.vx / speed;
        const uy = m.vy / speed;
        const tx = m.x - ux * m.length;
        const ty = m.y - uy * m.length;

        // Outer glow, then the hot core line.
        for (const [w, a, c] of [[m.width * 4, 0.18, '120,190,255'], [m.width, 1, '255,255,255']] as const) {
          const tail = ctx.createLinearGradient(m.x, m.y, tx, ty);
          tail.addColorStop(0, `rgba(${c},${a})`);
          tail.addColorStop(0.25, `rgba(170,215,255,${a * 0.55})`);
          tail.addColorStop(1, 'rgba(120,170,255,0)');
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = tail;
          ctx.lineWidth = w;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        }
        const r = 10 + m.width * 3;
        ctx.globalAlpha = alpha;
        ctx.drawImage(head, m.x - r, m.y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      frame = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) { last = performance.now(); next = last + 1500; frame = requestAnimationFrame(draw); }
    };

    frame = requestAnimationFrame(draw);
    window.addEventListener('resize', size);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', size);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[38] h-full w-full" />;
}
