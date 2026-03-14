import { useEffect, useRef, useCallback } from "react";

interface Fish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  alpha: number;
  drift: number;
}

const FISH_COUNT = 80;
const PARTICLE_COUNT = 40;

// Boids parameters
const SEPARATION_RADIUS = 18;
const ALIGNMENT_RADIUS = 50;
const COHESION_RADIUS = 80;
const SEPARATION_FORCE = 0.05;
const ALIGNMENT_FORCE = 0.03;
const COHESION_FORCE = 0.008;
const MAX_SPEED = 2.2;
const MIN_SPEED = 0.6;
const CURSOR_FLEE_RADIUS = 160;
const CURSOR_FLEE_FORCE = 0.45;
const WANDER_FORCE = 0.15;
const EDGE_MARGIN = 60;
const EDGE_FORCE = 0.08;

// Shark smoothing
const SHARK_LERP = 0.08;

const drawShark = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  t: number
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const scale = 1.8;
  ctx.scale(scale, scale);

  const tailSwing = Math.sin(t * 3.2) * 0.1;
  const bodyWave = (seg: number) => Math.sin(t * 3.2 - seg * 0.6) * 0.8 * seg;

  // === Shadow below ===
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#061020";
  ctx.beginPath();
  ctx.ellipse(0, 18, 38, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // === Tail (caudal fin) — forked, upper lobe larger ===
  ctx.save();
  ctx.translate(-34, bodyWave(4));
  ctx.rotate(tailSwing);
  // Upper lobe
  ctx.fillStyle = "#4a6e8a";
  ctx.beginPath();
  ctx.moveTo(2, -1);
  ctx.bezierCurveTo(-6, -4, -14, -14, -20, -18);
  ctx.bezierCurveTo(-16, -12, -12, -6, -8, -2);
  ctx.closePath();
  ctx.fill();
  // Lower lobe (smaller)
  ctx.beginPath();
  ctx.moveTo(2, 1);
  ctx.bezierCurveTo(-4, 4, -10, 10, -14, 13);
  ctx.bezierCurveTo(-10, 8, -6, 4, -4, 1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === Caudal peduncle (narrow tail section) ===
  ctx.fillStyle = "#5a7d96";
  ctx.beginPath();
  ctx.moveTo(-20, -3 + bodyWave(3));
  ctx.lineTo(-36, -1 + bodyWave(4));
  ctx.lineTo(-36, 1 + bodyWave(4));
  ctx.lineTo(-20, 3 + bodyWave(3));
  ctx.closePath();
  ctx.fill();

  // === Main body — side view, torpedo shape ===
  const bw1 = bodyWave(0.5);
  const bw2 = bodyWave(1.5);

  // Dark blue-grey upper body
  ctx.fillStyle = "#4a6e8a";
  ctx.beginPath();
  ctx.moveTo(30, 0 + bw1);
  ctx.bezierCurveTo(26, -10 + bw1, 16, -14 + bw1, 4, -14 + bw2);
  ctx.bezierCurveTo(-8, -13 + bw2, -16, -10 + bodyWave(2), -22, -5 + bodyWave(2.5));
  ctx.lineTo(-22, 0 + bodyWave(2.5));
  ctx.lineTo(30, 0 + bw1);
  ctx.fill();

  // Lighter belly
  ctx.fillStyle = "#8aafc8";
  ctx.beginPath();
  ctx.moveTo(30, 0 + bw1);
  ctx.lineTo(-22, 0 + bodyWave(2.5));
  ctx.lineTo(-22, 5 + bodyWave(2.5));
  ctx.bezierCurveTo(-16, 10 + bodyWave(2), -8, 12 + bw2, 4, 11 + bw2);
  ctx.bezierCurveTo(16, 10 + bw1, 26, 6 + bw1, 30, 0 + bw1);
  ctx.fill();

  // Belly highlight
  ctx.fillStyle = "#a8cce0";
  ctx.beginPath();
  ctx.moveTo(24, 2 + bw1);
  ctx.bezierCurveTo(18, 7 + bw1, 6, 9 + bw2, -6, 8 + bw2);
  ctx.bezierCurveTo(-14, 6 + bw2, -18, 4 + bodyWave(2.5), -18, 2 + bodyWave(2.5));
  ctx.lineTo(24, 2 + bw1);
  ctx.fill();

  // === Dorsal fin (tall, triangular) ===
  ctx.fillStyle = "#3d6078";
  ctx.beginPath();
  ctx.moveTo(4, -14 + bw2);
  ctx.bezierCurveTo(2, -24 + bw2, -2, -28 + bw2, -6, -30 + bw2);
  ctx.bezierCurveTo(-6, -26 + bw2, -8, -18 + bw2, -10, -12 + bw2);
  ctx.closePath();
  ctx.fill();

  // === Pectoral fin (large, swept back) ===
  ctx.fillStyle = "#4a6e8a";
  ctx.beginPath();
  ctx.moveTo(8, 6 + bw1);
  ctx.bezierCurveTo(4, 14 + bw1, -4, 22 + bw2, -10, 24 + bw2);
  ctx.bezierCurveTo(-6, 18 + bw2, -2, 12 + bw1, 4, 8 + bw1);
  ctx.closePath();
  ctx.fill();

  // === Pelvic fin (small, near tail) ===
  ctx.fillStyle = "#4a6e8a";
  ctx.beginPath();
  ctx.moveTo(-14, 6 + bodyWave(2));
  ctx.lineTo(-18, 12 + bodyWave(2.5));
  ctx.lineTo(-20, 6 + bodyWave(2.5));
  ctx.closePath();
  ctx.fill();

  // === Anal fin ===
  ctx.beginPath();
  ctx.moveTo(-18, 4 + bodyWave(2.5));
  ctx.lineTo(-22, 9 + bodyWave(3));
  ctx.lineTo(-24, 4 + bodyWave(3));
  ctx.closePath();
  ctx.fill();

  // === Second dorsal fin (small) ===
  ctx.fillStyle = "#3d6078";
  ctx.beginPath();
  ctx.moveTo(-14, -10 + bodyWave(2));
  ctx.lineTo(-16, -16 + bodyWave(2.5));
  ctx.lineTo(-20, -9 + bodyWave(2.5));
  ctx.closePath();
  ctx.fill();

  // === Head — pointed snout ===
  ctx.fillStyle = "#4a6e8a";
  ctx.beginPath();
  ctx.moveTo(30, 0 + bw1);
  ctx.bezierCurveTo(34, -3 + bw1, 38, -2 + bw1, 40, 0 + bw1);
  ctx.bezierCurveTo(38, 2 + bw1, 34, 3 + bw1, 30, 0 + bw1);
  ctx.fill();

  // === Gill slits ===
  ctx.strokeStyle = "#3a5a70";
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 3; i++) {
    const gx = 18 - i * 3;
    const gy = bw1;
    ctx.beginPath();
    ctx.moveTo(gx, -4 + gy);
    ctx.lineTo(gx - 0.5, 4 + gy);
    ctx.stroke();
  }

  // === Eye ===
  ctx.fillStyle = "#1a2e3e";
  ctx.beginPath();
  ctx.arc(28, -4 + bw1, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // Eye highlight
  ctx.fillStyle = "#c0dae8";
  ctx.beginPath();
  ctx.arc(28.5, -4.5 + bw1, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // === Subtle outline strokes for definition ===
  ctx.strokeStyle = "#2e4d62";
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.4;
  // Upper body contour
  ctx.beginPath();
  ctx.moveTo(38, -1 + bw1);
  ctx.bezierCurveTo(26, -11 + bw1, 16, -14 + bw1, 4, -14 + bw2);
  ctx.bezierCurveTo(-8, -13 + bw2, -16, -10 + bodyWave(2), -22, -5 + bodyWave(2.5));
  ctx.stroke();
  // Lower body contour
  ctx.beginPath();
  ctx.moveTo(38, 1 + bw1);
  ctx.bezierCurveTo(26, 7 + bw1, 16, 10 + bw1, 4, 11 + bw2);
  ctx.bezierCurveTo(-8, 12 + bw2, -16, 10 + bodyWave(2), -22, 5 + bodyWave(2.5));
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.restore();
};

const OceanBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const sharkRef = useRef({ x: -9999, y: -9999, angle: 0 });
  const scrollRef = useRef(0);
  const fishRef = useRef<Fish[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const wanderAngleRef = useRef(Math.random() * Math.PI * 2);
  const wanderTimerRef = useRef(0);

  const initFish = useCallback((w: number, h: number): Fish[] => {
    const cx = w / 2, cy = h / 2;
    return Array.from({ length: FISH_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
      return {
        x: cx + (Math.random() - 0.5) * w * 0.4,
        y: cy + (Math.random() - 0.5) * h * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        hue: 190 + Math.random() * 30,
        alpha: 0.5 + Math.random() * 0.4,
      };
    });
  }, []);

  const initParticles = useCallback((w: number, h: number): Particle[] =>
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: 0.5 + Math.random() * 1.5,
      speed: 0.05 + Math.random() * 0.15,
      alpha: 0.08 + Math.random() * 0.12,
      drift: (Math.random() - 0.5) * 0.3,
    })), []);

  const drawFish = useCallback((ctx: CanvasRenderingContext2D, f: Fish) => {
    const angle = Math.atan2(f.vy, f.vx);
    const s = f.size;
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(angle);
    ctx.globalAlpha = f.alpha;

    ctx.fillStyle = `hsla(${f.hue}, 55%, 65%, 0.85)`;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.8, s * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `hsla(${f.hue}, 50%, 55%, 0.7)`;
    ctx.beginPath();
    ctx.moveTo(-s * 1.6, 0);
    ctx.lineTo(-s * 2.8, -s * 0.8);
    ctx.lineTo(-s * 2.8, s * 0.8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(220,240,255,0.9)";
    ctx.beginPath();
    ctx.arc(s * 1.0, -s * 0.15, s * 0.18, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Hide default cursor over canvas
    canvas.style.cursor = "none";

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fishRef.current = initFish(w, h);
      particlesRef.current = initParticles(w, h);
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onScroll = () => { scrollRef.current = window.scrollY; };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("scroll", onScroll);

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      timeRef.current += 0.016;
      const t = timeRef.current;
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      // --- Smooth shark position ---
      const shark = sharkRef.current;
      if (shark.x < -5000) {
        shark.x = mx;
        shark.y = my;
      } else {
        shark.x += (mx - shark.x) * SHARK_LERP;
        shark.y += (my - shark.y) * SHARK_LERP;
      }
      const sdx = mx - shark.x, sdy = my - shark.y;
      const targetAngle = Math.atan2(sdy, sdx);
      // Smooth angle interpolation
      let angleDiff = targetAngle - shark.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      const sharkSpeed = Math.sqrt(sdx * sdx + sdy * sdy);
      if (sharkSpeed > 1) {
        shark.angle += angleDiff * 0.1;
      }

      // --- Background ---
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      bg.addColorStop(0, "#0e2a47");
      bg.addColorStop(0.4, "#0a1e38");
      bg.addColorStop(1, "#06101f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Water caustics
      ctx.globalAlpha = 0.03;
      for (let i = 0; i < 8; i++) {
        const cx = w * (0.1 + i * 0.11) + Math.sin(t * 0.3 + i) * 50;
        const cy = h * (0.2 + (i % 3) * 0.25) + Math.cos(t * 0.2 + i * 1.5) * 40 + scrollRef.current * 0.05;
        const r = 90 + Math.sin(t * 0.5 + i) * 35;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, "rgba(100,200,255,0.5)");
        g.addColorStop(1, "rgba(100,200,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;

      // --- Particles ---
      particlesRef.current.forEach(p => {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = "rgba(180,220,255,0.6)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // --- Boids ---
      const fish = fishRef.current;
      const sx = shark.x, sy = shark.y;

      wanderTimerRef.current -= 0.016;
      if (wanderTimerRef.current <= 0) {
        wanderAngleRef.current += (Math.random() - 0.5) * 1.2;
        wanderTimerRef.current = 2 + Math.random() * 4;
      }

      const scrollShift = Math.sin(scrollRef.current * 0.004) * 12;

      for (let i = 0; i < fish.length; i++) {
        const f = fish[i];
        let sepX = 0, sepY = 0;
        let aliVx = 0, aliVy = 0, aliCount = 0;
        let cohX = 0, cohY = 0, cohCount = 0;

        for (let j = 0; j < fish.length; j++) {
          if (i === j) continue;
          const dx = fish[j].x - f.x, dy = fish[j].y - f.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < SEPARATION_RADIUS && d > 0) { sepX -= dx / d; sepY -= dy / d; }
          if (d < ALIGNMENT_RADIUS) { aliVx += fish[j].vx; aliVy += fish[j].vy; aliCount++; }
          if (d < COHESION_RADIUS) { cohX += fish[j].x; cohY += fish[j].y; cohCount++; }
        }

        f.vx += sepX * SEPARATION_FORCE;
        f.vy += sepY * SEPARATION_FORCE;
        if (aliCount > 0) {
          f.vx += (aliVx / aliCount - f.vx) * ALIGNMENT_FORCE;
          f.vy += (aliVy / aliCount - f.vy) * ALIGNMENT_FORCE;
        }
        if (cohCount > 0) {
          f.vx += (cohX / cohCount - f.x) * COHESION_FORCE;
          f.vy += (cohY / cohCount - f.y) * COHESION_FORCE;
        }

        f.vx += Math.cos(wanderAngleRef.current + i * 0.1) * WANDER_FORCE * 0.016;
        f.vy += Math.sin(wanderAngleRef.current + i * 0.1) * WANDER_FORCE * 0.016;

        // Flee shark (smooth position)
        const cdx = f.x - sx, cdy = f.y - sy;
        const cd = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cd < CURSOR_FLEE_RADIUS && cd > 0) {
          const force = (1 - cd / CURSOR_FLEE_RADIUS) * CURSOR_FLEE_FORCE;
          f.vx += (cdx / cd) * force;
          f.vy += (cdy / cd) * force;
        }

        // Edge avoidance
        if (f.x < EDGE_MARGIN) f.vx += EDGE_FORCE;
        if (f.x > w - EDGE_MARGIN) f.vx -= EDGE_FORCE;
        if (f.y < EDGE_MARGIN) f.vy += EDGE_FORCE;
        if (f.y > h - EDGE_MARGIN) f.vy -= EDGE_FORCE;

        const spd = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
        if (spd > MAX_SPEED) { f.vx = (f.vx / spd) * MAX_SPEED; f.vy = (f.vy / spd) * MAX_SPEED; }
        if (spd < MIN_SPEED && spd > 0) { f.vx = (f.vx / spd) * MIN_SPEED; f.vy = (f.vy / spd) * MIN_SPEED; }

        f.x += f.vx;
        f.y += f.vy + scrollShift * 0.01;

        if (f.x < -20) f.x = w + 20;
        if (f.x > w + 20) f.x = -20;
        if (f.y < -20) f.y = h + 20;
        if (f.y > h + 20) f.y = -20;

        drawFish(ctx, f);
      }

      // --- Draw shark (replaces cursor) ---
      if (mx > -1000) {
        // Water disturbance around shark
        const ripple1R = 55 + Math.sin(t * 3) * 8;
        const ripple2R = 35 + Math.sin(t * 4.5 + 1) * 5;
        ctx.globalAlpha = 0.04 + Math.min(sharkSpeed * 0.002, 0.06);
        ctx.strokeStyle = "rgba(100,180,255,0.8)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(shark.x, shark.y, ripple1R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(shark.x, shark.y, ripple2R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        drawShark(ctx, shark.x, shark.y, shark.angle, t);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("scroll", onScroll);
    };
  }, [initFish, initParticles, drawFish]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "all", cursor: "none" }}
    />
  );
};

export default OceanBackground;
