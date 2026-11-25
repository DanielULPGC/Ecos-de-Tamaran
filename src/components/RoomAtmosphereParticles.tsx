import React, { useEffect, useRef } from 'react';
import { RoomId } from '../types/game';
import { soundEngine } from '../utils/audio';

interface RoomAtmosphereParticlesProps {
  roomId: RoomId;
  /** Playfield element that receives pointer interactions without blocking hotspots */
  interactionTargetRef: React.RefObject<HTMLDivElement | null>;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  boostVx: number;
  boostVy: number;
  radius: number;
  baseAlpha: number;
  phase: number;
  phaseSpeed: number;
  swayAmp: number;
  color: string;
  isAccent: boolean;
  glow: boolean;
  stretchX: number;
  highlight: number;
  lastTouchedAt: number;
}

interface TouchRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface RoomParticlePreset {
  count: number;
  colors: string[];
  accentColors?: string[];
  accentRatio?: number;
  minRadius: number;
  maxRadius: number;
  minAlpha: number;
  maxAlpha: number;
  vxRange: [number, number];
  vyRange: [number, number];
  swayAmpRange: [number, number];
  phaseSpeedRange: [number, number];
  stretchX?: number;
}

const ROOM_PARTICLE_PRESETS: Record<RoomId, RoomParticlePreset> = {
  aborigenes: {
    // Polvo volcánico en rayos de luz y chispas suaves de fogón en la cueva
    count: 34,
    colors: ['244, 218, 170', '224, 189, 138', '248, 236, 208'],
    accentColors: ['242, 146, 66', '230, 169, 79'],
    accentRatio: 0.22,
    minRadius: 1.2,
    maxRadius: 3.1,
    minAlpha: 0.22,
    maxAlpha: 0.56,
    vxRange: [-7, 9],
    vyRange: [-13, -4],
    swayAmpRange: [6, 16],
    phaseSpeedRange: [0.6, 1.35],
    stretchX: 1,
  },
  conquista: {
    // Motas doradas de polvo de archivo y arena fina del barranco de Guiniguada
    count: 32,
    colors: ['242, 224, 182', '228, 200, 144', '250, 240, 214'],
    accentColors: ['214, 174, 108'],
    accentRatio: 0.18,
    minRadius: 1.1,
    maxRadius: 2.8,
    minAlpha: 0.2,
    maxAlpha: 0.5,
    vxRange: [6, 15],
    vyRange: [3, 10],
    swayAmpRange: [5, 13],
    phaseSpeedRange: [0.45, 1.05],
    stretchX: 1,
  },
  pirateria: {
    // Bruma marina atlántica, arena arrastrada por los alisios y brasas del torreón
    count: 40,
    colors: ['212, 232, 248', '234, 224, 198', '194, 219, 240'],
    accentColors: ['244, 162, 74'],
    accentRatio: 0.14,
    minRadius: 1.1,
    maxRadius: 2.7,
    minAlpha: 0.22,
    maxAlpha: 0.54,
    vxRange: [24, 46],
    vyRange: [-6, 5],
    swayAmpRange: [4, 11],
    phaseSpeedRange: [1.0, 2.0],
    stretchX: 1.45,
  },
  sigloXX: {
    // Brisa dorada del Puerto de La Luz y reflejos salinos al atardecer
    count: 30,
    colors: ['246, 228, 190', '206, 228, 246', '252, 242, 218'],
    accentColors: ['234, 186, 112'],
    accentRatio: 0.2,
    minRadius: 1.2,
    maxRadius: 3.0,
    minAlpha: 0.18,
    maxAlpha: 0.48,
    vxRange: [10, 22],
    vyRange: [-5, 5],
    swayAmpRange: [6, 14],
    phaseSpeedRange: [0.55, 1.2],
    stretchX: 1.15,
  },
};

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function createParticle(
  width: number,
  height: number,
  preset: RoomParticlePreset
): Particle {
  const isAccent =
    Boolean(preset.accentColors?.length) &&
    Math.random() < (preset.accentRatio ?? 0);
  const palette =
    isAccent && preset.accentColors ? preset.accentColors : preset.colors;
  const radius = randomBetween(preset.minRadius, preset.maxRadius);

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: randomBetween(preset.vxRange[0], preset.vxRange[1]),
    vy: isAccent
      ? randomBetween(-18, -8)
      : randomBetween(preset.vyRange[0], preset.vyRange[1]),
    boostVx: 0,
    boostVy: 0,
    radius,
    baseAlpha: randomBetween(preset.minAlpha, preset.maxAlpha),
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: randomBetween(
      preset.phaseSpeedRange[0],
      preset.phaseSpeedRange[1]
    ),
    swayAmp: randomBetween(preset.swayAmpRange[0], preset.swayAmpRange[1]),
    color: pickRandom(palette),
    isAccent,
    glow: isAccent || radius > 2.25,
    stretchX: isAccent ? 1 : preset.stretchX ?? 1,
    highlight: 0,
    lastTouchedAt: 0,
  };
}

