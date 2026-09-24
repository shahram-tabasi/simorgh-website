'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// ── The Simorgh passes ───────────────────────────────────────────────────
//
// The bird from the brand film (keyed off its green screen, public/simorgh/)
// crosses the screen in one flight and is gone: it rises in from a lower
// corner, climbs across turned along its path, and dwindles into the distance
// out of the opposite upper corner.
//
//  • It flies over the page (under the header and the chat button), so it is
//    actually seen; it never takes a click.
//  • It flies when a page opens, and again when the reader scrolls back up
//    (with a pause between flights).
//  • Not on the home page, whose hero already has its Simorgh; and it fades
//    out over anything marked [data-no-simorgh] (the company logo).
//  • prefers-reduced-motion: no bird.

type Vec = { x: number; y: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; age: number; size: number; hue: number };

const ART_ASPECT = 476 / 640;           // height / width of the keyed film
const ART_HEADING = Math.atan2(-0.9, 0.42); // the film's bird climbs up and to the right
const TAIL = { x: -0.14, y: 0.43 };     // tail tip relative to the centre, in bird widths
const PASS_SECONDS = 5.2;
const START_DELAY = 650;
const COOLDOWN = 9000;      // ms between flights
const SCROLL_UP_TRIGGER = 320; // px of upward scrolling that calls the bird

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2) * 0.35 + t * 0.65;

function bezier(p: Vec[], t: number): Vec {
  const u = 1 - t;
  return {
    x: u * u * u * p[0].x + 3 * u * u * t * p[1].x + 3 * u * t * t * p[2].x + t * t * t * p[3].x,
    y: u * u * u * p[0].y + 3 * u * u * t * p[1].y + 3 * u * t * t * p[2].y + t * t * t * p[3].y,
  };
}

/** Safari plays WebM but drops its alpha channel, so it gets the animated WebP instead. */
function supportsAlphaVideo() {
  const ua = navigator.userAgent;
  const safari = /^((?!chrome|chromium|crios|fxios|android|edg).)*safari/i.test(ua);
  return !safari && document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';
}

/** How much of the rectangle is covered by a visible [data-no-simorgh] area (0..1). */
function hiddenBy(zones: DOMRect[], x: number, y: number, w: number, h: number) {
  let covered = 0;
  for (const z of zones) {
    const ix = Math.max(0, Math.min(x + w, z.right) - Math.max(x, z.left));
    const iy = Math.max(0, Math.min(y + h, z.bottom) - Math.max(y, z.top));
    covered = Math.max(covered, (ix * iy) / Math.max(1, w * h));
  }
  return covered;
}

