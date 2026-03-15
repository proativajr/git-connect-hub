import { useEffect, useRef, useCallback } from "react";

interface Fish {
  x: number; y: number; vx: number; vy: number;
  size: number; hue: number; alpha: number;
}

interface SharkSilhouette {
  x: number; y: number; speed: number; size: number; alpha: number; direction: number;
}

interface Particle {
  x: number; y: number; radius: number; speed: number; alpha: number; drift: number;
}

const FISH_COUNT = 60;
const SHARK_COUNT = 3;
const PARTICLE_COUNT = 30;

const OceanPillarsBackground = ({
  selectedPillarIndex,
}: {
  selectedPillarIndex: number | null;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const timeRef = useRef(0);
  const fishRef = useRef<Fish[]>([]);
  const sharksRef = useRef<SharkSilhouette[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  const initFish = useCallback((w: number, h: number): Fish[] =>
    Array.from({ length: FISH_COUNT }, () => ({
      x: Math.random() * w,
      y: h * 0.3 + Math.random() * h * 0.5,
      vx: (Math.random() - 0.3) * 1.5,
      vy: (Math.random() - 0.5) * 0.4,
      size: 2.5 + Math.random() * 2.5,
      hue: 195 + Math.random() * 25,
      alpha: 0.3 + Math.random() * 0.35,
    })), []);

  const initSharks = useCallback((w: number, h: number): SharkSilhouette[] =>
    Array.from({ length: SHARK_COUNT }, (_, i) => ({
      x: Math.random() * w,
      y: h * 0.55 + i * (h * 0.12),
      speed: 0.15 + Math.random() * 0.25,
      size: 1.2 + Math.random() * 0.8,
      alpha: 0.06 + Math.random() * 0.06,
      direction: Math.random() > 0.5 ? 1 : -1,
    })), []);

  const initParticles = useCallback((w: number, h: number): Particle[] =>
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: 0.5 + Math.random() * 1.2,
      speed: 0.03 + Math.random() * 0.1,
      alpha: 0.06 + Math.random() * 0.1,
      drift: (Math.random() - 0.5) * 0.2,
    })), []);

  const dimsRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dimsRef.current = { w, h };
      if (fishRef.current.length === 0) fishRef.current = initFish(w, h);
      if (sharksRef.current.length === 0) sharksRef.current = initSharks(w, h);
      if (particlesRef.current.length === 0) particlesRef.current = initParticles(w, h);
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      const { w, h } = dimsRef.current;
      if (w === 0 || h === 0) { animRef.current = requestAnimationFrame(animate); return; }
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Background gradient — deep ocean
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#081C2D");
      bg.addColorStop(0.4, "#0a2540");
      bg.addColorStop(0.7, "#071a2e");
      bg.addColorStop(1, "#040e1a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Caustic light rays from top
      ctx.globalAlpha = 0.025;
      for (let i = 0; i < 6; i++) {
        const cx = w * (0.1 + i * 0.16) + Math.sin(t * 0.15 + i * 1.2) * 40;
        const r = 120 + Math.sin(t * 0.3 + i) * 40;
        const g = ctx.createRadialGradient(cx, 0, 0, cx, r * 1.5, r);
        g.addColorStop(0, "rgba(140,210,255,0.6)");
        g.addColorStop(1, "rgba(140,210,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(cx - r, 0, r * 2, r * 3);
      }
      ctx.globalAlpha = 1;

      // Particles
      particlesRef.current.forEach(p => {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = "rgba(180,220,255,0.5)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Shark silhouettes (deep layer)
      sharksRef.current.forEach(s => {
        s.x += s.speed * s.direction;
        if (s.x > w + 100) { s.x = -100; s.direction = 1; }
        if (s.x < -100) { s.x = w + 100; s.direction = -1; }

        const sy = s.y + Math.sin(t * 0.3 + s.x * 0.005) * 8;
        ctx.save();
        ctx.translate(s.x, sy);
        ctx.scale(s.size * s.direction, s.size);
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = "#0a2040";

        // Simplified shark silhouette
        ctx.beginPath();
        ctx.moveTo(40, 0);
        ctx.bezierCurveTo(30, -8, 10, -12, -20, -5);
        ctx.lineTo(-35, -15);
        ctx.lineTo(-30, -3);
        ctx.lineTo(-50, 0);
        ctx.lineTo(-30, 3);
        ctx.lineTo(-35, 15);
        ctx.lineTo(-20, 5);
        ctx.bezierCurveTo(10, 12, 30, 8, 40, 0);
        ctx.fill();

        // Dorsal fin
        ctx.beginPath();
        ctx.moveTo(5, -5);
        ctx.lineTo(-5, -20);
        ctx.lineTo(-10, -5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      // Fish schools (mid layer)
      const selectedX = selectedPillarIndex !== null ? w * (0.25 + selectedPillarIndex * 0.25) : null;

      fishRef.current.forEach(f => {
        // Gentle attraction toward selected pillar
        if (selectedX !== null) {
          const dx = selectedX - f.x;
          const dy = h * 0.4 - f.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > 20) {
            f.vx += (dx / d) * 0.008;
            f.vy += (dy / d) * 0.004;
          }
        }

        // School cohesion simplified
        f.vx += (Math.random() - 0.5) * 0.02;
        f.vy += (Math.random() - 0.5) * 0.01;

        const spd = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
        if (spd > 1.8) { f.vx *= 0.98; f.vy *= 0.98; }
        if (spd < 0.3) { f.vx += 0.1; }

        f.x += f.vx;
        f.y += f.vy;

        if (f.x > w + 20) f.x = -20;
        if (f.x < -20) f.x = w + 20;
        if (f.y < h * 0.15) f.vy += 0.02;
        if (f.y > h * 0.85) f.vy -= 0.02;

        const angle = Math.atan2(f.vy, f.vx);
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(angle);
        ctx.globalAlpha = f.alpha;

        ctx.fillStyle = `hsla(${f.hue}, 40%, 72%, 0.7)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, f.size * 1.6, f.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${f.hue}, 35%, 60%, 0.5)`;
        ctx.beginPath();
        ctx.moveTo(-f.size * 1.4, 0);
        ctx.lineTo(-f.size * 2.4, -f.size * 0.6);
        ctx.lineTo(-f.size * 2.4, f.size * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [initFish, initSharks, initParticles, selectedPillarIndex]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
};

export default OceanPillarsBackground;