export const RoomAtmosphereParticles: React.FC<RoomAtmosphereParticlesProps> = ({
  roomId,
  interactionTargetRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const preset = ROOM_PARTICLE_PRESETS[roomId];
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    const ripples: TouchRipple[] = [];
    let rafId = 0;
    let lastTime = performance.now();
    let isPaused = document.hidden;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const prevWidth = width;
      const prevHeight = height;

      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particles.length === 0) {
        particles = Array.from({ length: preset.count }, () =>
          createParticle(width, height, preset)
        );
      } else if (prevWidth > 0 && prevHeight > 0) {
        const sx = width / prevWidth;
        const sy = height / prevHeight;
        for (const p of particles) {
          p.x *= sx;
          p.y *= sy;
        }
      }
    };

    const interactAtPoint = (
      clientX: number,
      clientY: number,
      isClick: boolean
    ) => {
      if (isPaused || width <= 0 || height <= 0) return;
      const rect = canvas.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      if (px < 0 || py < 0 || px > rect.width || py > rect.height) return;

      const now = performance.now();
      const hitRadius = isClick ? 52 : 28;
      const hitRadiusSq = hitRadius * hitRadius;
      let closestHit: Particle | null = null;
      let closestDistSq = Infinity;

      for (const p of particles) {
        const dx = p.x - px;
        const dy = p.y - py;
        const distSq = dx * dx + dy * dy;
        if (distSq <= hitRadiusSq) {
          const dist = Math.max(4, Math.sqrt(distSq));
          const strength = (isClick ? 58 : 34) * (1 - dist / hitRadius);
          p.boostVx += (dx / dist) * strength;
          p.boostVy += (dy / dist) * strength - (isClick ? 12 : 5);
          p.highlight = 1;

          if (now - p.lastTouchedAt > 420 && distSq < closestDistSq) {
            closestDistSq = distSq;
            closestHit = p;
          }
        }
      }

      if (closestHit) {
        closestHit.lastTouchedAt = now;
        if (ripples.length < 10) {
          ripples.push({
            x: closestHit.x,
            y: closestHit.y,
            radius: closestHit.radius * 1.6,
            maxRadius: isClick ? 30 : 20,
            alpha: isClick ? 0.55 : 0.36,
            color: closestHit.color,
          });
        }
        soundEngine.playParticleTouch(roomId, {
          isAccent: closestHit.isAccent,
          normalizedX: px / rect.width,
          normalizedY: py / rect.height,
        });
      } else if (isClick) {
        // Gentle fallback ripple + ambient micro-sound when tapping open space in the room
        if (ripples.length < 10) {
          ripples.push({
            x: px,
            y: py,
            radius: 4,
            maxRadius: 24,
            alpha: 0.32,
            color: preset.colors[0],
          });
        }
        soundEngine.playParticleTouch(roomId, {
          isAccent: false,
          normalizedX: px / rect.width,
          normalizedY: py / rect.height,
        });
      }
    };

    const isInteractiveUiTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof Element)) return false;
      return Boolean(target.closest('button, a, input, select, textarea'));
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (isInteractiveUiTarget(event.target)) return;
      interactAtPoint(event.clientX, event.clientY, true);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' && event.buttons === 0) return;
      if (isInteractiveUiTarget(event.target)) return;
      interactAtPoint(event.clientX, event.clientY, false);
    };

    const drawFrame = (now: number) => {
      if (isPaused) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (width > 0 && height > 0) {
        ctx.clearRect(0, 0, width, height);
        const pad = 16;
        const drag = Math.exp(-3.4 * dt);

        // Draw expanding touch ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.radius += (r.maxRadius - r.radius) * Math.min(1, dt * 7.5) + dt * 16;
          r.alpha -= dt * 1.15;
          if (r.alpha <= 0.01 || r.radius >= r.maxRadius + 4) {
            ripples.splice(i, 1);
            continue;
          }
          ctx.strokeStyle = `rgba(${r.color}, ${r.alpha.toFixed(3)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        for (const p of particles) {
          p.phase += p.phaseSpeed * dt;
          const swayX = Math.sin(p.phase) * p.swayAmp * dt;
          const swayY = Math.cos(p.phase * 0.85) * (p.swayAmp * 0.45) * dt;

          p.boostVx *= drag;
          p.boostVy *= drag;
          if (p.highlight > 0) {
            p.highlight = Math.max(0, p.highlight - dt * 2.1);
          }

          p.x += (p.vx + p.boostVx) * dt + swayX;
          p.y += (p.vy + p.boostVy) * dt + swayY;

          if (p.x > width + pad) p.x = -pad;
          if (p.x < -pad) p.x = width + pad;
          if (p.y > height + pad) p.y = -pad;
          if (p.y < -pad) p.y = height + pad;

          const shimmer = 0.65 + 0.35 * Math.sin(p.phase * 1.4);
          const alpha = Math.min(
            0.92,
            p.baseAlpha * shimmer + p.highlight * 0.42
          );
          const activeRadius = p.radius * (1 + p.highlight * 0.55);

          if (p.glow || p.highlight > 0.1) {
            const glowRadius = activeRadius * (2.8 + p.highlight * 1.2);
            const grad = ctx.createRadialGradient(
              p.x,
              p.y,
              0,
              p.x,
              p.y,
              glowRadius
            );
            grad.addColorStop(0, `rgba(${p.color}, ${alpha.toFixed(3)})`);
            grad.addColorStop(
              0.45,
              `rgba(${p.color}, ${(alpha * 0.45).toFixed(3)})`
            );
            grad.addColorStop(1, `rgba(${p.color}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = `rgba(${p.color}, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.ellipse(
              p.x,
              p.y,
              activeRadius * p.stretchX,
              activeRadius,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }
      }

      rafId = window.requestAnimationFrame(drawFrame);
    };

    const handleVisibility = () => {
      isPaused = document.hidden;
      if (!isPaused) {
        lastTime = performance.now();
        window.cancelAnimationFrame(rafId);
        rafId = window.requestAnimationFrame(drawFrame);
      } else {
        window.cancelAnimationFrame(rafId);
      }
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        window.cancelAnimationFrame(rafId);
        ctx.clearRect(0, 0, width, height);
      } else if (!document.hidden) {
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(drawFrame);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    document.addEventListener('visibilitychange', handleVisibility);
    motionQuery.addEventListener('change', handleMotionChange);

    const targetEl = interactionTargetRef.current;
    targetEl?.addEventListener('pointerdown', handlePointerDown);
    targetEl?.addEventListener('pointermove', handlePointerMove);

    if (!isPaused) {
      lastTime = performance.now();
      rafId = window.requestAnimationFrame(drawFrame);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      motionQuery.removeEventListener('change', handleMotionChange);
      targetEl?.removeEventListener('pointerdown', handlePointerDown);
      targetEl?.removeEventListener('pointermove', handlePointerMove);
    };
  }, [roomId, interactionTargetRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="room-particles-canvas pointer-events-none absolute inset-0 h-full w-full"
    />
  );
};
