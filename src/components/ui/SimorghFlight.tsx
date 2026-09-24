'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// ── The Simorgh, in flight ───────────────────────────────────────────────
//
// The bird from the brand film, keyed off its green screen (public/simorgh/),
// flying over the whole site. It is choreographed rather than looped in place:
//
//   intro    — the first visit of a session: a point of light far away that
//              comes towards the viewer, sweeps across the hero and settles.
//   wander   — roams the margins and the sky above the content, never parking
//              over the middle column where people read.
//   swoop    — on every page change (and now and then on its own) it makes a
//              close pass across the screen and comes back from the far side.
//   curious  — leave the pointer still for a few seconds and it comes over and
//              circles it; move and it goes back to its business.
//
// Depth is a single number: it scales the bird, sets its brightness and how
// much of its stardust trail it sheds. Wing-beats speed up with flight speed.
// Scrolling nudges it along with the page. prefers-reduced-motion gets a
// still bird resting in the corner of the sky.

type Mode = 'intro' | 'wander' | 'swoop' | 'curious';
type Vec = { x: number; y: number };
type Path = { p: Vec[]; d: number[]; t: number; dur: number; then: () => void };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; age: number; size: number; hue: number };

const ART_ASPECT = 476 / 640;          // height / width of the keyed film
const TAIL = { x: -0.14, y: 0.43 };    // tail tip, relative to the bird's centre, in bird widths
const INTRO_KEY = 'simorgh-intro-seen';

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

function bezier(p: Vec[], t: number): Vec {
  const u = 1 - t;
  const [a, b, c, d] = p;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  };
}

/** Safari plays WebM but drops its alpha channel, so it gets the animated WebP instead. */
function supportsAlphaVideo() {
  const ua = navigator.userAgent;
  const safari = /^((?!chrome|chromium|crios|fxios|android|edg).)*safari/i.test(ua);
  return !safari && document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';
}

