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

const FISH_COUNT = 60;
const PARTICLE_COUNT = 30;

// Boids parameters
const SEPARATION_RADIUS = 18;
const ALIGNMENT_RADIUS = 50;
const COHESION_RADIUS = 80;
const SEPARATION_FORCE = 0.05;
const ALIGNMENT_FORCE = 0.03;
const COHESION_FORCE = 0.008;
const MAX_SPEED = 2.2;
const MIN_SPEED = 0.6;
const CURSOR_FLEE_RADIUS = 140;
const CURSOR_FLEE_FORCE = 0.35;
const WANDER_FORCE = 0.15;
const EDGE_MARGIN = 60;
const EDGE_FORCE = 0.08;

const OceanBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
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

  const drawFish = (ctx: CanvasRenderingContext2D, f: Fish) => {
    const angle = Math.atan2(f.vy, f.vx);
    const s = f.size;
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(angle);
    ctx.globalAlpha = f.alpha;

    // Body
    ctx.fillStyle = `hsla(${f.hue}, 55%, 65%, 0.85)`;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.8, s * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.fillStyle = `hsla(${f.hue}, 50%, 55%, 0.7)`;
    ctx.beginPath();
    ctx.moveTo(-s * 1.6, 0);
    ctx.lineTo(-s * 2.8, -s * 0.8);
    ctx.lineTo(-s * 2.8, s * 0.8);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = "rgba(220,240,255,0.9)";
    ctx.beginPath();
    ctx.arc(s * 1.0, -s * 0.15, s * 0.18, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth, h = window.innerHeight;
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

    const onMouse = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onScroll = () => { scrollRef.current = window.scrollY; };
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("scroll", onScroll);

    const animate = () => {
      const w = window.innerWidth, h = window.innerHeight;
      timeRef.current += 0.016;
      const t = timeRef.current;

      // --- Background ---
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      bg.addColorStop(0, "#0e2a47");
      bg.addColorStop(0.4, "#0a1e38");
      bg.addColorStop(1, "#06101f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Water caustics / light ripples
      ctx.globalAlpha = 0.03;
      for (let i = 0; i < 6; i++) {
        const cx = w * (0.2 + i * 0.12) + Math.sin(t * 0.3 + i) * 40;
        const cy = h * 0.3 + Math.cos(t * 0.2 + i * 1.5) * 30 + scrollRef.current * 0.05;
        const r = 80 + Math.sin(t * 0.5 + i) * 30;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, "rgba(120,200,255,0.5)");
        g.addColorStop(1, "rgba(120,200,255,0)");
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

      // --- Cursor shadow (shark beneath) ---
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      if (mx > -1000) {
        const shadow = ctx.createRadialGradient(mx, my, 0, mx, my, 90);
        shadow.addColorStop(0, "rgba(0,10,30,0.18)");
        shadow.addColorStop(0.5, "rgba(0,10,30,0.06)");
        shadow.addColorStop(1, "rgba(0,10,30,0)");
        ctx.fillStyle = shadow;
        ctx.fillRect(mx - 90, my - 90, 180, 180);

        // Ripple
        const rippleR = 50 + Math.sin(t * 3) * 8;
        ctx.strokeStyle = `rgba(100,180,255,${0.06 + Math.sin(t * 4) * 0.02})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mx, my, rippleR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // --- Boids ---
      const fish = fishRef.current;

      // Update wander direction occasionally
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

          if (d < SEPARATION_RADIUS && d > 0) {
            sepX -= dx / d;
            sepY -= dy / d;
          }
          if (d < ALIGNMENT_RADIUS) {
            aliVx += fish[j].vx;
            aliVy += fish[j].vy;
            aliCount++;
          }
          if (d < COHESION_RADIUS) {
            cohX += fish[j].x;
            cohY += fish[j].y;
            cohCount++;
          }
        }

        // Apply forces
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

        // Wander
        f.vx += Math.cos(wanderAngleRef.current + i * 0.1) * WANDER_FORCE * 0.016;
        f.vy += Math.sin(wanderAngleRef.current + i * 0.1) * WANDER_FORCE * 0.016;

        // Flee cursor
        const cdx = f.x - mx, cdy = f.y - my;
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

        // Clamp speed
        const spd = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
        if (spd > MAX_SPEED) { f.vx = (f.vx / spd) * MAX_SPEED; f.vy = (f.vy / spd) * MAX_SPEED; }
        if (spd < MIN_SPEED && spd > 0) { f.vx = (f.vx / spd) * MIN_SPEED; f.vy = (f.vy / spd) * MIN_SPEED; }

        f.x += f.vx;
        f.y += f.vy + scrollShift * 0.01;

        // Wrap
        if (f.x < -20) f.x = w + 20;
        if (f.x > w + 20) f.x = -20;
        if (f.y < -20) f.y = h + 20;
        if (f.y > h + 20) f.y = -20;

        drawFish(ctx, f);
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
  }, [initFish, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ pointerEvents: "all" }}
    />
  );
};

export default OceanBackground;