export function SimorghFlight() {
  const pathname = usePathname();
  const birdRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trailRef = useRef<HTMLCanvasElement | null>(null);
  const [media, setMedia] = useState<'video' | 'image' | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setMedia(supportsAlphaVideo() ? 'video' : 'image');
  }, []);

  useEffect(() => {
    if (!media) return;
    const bird = birdRef.current;
    const canvas = trailRef.current;
    const ctx = canvas?.getContext('2d');
    if (!bird || !canvas || !ctx) return;

    if (pathname === '/') return;
    let frame = 0;
    let cancelled = false;
    let flying = false;
    let lastFlight = -Infinity;

    const start = () => {
      if (cancelled || flying || performance.now() - lastFlight < COOLDOWN) return;
      flying = true;
      lastFlight = performance.now();
      const W = window.innerWidth;
      const H = window.innerHeight;
      const zonesAt = () => [...document.querySelectorAll('[data-no-simorgh]')].map((el) => el.getBoundingClientRect());

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const base = clamp(W * 0.3, 220, 440);
      const fromLeft = Math.random() < 0.5;
      const side = fromLeft ? 1 : -1;
      const sx = (v: number) => (fromLeft ? v : 1 - v) * W;
      // Rise from below one lower corner, climb across, leave high on the far side.
      const path: Vec[] = [
        { x: sx(-0.22), y: H * rand(0.8, 0.95) },
        { x: sx(rand(0.2, 0.3)), y: H * rand(0.7, 0.85) },
        { x: sx(rand(0.55, 0.7)), y: H * rand(0.2, 0.35) },
        { x: sx(1.18), y: -H * 0.2 },
      ];
      const depthAt = (t: number) => (t < 0.45 ? 0.95 + t * 0.3 : 1.08 - (t - 0.45) * 1.25); // near, then away
      const heading = fromLeft ? ART_HEADING : Math.PI - ART_HEADING;

      let sparks: Spark[] = [];
      let t = 0;
      let last = performance.now();
      const video = videoRef.current;
      if (video) { video.currentTime = 0; video.playbackRate = 1.2; video.play().catch(() => {}); }

      const step = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        t = Math.min(1, t + dt / PASS_SECONDS);
        const e = ease(t);
        const pos = bezier(path, e);
        const ahead = bezier(path, Math.min(1, e + 0.01));
        const dir = Math.atan2(ahead.y - pos.y, ahead.x - pos.x);
        // Turn the bird along its path, gently: the art already climbs.
        let turn = dir - heading;
        while (turn > Math.PI) turn -= Math.PI * 2;
        while (turn < -Math.PI) turn += Math.PI * 2;
        const rot = clamp(turn, -0.45, 0.45);
        const depth = depthAt(t);
        const width = base * depth;
        const height = width * ART_ASPECT;

        const fade = Math.min(1, t / 0.1) * Math.min(1, (1 - t) / 0.22);
        const hidden = hiddenBy(zonesAt(), pos.x - width / 2, pos.y - height / 2, width, height);
        const opacity = 0.92 * fade * (1 - Math.min(1, hidden * 2.5));

        bird.style.transform =
          `translate3d(${pos.x - base / 2}px, ${pos.y - (base * ART_ASPECT) / 2}px, 0) rotate(${rot}rad) scale(${depth * side}, ${depth})`;
        bird.style.opacity = String(opacity);
        bird.style.filter = `drop-shadow(0 0 ${10 + depth * 14}px rgba(150, 205, 255, 0.45)) blur(${t > 0.75 ? (t - 0.75) * 4 : 0}px)`;

        // A thin wake of stardust from the tail.
        const cos = Math.cos(rot);
        const sin = Math.sin(rot);
        const tx = TAIL.x * side * width;
        const ty = TAIL.y * width;
        if (opacity > 0.05 && Math.random() < 0.7) {
          sparks.push({
            x: pos.x + tx * cos - ty * sin + rand(-5, 5),
            y: pos.y + tx * sin + ty * cos + rand(-5, 5),
            vx: rand(-14, 14), vy: rand(6, 24), life: rand(1, 2), age: 0,
            size: rand(0.6, 1.8) * depth, hue: Math.random(),
          });
        }
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';
        sparks = sparks.filter((p) => p.age < p.life);
        for (const p of sparks) {
          p.age += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          const k = p.age / p.life;
          ctx.globalAlpha = Math.max(0, (1 - k) * 0.8 * (0.6 + 0.4 * Math.sin(p.age * 14 + p.hue * 6)));
          ctx.fillStyle = p.hue < 0.6 ? '#dff1ff' : p.hue < 0.88 ? '#8fdcff' : '#ffd98a';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - k * 0.5), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';

        if (t < 1 || sparks.length) frame = requestAnimationFrame(step);
        else { bird.style.opacity = '0'; video?.pause(); ctx.clearRect(0, 0, W, H); flying = false; lastFlight = performance.now(); }
      };
      frame = requestAnimationFrame(step);
    };

    // Give the new page a moment to lay out, then fly.
    const timer = window.setTimeout(start, START_DELAY);

    // Scrolling back up calls it again.
    let lastY = window.scrollY;
    let upward = 0;
    const onScroll = () => {
      const y = window.scrollY;
      upward = y < lastY ? upward + (lastY - y) : 0;
      lastY = y;
      if (upward > SCROLL_UP_TRIGGER) { upward = 0; start(); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      bird.style.opacity = '0';
      videoRef.current?.pause();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [media, pathname]);

  if (!media) return null;

  return (
    // Over the page, under the header (z-50) and the chat button.
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[40] overflow-hidden" data-no-translate>
      <canvas ref={trailRef} className="absolute inset-0 h-full w-full" />
      <div
        ref={birdRef}
        className="absolute left-0 top-0 origin-center mix-blend-screen will-change-transform"
        style={{ width: 'clamp(220px, 30vw, 440px)', opacity: 0 }}
      >
        {media === 'video' ? (
          <video
            ref={videoRef}
            src="/simorgh/simorgh-flight.webm"
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            className="block h-auto w-full"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/simorgh/simorgh-flight.webp" alt="" className="block h-auto w-full" />
        )}
      </div>
    </div>
  );
}
