import { useEffect, useRef, useCallback } from "react";

interface Shark {
  x: number;
  y: number;
  baseY: number;
  speed: number;
  size: number;
  opacity: number;
  depth: number;
  wobbleOffset: number;
  wobbleSpeed: number;
  tailPhase: number;
  vx: number;
  vy: number;
  targetVx: number;
  fleeTimer: number;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
}

interface LightRay {
  x: number;
  width: number;
  opacity: number;
  speed: number;
  angle: number;
}

const SHARK_COUNT = 8;
const BUBBLE_COUNT = 25;
const RAY_COUNT = 5;

const OceanBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const scrollRef = useRef(0);
  const sharksRef = useRef<Shark[]>([]);
  const bubblesRef = useRef<Bubble[]>([]);
  const raysRef = useRef<LightRay[]>([]);
  const timeRef = useRef(0);

  const initSharks = useCallback((w: number, h: number) => {
    const sharks: Shark[] = [];
    for (let i = 0; i < SHARK_COUNT; i++) {
      const depth = 0.3 + Math.random() * 0.7;
      sharks.push({
        x: Math.random() * w * 1.5 - w * 0.25,
        y: h * 0.2 + Math.random() * h * 0.6,
        baseY: h * 0.2 + Math.random() * h * 0.6,
        speed: (0.3 + Math.random() * 0.5) * depth,
        size: (30 + Math.random() * 25) * depth,
        opacity: 0.15 + depth * 0.35,
        depth,
        wobbleOffset: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.5 + Math.random() * 0.5,
        tailPhase: Math.random() * Math.PI * 2,
        vx: 0,
        vy: 0,
        targetVx: 0,
        fleeTimer: 0,
      });
    }
    sharks.sort((a, b) => a.depth - b.depth);
    return sharks;
  }, []);

  const initBubbles = useCallback((w: number, h: number) => {
    const bubbles: Bubble[] = [];
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      bubbles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 1 + Math.random() * 3,
        speed: 0.2 + Math.random() * 0.5,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.5 + Math.random() * 1.5,
        opacity: 0.1 + Math.random() * 0.2,
      });
    }
    return bubbles;
  }, []);

  const initRays = useCallback((w: number) => {
    const rays: LightRay[] = [];
    for (let i = 0; i < RAY_COUNT; i++) {
      rays.push({
        x: Math.random() * w,
        width: 40 + Math.random() * 80,
        opacity: 0.02 + Math.random() * 0.04,
        speed: 0.1 + Math.random() * 0.2,
        angle: -0.15 + Math.random() * 0.3,
      });
    }
    return rays;
  }, []);

  const drawShark = (
    ctx: CanvasRenderingContext2D,
    shark: Shark,
    time: number
  ) => {
    const { x, y, size, opacity, tailPhase } = shark;
    const tailSwing = Math.sin(time * 2.5 + tailPhase) * size * 0.15;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(x, y);

    // Body gradient
    const grad = ctx.createLinearGradient(-size, -size * 0.15, size, size * 0.15);
    grad.addColorStop(0, "rgba(20, 40, 70, 0.9)");
    grad.addColorStop(0.5, "rgba(30, 55, 90, 0.8)");
    grad.addColorStop(1, "rgba(15, 30, 55, 0.7)");

    ctx.fillStyle = grad;
    ctx.beginPath();

    // Streamlined shark body using bezier curves
    // Nose
    ctx.moveTo(size * 0.8, 0);
    // Top body
    ctx.bezierCurveTo(
      size * 0.6, -size * 0.18,
      size * 0.2, -size * 0.22,
      0, -size * 0.18
    );
    // Dorsal fin
    ctx.lineTo(-size * 0.05, -size * 0.45);
    ctx.lineTo(-size * 0.25, -size * 0.15);
    // Back top
    ctx.bezierCurveTo(
      -size * 0.4, -size * 0.12,
      -size * 0.6, -size * 0.08,
      -size * 0.7, 0
    );
    // Tail
    ctx.lineTo(-size * 0.85 + tailSwing, -size * 0.25);
    ctx.lineTo(-size * 0.75 + tailSwing * 0.5, 0);
    ctx.lineTo(-size * 0.85 + tailSwing, size * 0.2);
    ctx.lineTo(-size * 0.7, size * 0.02);
    // Bottom body
    ctx.bezierCurveTo(
      -size * 0.5, size * 0.1,
      -size * 0.2, size * 0.15,
      0, size * 0.12
    );
    // Pectoral fin
    ctx.lineTo(size * 0.15, size * 0.3);
    ctx.lineTo(size * 0.3, size * 0.1);
    // Belly to nose
    ctx.bezierCurveTo(
      size * 0.5, size * 0.1,
      size * 0.7, size * 0.05,
      size * 0.8, 0
    );

    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = `rgba(180, 210, 240, ${opacity * 0.8})`;
    ctx.beginPath();
    ctx.arc(size * 0.55, -size * 0.06, size * 0.03, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawBubble = (
    ctx: CanvasRenderingContext2D,
    bubble: Bubble,
    time: number
  ) => {
    const wx = Math.sin(time * bubble.wobbleSpeed + bubble.wobble) * 3;
    ctx.save();
    ctx.globalAlpha = bubble.opacity;
    ctx.strokeStyle = "rgba(150, 200, 255, 0.4)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(bubble.x + wx, bubble.y, bubble.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Highlight
    ctx.fillStyle = "rgba(200, 230, 255, 0.15)";
    ctx.beginPath();
    ctx.arc(
      bubble.x + wx - bubble.radius * 0.3,
      bubble.y - bubble.radius * 0.3,
      bubble.radius * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  };

  const drawRay = (
    ctx: CanvasRenderingContext2D,
    ray: LightRay,
    h: number
  ) => {
    ctx.save();
    ctx.globalAlpha = ray.opacity;
    const grad = ctx.createLinearGradient(ray.x, 0, ray.x, h);
    grad.addColorStop(0, "rgba(150, 210, 255, 0.3)");
    grad.addColorStop(0.4, "rgba(100, 180, 240, 0.1)");
    grad.addColorStop(1, "rgba(50, 100, 180, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(ray.x - ray.width * 0.3, 0);
    ctx.lineTo(ray.x + ray.width * 0.3, 0);
    ctx.lineTo(ray.x + ray.width + ray.angle * h, h);
    ctx.lineTo(ray.x - ray.width * 0.5 + ray.angle * h, h);
    ctx.closePath();
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
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);

      const w = window.innerWidth;
      const h = window.innerHeight;
      sharksRef.current = initSharks(w, h);
      bubblesRef.current = initBubbles(w, h);
      raysRef.current = initRays(w);
    };

    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll);

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      timeRef.current += 0.016;
      const time = timeRef.current;

      // Deep ocean gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, "#0a1628");
      bgGrad.addColorStop(0.3, "#0d1f3c");
      bgGrad.addColorStop(0.6, "#091428");
      bgGrad.addColorStop(1, "#050d1a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Light rays
      raysRef.current.forEach((ray) => {
        drawRay(ctx, ray, h);
        ray.x += ray.speed;
        if (ray.x > w + ray.width) ray.x = -ray.width;
      });

      // Bubbles
      bubblesRef.current.forEach((bubble) => {
        drawBubble(ctx, bubble, time);
        bubble.y -= bubble.speed;
        if (bubble.y < -10) {
          bubble.y = h + 10;
          bubble.x = Math.random() * w;
        }
      });

      // Sharks with cursor interaction
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const scrollOffset = Math.sin(scrollRef.current * 0.005) * 15;

      sharksRef.current.forEach((shark) => {
        // Distance to cursor
        const dx = shark.x - mx;
        const dy = shark.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const fleeRadius = 180;

        if (dist < fleeRadius) {
          const force = (1 - dist / fleeRadius) * 3;
          shark.targetVx = (dx / dist) * force;
          shark.vy += (dy / dist) * force * 0.3;
          shark.fleeTimer = 60;
        }

        if (shark.fleeTimer > 0) {
          shark.fleeTimer--;
        } else {
          shark.targetVx *= 0.95;
        }

        shark.vx += (shark.targetVx - shark.vx) * 0.05;
        shark.vy *= 0.95;

        // Wobble + scroll
        const wobble =
          Math.sin(time * shark.wobbleSpeed + shark.wobbleOffset) * 8 * shark.depth;

        shark.x += shark.speed + shark.vx;
        shark.y =
          shark.baseY +
          wobble +
          scrollOffset * shark.depth +
          shark.vy;

        // Wrap
        if (shark.x > w + shark.size * 2) {
          shark.x = -shark.size * 2;
          shark.baseY = h * 0.2 + Math.random() * h * 0.6;
        }

        drawShark(ctx, shark, time);
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [initSharks, initBubbles, initRays]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ pointerEvents: "all" }}
    />
  );
};

export default OceanBackground;
