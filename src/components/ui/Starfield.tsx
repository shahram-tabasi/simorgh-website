'use client';

import React, { useEffect, useRef } from 'react';

interface Props {
  /** Stars per square pixel. */
  density?: number;
  className?: string;
  /** Occasional shooting stars (off by default: MeteorShower draws them over the page). */
  meteors?: boolean;
  /** Seconds between meteors: a random wait in [min, max]. */
  meteorEvery?: [number, number];
  /** Pinned to the viewport (the site-wide sky) rather than filling its section. */
  fixed?: boolean;
}

// ── A sky with depth ─────────────────────────────────────────────────────
//
// Every star has a depth. It is projected through a simple perspective, so
// near stars are larger, brighter and move more when the pointer moves or the
// page scrolls — the parallax is what makes the sky read as a volume rather
// than a painted backdrop. The whole field drifts slowly towards the viewer.
//
// Colours follow real stellar temperatures (blue-white O/B through orange
// K/M), and each star scintillates at its own rate. Now and then a meteor
// crosses. Honours prefers-reduced-motion: a still sky, no meteors.

type Star = { x: number; y: number; z: number; size: number; tint: number; alpha: number; freq: number; phase: number; flare: boolean };
type Meteor = { x: number; y: number; vx: number; vy: number; length: number; life: number; age: number; width: number };

/** Stellar colours, weighted roughly by how often the eye sees them. */
const TINTS = ['#9bb0ff', '#aabfff', '#cad7ff', '#f8f7ff', '#f8f7ff', '#fff4ea', '#ffe9c4', '#ffd2a1'];
const DEPTH = 1.6;
const DEFAULT_METEOR_EVERY: [number, number] = [5, 11];
const FOCAL = 0.9;

/** A soft round sprite per tint, drawn once — far cheaper than arcs with shadows every frame. */
function makeSprites() {
  return TINTS.map((tint) => {
    const size = 32;
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = size;
    const g = sprite.getContext('2d')!;
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.18, tint);
    grad.addColorStop(0.45, `${tint}55`);
    grad.addColorStop(1, `${tint}00`);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return sprite;
  });
}

function randomStar(z = Math.random() * DEPTH + 0.05): Star {
  return {
    x: (Math.random() * 2 - 1) * 1.4,
    y: (Math.random() * 2 - 1) * 1.4,
    z,
    size: Math.random() ** 3 * 1.6 + 0.35,
    tint: Math.floor(Math.random() * TINTS.length),
    alpha: Math.random() * 0.55 + 0.35,
    freq: Math.random() * 2.2 + 0.4,
    phase: Math.random() * Math.PI * 2,
    flare: Math.random() < 0.025,
  };
}

export function Starfield({ density = 0.00032, className = '', meteors = false, meteorEvery = DEFAULT_METEOR_EVERY, fixed = false }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sprites = makeSprites();
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let flying: Meteor[] = [];
    let frame = 0;
    let last = performance.now();
    let nextMeteor = last + 1500 + Math.random() * 3000;
    // Parallax: where the camera wants to be, and where it is (eased towards it).
    const aim = { x: 0, y: 0 };
    const cam = { x: 0, y: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(900, Math.round(width * height * density));
      stars = Array.from({ length: count }, () => randomStar());
    };

    const onPointer = (event: PointerEvent) => {
      aim.x = (event.clientX / window.innerWidth - 0.5) * 2;
      aim.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const spawnMeteor = () => {
      const fromLeft = Math.random() < 0.5;
      const angle = (fromLeft ? 1 : -1) * (Math.PI / 5 + Math.random() * Math.PI / 9);
      const speed = 650 + Math.random() * 500;
      flying.push({
        x: fromLeft ? Math.random() * width * 0.6 : width * 0.4 + Math.random() * width * 0.6,
        y: Math.random() * height * 0.35,
        vx: Math.sin(angle) * speed,
        vy: Math.cos(Math.abs(angle)) * speed,
        length: 110 + Math.random() * 150,
        life: 0.7 + Math.random() * 0.6,
        age: 0,
        width: 1.4 + Math.random() * 1.2,
      });
    };

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      ctx.clearRect(0, 0, width, height);

      cam.x += (aim.x - cam.x) * 0.04;
      cam.y += (aim.y - cam.y) * 0.04;
      const scroll = fixed ? window.scrollY : 0;
      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.max(width, height) * FOCAL;

      ctx.globalCompositeOperation = 'lighter';
      for (const s of stars) {
        if (!reduced) {
          // A slow drift towards the viewer; a star that passes the camera is reborn far away.
          s.z -= dt * 0.018;
          if (s.z < 0.05) Object.assign(s, randomStar(DEPTH));
        }
        const inv = 1 / s.z;
        const px = cx + (s.x - cam.x * 0.06) * inv * scale * 0.5;
        const py = cy + (s.y - cam.y * 0.04) * inv * scale * 0.5;
        if (px < -20 || px > width + 20 || py < -20 || py > height + 20) continue;

        const near = Math.min(1, 0.35 / s.z);
        // Scrolling moves near stars further than far ones; the sky wraps top to bottom.
        const span = height + 40;
        const wy = (((py + 20 - scroll * 0.12 * near) % span) + span) % span - 20;
        const twinkle = reduced ? 1 : 0.6 + 0.4 * Math.sin(t * s.freq * 2 + s.phase) * Math.sin(t * s.freq * 0.7 + s.phase * 1.7);
        const alpha = Math.min(1, s.alpha * (0.55 + near * 0.9) * twinkle);
        const r = s.size * (0.85 + near * 1.5);

        ctx.globalAlpha = alpha;
        ctx.drawImage(sprites[s.tint], px - r * 3, wy - r * 3, r * 6, r * 6);

        // The few brightest stars catch a faint diffraction cross.
        if (s.flare && near > 0.45) {
          ctx.globalAlpha = alpha * 0.35;
          ctx.strokeStyle = TINTS[s.tint];
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(px - r * 7, wy); ctx.lineTo(px + r * 7, wy);
          ctx.moveTo(px, wy - r * 7); ctx.lineTo(px, wy + r * 7);
          ctx.stroke();
        }
      }

      if (meteors && !reduced) {
        if (now > nextMeteor) {
          spawnMeteor();
          const [min, max] = meteorEvery;
          nextMeteor = now + (min + Math.random() * (max - min)) * 1000;
        }
        flying = flying.filter((m) => m.age < m.life);
        for (const m of flying) {
          m.age += dt;
          m.x += m.vx * dt;
          m.y += m.vy * dt;
          // Fades in fast, burns out slower.
          const k = m.age / m.life;
          const fade = Math.min(1, k * 6) * (1 - k) ** 1.4;
          const speed = Math.hypot(m.vx, m.vy);
          const tx = m.x - (m.vx / speed) * m.length;
          const ty = m.y - (m.vy / speed) * m.length;
          const tail = ctx.createLinearGradient(m.x, m.y, tx, ty);
          tail.addColorStop(0, 'rgba(255,255,255,0.95)');
          tail.addColorStop(0.15, 'rgba(170,215,255,0.55)');
          tail.addColorStop(1, 'rgba(120,160,255,0)');
          ctx.globalAlpha = fade;
          ctx.strokeStyle = tail;
          ctx.lineWidth = m.width;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.drawImage(sprites[2], m.x - 6, m.y - 6, 12, 12);
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      if (!reduced) frame = requestAnimationFrame(draw);
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [density, meteors, meteorEvery, fixed]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none ${fixed ? 'fixed' : 'absolute'} inset-0 h-full w-full ${className}`}
    />
  );
}
