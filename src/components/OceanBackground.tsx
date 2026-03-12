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

  // Body undulation — segments sway with phase offset
  const freq = 3.2;
  const amp = 0.06;
  const tailSwing = Math.sin(t * freq) * 0.14;
  const bodyWave = (seg: number) => Math.sin(t * freq - seg * 0.7) * amp * seg;

  // === Deep shadow ===
  ctx.globalAlpha = 0.13;
  ctx.fillStyle = "rgba(0,10,30,1)";
  ctx.beginPath();
  ctx.ellipse(0, 9, 44, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.07;
  ctx.beginPath();
  ctx.ellipse(-2, 6, 38, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;

  // === Tail (caudal fin) ===
  ctx.save();
  ctx.translate(-34, bodyWave(5));
  ctx.rotate(tailSwing);

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath();
  ctx.moveTo(3, 0);
  ctx.bezierCurveTo(-2, -4, -12, -14, -22, -19);
  ctx.bezierCurveTo(-18, -11, -12, -5, -7, 0);
  ctx.bezierCurveTo(-12, 5, -18, 11, -22, 19);
  ctx.bezierCurveTo(-12, 14, -2, 4, 3, 0);
  ctx.fill();

  // Tail subtle edge
  ctx.strokeStyle = "rgba(200,210,220,0.4)";
  ctx.lineWidth = 0.4;
  ctx.stroke();
  ctx.restore();

  // === Caudal peduncle ===
  ctx.fillStyle = "rgba(248,250,252,0.95)";
  ctx.beginPath();
  const py = bodyWave(4);
  ctx.moveTo(-24, -5 + py);
  ctx.bezierCurveTo(-28, -4 + py, -32, -3.5 + bodyWave(4.5), -35, -3 + bodyWave(5));
  ctx.lineTo(-35, 3 + bodyWave(5));
  ctx.bezierCurveTo(-32, 3.5 + bodyWave(4.5), -28, 4 + py, -24, 5 + py);
  ctx.closePath();
  ctx.fill();

  // === Second dorsal fin (small, near tail) ===
  ctx.fillStyle = "rgba(240,242,245,0.7)";
  ctx.beginPath();
  ctx.ellipse(-18, bodyWave(3.5), 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // === Pelvic fins ===
  ctx.fillStyle = "rgba(245,248,250,0.85)";
  ctx.globalAlpha = 0.85;
  const pvY = bodyWave(3);
  ctx.beginPath();
  ctx.moveTo(-14, -9 + pvY);
  ctx.bezierCurveTo(-16, -13 + pvY, -21, -17 + pvY, -23, -15 + pvY);
  ctx.bezierCurveTo(-20, -12 + pvY, -17, -10 + pvY, -14, -9 + pvY);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-14, 9 + pvY);
  ctx.bezierCurveTo(-16, 13 + pvY, -21, 17 + pvY, -23, 15 + pvY);
  ctx.bezierCurveTo(-20, 12 + pvY, -17, 10 + pvY, -14, 9 + pvY);
  ctx.fill();
  ctx.globalAlpha = 1;

  // === Main body ===
  const bw1 = bodyWave(1);
  const bw2 = bodyWave(2);
  const bw3 = bodyWave(3);

  // Body fill — pure white with subtle gradient for depth
  const bodyGrad = ctx.createLinearGradient(0, -14, 0, 14);
  bodyGrad.addColorStop(0, "rgba(235,240,245,0.95)");
  bodyGrad.addColorStop(0.3, "rgba(248,250,255,0.98)");
  bodyGrad.addColorStop(0.5, "rgba(255,255,255,1)");
  bodyGrad.addColorStop(0.7, "rgba(248,250,255,0.98)");
  bodyGrad.addColorStop(1, "rgba(235,240,245,0.95)");
  ctx.fillStyle = bodyGrad;

  ctx.beginPath();
  ctx.moveTo(28, 0); // front of body (behind hammer)
  ctx.bezierCurveTo(24, -6 + bw1, 16, -11 + bw1, 6, -13 + bw2);
  ctx.bezierCurveTo(-4, -14 + bw2, -14, -12 + bw3, -24, -8 + bw3);
  ctx.lineTo(-24, 8 + bw3);
  ctx.bezierCurveTo(-14, 12 + bw3, -4, 14 + bw2, 6, 13 + bw2);
  ctx.bezierCurveTo(16, 11 + bw1, 24, 6 + bw1, 28, 0);
  ctx.fill();

  // Subtle body outline
  ctx.strokeStyle = "rgba(190,200,215,0.3)";
  ctx.lineWidth = 0.6;
  ctx.stroke();

  // === Pectoral fins (large, swept back) ===
  ctx.fillStyle = "rgba(245,248,252,0.93)";

  // Left pectoral
  ctx.beginPath();
  ctx.moveTo(12, -11 + bw1);
  ctx.bezierCurveTo(8, -16 + bw1, 0, -28, -8, -32);
  ctx.bezierCurveTo(-6, -25, -2, -18, 2, -13 + bw1);
  ctx.bezierCurveTo(5, -11 + bw1, 9, -10 + bw1, 12, -11 + bw1);
  ctx.fill();
  ctx.strokeStyle = "rgba(190,200,215,0.25)";
  ctx.lineWidth = 0.4;
  ctx.stroke();

  // Right pectoral
  ctx.beginPath();
  ctx.moveTo(12, 11 + bw1);
  ctx.bezierCurveTo(8, 16 + bw1, 0, 28, -8, 32);
  ctx.bezierCurveTo(-6, 25, -2, 18, 2, 13 + bw1);
  ctx.bezierCurveTo(5, 11 + bw1, 9, 10 + bw1, 12, 11 + bw1);
  ctx.fill();
  ctx.strokeStyle = "rgba(190,200,215,0.25)";
  ctx.lineWidth = 0.4;
  ctx.stroke();

  // === Dorsal fin ridge (top-down) ===
  const dorsalGrad = ctx.createRadialGradient(4, bw2, 0, 4, bw2, 9);
  dorsalGrad.addColorStop(0, "rgba(220,225,235,0.6)");
  dorsalGrad.addColorStop(0.5, "rgba(230,235,240,0.3)");
  dorsalGrad.addColorStop(1, "rgba(240,242,245,0)");
  ctx.fillStyle = dorsalGrad;
  ctx.beginPath();
  ctx.ellipse(4, bw2, 9, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dorsal spine
  ctx.strokeStyle = "rgba(200,210,225,0.4)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(13, bw1);
  ctx.lineTo(-5, bw2);
  ctx.stroke();

  // === Spine line ===
  ctx.strokeStyle = "rgba(200,210,225,0.2)";
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(26, 0);
  ctx.quadraticCurveTo(10, bw1, -5, bw2);
  ctx.quadraticCurveTo(-15, bw3, -30, bodyWave(4.5));
  ctx.stroke();

  // === Gill slits ===
  ctx.strokeStyle = "rgba(180,190,210,0.3)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 5; i++) {
    const gx = 20 - i * 3;
    const gy = bodyWave(1 + i * 0.3);
    ctx.beginPath();
    ctx.moveTo(gx, -8 + gy);
    ctx.lineTo(gx - 0.8, -10.5 + gy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gx, 8 + gy);
    ctx.lineTo(gx - 0.8, 10.5 + gy);
    ctx.stroke();
  }

  // === HAMMERHEAD (cephalofoil) ===
  // The distinctive T-shaped head
  const headY = 0;

  // Hammer bar (wide horizontal bar)
  ctx.fillStyle = "rgba(250,252,255,0.97)";
  ctx.beginPath();
  // Left side of hammer
  ctx.moveTo(28, -4);
  ctx.bezierCurveTo(30, -6, 32, -14, 34, -18);
  ctx.bezierCurveTo(36, -20, 38, -20.5, 40, -20);
  ctx.bezierCurveTo(42, -19.5, 43, -18, 43, -16);
  ctx.bezierCurveTo(43, -14, 42, -12, 40, -11);
  // Top edge of hammer (left to right)
  ctx.bezierCurveTo(38, -9, 34, -6, 30, -3);
  ctx.lineTo(30, 3);
  // Right side of hammer
  ctx.bezierCurveTo(34, 6, 38, 9, 40, 11);
  ctx.bezierCurveTo(42, 12, 43, 14, 43, 16);
  ctx.bezierCurveTo(43, 18, 42, 19.5, 40, 20);
  ctx.bezierCurveTo(38, 20.5, 36, 20, 34, 18);
  ctx.bezierCurveTo(32, 14, 30, 6, 28, 4);
  ctx.closePath();
  ctx.fill();

  // Hammer outline
  ctx.strokeStyle = "rgba(185,195,210,0.35)";
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Hammer highlight (front edge glow)
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, -18);
  ctx.bezierCurveTo(42, -17, 43, -15, 43, -14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(40, 18);
  ctx.bezierCurveTo(42, 17, 43, 15, 43, 14);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Hammer inner structure lines
  ctx.strokeStyle = "rgba(195,205,220,0.2)";
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  ctx.moveTo(30, -3);
  ctx.bezierCurveTo(33, -8, 36, -14, 38, -17);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(30, 3);
  ctx.bezierCurveTo(33, 8, 36, 14, 38, 17);
  ctx.stroke();

  // === Eyes (at the tips of the hammer) ===
  // Left eye
  ctx.fillStyle = "rgba(30,40,60,0.5)";
  ctx.beginPath();
  ctx.ellipse(40, -17, 2.2, 1.6, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(10,15,30,0.8)";
  ctx.beginPath();
  ctx.arc(40.3, -17, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(200,220,250,0.5)";
  ctx.beginPath();
  ctx.arc(40.8, -17.4, 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Right eye
  ctx.fillStyle = "rgba(30,40,60,0.5)";
  ctx.beginPath();
  ctx.ellipse(40, 17, 2.2, 1.6, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(10,15,30,0.8)";
  ctx.beginPath();
  ctx.arc(40.3, 17, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(200,220,250,0.5)";
  ctx.beginPath();
  ctx.arc(40.8, 16.6, 0.5, 0, Math.PI * 2);
  ctx.fill();

  // === Body sheen (light reflection) ===
  ctx.globalAlpha = 0.08;
  const sheenGrad = ctx.createLinearGradient(-20, -8, 20, 8);
  sheenGrad.addColorStop(0, "rgba(255,255,255,0)");
  sheenGrad.addColorStop(0.4, "rgba(255,255,255,1)");
  sheenGrad.addColorStop(0.6, "rgba(255,255,255,1)");
  sheenGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheenGrad;
  ctx.beginPath();
  ctx.ellipse(5, bw1, 28, 6, 0.1, 0, Math.PI * 2);
  ctx.fill();
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