export function SimorghFlight() {
  const pathname = usePathname();
  const birdRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trailRef = useRef<HTMLCanvasElement | null>(null);
  const routeRef = useRef<(() => void) | null>(null);
  const [media, setMedia] = useState<'video' | 'image' | 'still' | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setMedia(reduced ? 'still' : supportsAlphaVideo() ? 'video' : 'image');
  }, []);

  useEffect(() => {
    if (!media || media === 'still') return;
    const bird = birdRef.current;
    const canvas = trailRef.current;
    const ctx = canvas?.getContext('2d');
    if (!bird || !canvas || !ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let base = 0;                         // bird width at depth 1
    const size = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      base = clamp(W * 0.23, 170, 360);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    const s = {
      pos: { x: W * 0.8, y: H * 0.2 } as Vec,
      vel: { x: -40, y: 0 } as Vec,
      depth: 0.7,
      depthTarget: 0.7,
      facing: -1,
      opacity: 0,
      mode: 'wander' as Mode,
      target: { x: W * 0.15, y: H * 0.2 } as Vec,
      path: null as Path | null,
      orbit: 0,
      modeUntil: 0,
      nextSwoop: performance.now() + rand(35000, 55000),
    };
    const pointer = { x: W / 2, y: H / 2, movedAt: performance.now() };
    let sparks: Spark[] = [];
    let last = performance.now();
    let frame = 0;
    let rate = 1;

    /** Somewhere in the sky that is not over the reading column. */
    const waypoint = (): Vec => {
      if (W < 768) return { x: rand(0.12, 0.88) * W, y: rand(0.1, 0.3) * H };
      const zone = Math.random();
      if (zone < 0.38) return { x: rand(0.04, 0.2) * W, y: rand(0.14, 0.78) * H };
      if (zone < 0.76) return { x: rand(0.8, 0.95) * W, y: rand(0.14, 0.7) * H };
      return { x: rand(0.22, 0.78) * W, y: rand(0.1, 0.22) * H };
    };

    const wander = () => {
      s.mode = 'wander';
      s.path = null;
      s.target = waypoint();
      s.depthTarget = rand(0.5, 0.9);
    };

    const follow = (p: Vec[], d: number[], dur: number, then: () => void) => {
      s.path = { p, d, t: 0, dur, then };
    };

    /** From deep space to the viewer: a point of light that grows into the bird. */
    const intro = () => {
      s.mode = 'intro';
      s.pos = { x: W * 0.62, y: H * 0.22 };
      s.depth = 0.04;
      follow(
        [{ x: W * 0.62, y: H * 0.22 }, { x: W * 0.98, y: H * 0.5 }, { x: W * 0.32, y: H * 0.62 }, { x: W * 0.14, y: H * 0.3 }],
        [0.04, 0.5, 1.25, 0.8],
        6.2,
        wander,
      );
    };

    /** A close pass across the screen, out one side and back in from the other, far away. */
    const swoop = () => {
      if (s.mode === 'intro') return;
      s.mode = 'swoop';
      const toLeft = s.pos.x > W / 2;
      const exit = { x: toLeft ? -base * 1.4 : W + base * 1.4, y: rand(0.3, 0.55) * H };
      follow(
        [{ ...s.pos }, { x: W * 0.5, y: H * rand(0.05, 0.2) }, { x: W * (toLeft ? 0.3 : 0.7), y: H * 0.6 }, exit],
        [s.depth, 1.15, 1.45, 1.2],
        2.8,
        () => {
          const enter = { x: toLeft ? W + base : -base, y: rand(0.12, 0.3) * H };
          s.pos = { ...enter };
          s.depth = 0.35;
          s.vel = { x: toLeft ? -120 : 120, y: 0 };
          wander();
        },
      );
      s.nextSwoop = performance.now() + rand(40000, 65000);
    };
    routeRef.current = swoop;

    let introSeen = false;
    try { introSeen = sessionStorage.getItem(INTRO_KEY) === '1'; sessionStorage.setItem(INTRO_KEY, '1'); } catch {}
    if (!introSeen) intro();
    else {
      // Later pages of the same visit: glide in from the edge instead.
      s.pos = { x: W + base, y: H * 0.22 };
      s.vel = { x: -160, y: 10 };
      s.depth = 0.45;
      wander();
    }

    const onPointer = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.movedAt = performance.now();
      if (s.mode === 'curious' && Math.hypot(e.movementX, e.movementY) > 6) wander();
    };
    let lastScroll = window.scrollY;
    const onScroll = () => {
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      // The page moves, the sky stays: a light nudge the other way, more when near.
      if (s.mode === 'wander' || s.mode === 'curious') s.vel.y -= clamp(dy, -80, 80) * 1.6 * s.depth;
    };

    const emit = (x: number, y: number, n: number, burst = false) => {
      for (let i = 0; i < n; i++) {
        sparks.push({
          x: x + rand(-6, 6), y: y + rand(-6, 6),
          vx: rand(-18, 18) - s.vel.x * 0.04 + (burst ? rand(-60, 60) : 0),
          vy: rand(4, 26) - s.vel.y * 0.04 + (burst ? rand(-60, 60) : 0),
          life: rand(1.1, 2.4), age: 0, size: rand(0.6, 2) * (0.6 + s.depth * 0.5),
          hue: Math.random(),
        });
      }
    };

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // ── Decide what to do ────────────────────────────────────────────
      if (s.mode === 'wander') {
        if (now > s.nextSwoop) swoop();
        else if (now - pointer.movedAt > 6500 && W >= 768) {
          s.mode = 'curious';
          s.modeUntil = now + 9000;
          s.orbit = Math.atan2(s.pos.y - pointer.y, s.pos.x - pointer.x);
          s.depthTarget = 0.75;
        } else if (Math.hypot(s.target.x - s.pos.x, s.target.y - s.pos.y) < 60) {
          s.target = waypoint();
          s.depthTarget = rand(0.45, 0.95);
        }
      } else if (s.mode === 'curious') {
        s.orbit += dt * 0.8;
        const r = 150 + Math.sin(now / 1300) * 30;
        s.target = { x: pointer.x + Math.cos(s.orbit) * r * 1.3, y: pointer.y + Math.sin(s.orbit) * r * 0.6 - 40 };
        if (now > s.modeUntil) { pointer.movedAt = now; wander(); }
      }

      // ── Move ─────────────────────────────────────────────────────────
      if (s.path) {
        const p = s.path;
        p.t = Math.min(1, p.t + dt / p.dur);
        const e = smooth(p.t);
        const at = bezier(p.p, e);
        s.vel = { x: (at.x - s.pos.x) / Math.max(dt, 1e-3), y: (at.y - s.pos.y) / Math.max(dt, 1e-3) };
        s.pos = at;
        const seg = Math.min(p.d.length - 2, Math.floor(e * (p.d.length - 1)));
        const local = e * (p.d.length - 1) - seg;
        s.depth = p.d[seg] + (p.d[seg + 1] - p.d[seg]) * smooth(local);
        if (p.t >= 1) p.then();
      } else {
        // Steering: turn towards the target with limited acceleration, so every
        // change of course is a curve.
        const dx = s.target.x - s.pos.x;
        const dy = s.target.y - s.pos.y;
        const dist = Math.hypot(dx, dy) || 1;
        const cruise = s.mode === 'curious' ? 170 : clamp(dist * 0.6, 70, 190);
        const ax = (dx / dist) * cruise - s.vel.x;
        const ay = (dy / dist) * cruise - s.vel.y;
        const k = 1.1;
        s.vel.x += ax * k * dt;
        s.vel.y += ay * k * dt;
        // A slow bob, like riding the air.
        s.vel.y += Math.sin(now / 900) * 12 * dt;
        s.pos.x += s.vel.x * dt;
        s.pos.y += s.vel.y * dt;
        s.depth += (s.depthTarget - s.depth) * dt * 0.5;
      }

      // ── Pose ─────────────────────────────────────────────────────────
      const speed = Math.hypot(s.vel.x, s.vel.y);
      if (Math.abs(s.vel.x) > 25) s.facing += (Math.sign(s.vel.x) - s.facing) * Math.min(1, dt * 3.2);
      const flip = Math.sign(s.facing || 1) * Math.max(0.22, Math.abs(s.facing));
      const tilt = clamp(Math.atan2(s.vel.y, Math.abs(s.vel.x) + 60) * 0.45, -0.32, 0.32) * Math.sign(s.facing || 1);
      const scale = s.depth;
      const width = base * scale;
      const targetOpacity = clamp(0.35 + s.depth * 0.65, 0, 1) * (W < 768 ? 0.8 : 1);
      s.opacity += (targetOpacity - s.opacity) * Math.min(1, dt * 2.5);

      bird.style.transform =
        `translate3d(${s.pos.x - base / 2}px, ${s.pos.y - (base * ART_ASPECT) / 2}px, 0) rotate(${tilt}rad) scale(${scale * flip}, ${scale})`;
      bird.style.opacity = String(s.opacity);
      // Brighter up close, a touch hazy far away.
      bird.style.filter = `drop-shadow(0 0 ${8 + s.depth * 18}px rgba(150, 205, 255, ${0.25 + s.depth * 0.3})) brightness(${0.85 + s.depth * 0.3})`;

      const video = videoRef.current;
      if (video) {
        const wanted = clamp(0.7 + speed / 420, 0.7, 1.7);
        if (Math.abs(wanted - rate) > 0.06) { rate = wanted; video.playbackRate = rate; }
      }

      // ── Stardust ─────────────────────────────────────────────────────
      const cos = Math.cos(tilt);
      const sin = Math.sin(tilt);
      const tx = TAIL.x * flip * width;
      const ty = TAIL.y * width;
      const tailX = s.pos.x + tx * cos - ty * sin;
      const tailY = s.pos.y + tx * sin + ty * cos;
      const rateOfDust = (speed / 60 + 1) * (0.4 + s.depth) * (s.mode === 'swoop' ? 3 : 1);
      if (Math.random() < rateOfDust * dt * 10) emit(tailX, tailY, 1 + Math.floor(Math.random() * 2));
      if (s.mode === 'intro' && s.path && s.path.t > 0.35 && s.path.t < 0.4) emit(s.pos.x, s.pos.y, 6, true);

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      // A soft light around the bird: it is a creature of light, and it lights the sky.
      const halo = ctx.createRadialGradient(s.pos.x, s.pos.y, 0, s.pos.x, s.pos.y, width * 0.75);
      halo.addColorStop(0, `rgba(150, 200, 255, ${0.10 * s.opacity})`);
      halo.addColorStop(1, 'rgba(150, 200, 255, 0)');
      ctx.fillStyle = halo;
      ctx.fillRect(s.pos.x - width, s.pos.y - width, width * 2, width * 2);

      sparks = sparks.filter((p) => p.age < p.life);
      for (const p of sparks) {
        p.age += dt;
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 6 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const k = p.age / p.life;
        const a = (1 - k) * (0.55 + 0.45 * Math.sin(p.age * 14 + p.hue * 6)) * s.opacity;
        ctx.globalAlpha = Math.max(0, a);
        ctx.fillStyle = p.hue < 0.55 ? '#dff1ff' : p.hue < 0.85 ? '#8fdcff' : '#ffd98a';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - k * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      frame = requestAnimationFrame(step);
    };

    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); videoRef.current?.pause(); }
      else { last = performance.now(); frame = requestAnimationFrame(step); videoRef.current?.play().catch(() => {}); }
    };

    frame = requestAnimationFrame(step);
    window.addEventListener('resize', size);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      routeRef.current = null;
      window.removeEventListener('resize', size);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [media]);

  // Every page change is a reason to fly past.
  const firstPath = useRef(true);
  useEffect(() => {
    if (firstPath.current) { firstPath.current = false; return; }
    routeRef.current?.();
  }, [pathname]);

  if (!media) return null;

  if (media === 'still') {
    return (
      <div aria-hidden="true" className="pointer-events-none fixed right-[4%] top-[14%] z-[35] w-[min(26vw,300px)] opacity-60 mix-blend-screen">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/simorgh/simorgh-still.webp" alt="" className="h-auto w-full" />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[35] overflow-hidden" data-no-translate>
      <canvas ref={trailRef} className="absolute inset-0 h-full w-full" />
      <div
        ref={birdRef}
        className="absolute left-0 top-0 origin-center mix-blend-screen will-change-transform"
        style={{ width: 'clamp(170px, 23vw, 360px)', opacity: 0 }}
      >
        {media === 'video' ? (
          <video
            ref={videoRef}
            src="/simorgh/simorgh-flight.webm"
            poster="/simorgh/simorgh-still.webp"
            autoPlay
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
