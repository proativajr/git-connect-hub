import { useState, useRef, useEffect, useCallback } from "react";
import { Trophy, Plus, Star, Medal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface RankMember { id: string; name: string; initials: string; points: number; }

const STORAGE_KEY = "proativa_shark_ranking";
const getStored = (): RankMember[] => { try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : defaultMembers; } catch { return defaultMembers; } };

const defaultMembers: RankMember[] = [
  { id: "1", name: "Lucas Mendes", initials: "LM", points: 1250 },
  { id: "2", name: "Ana Clara", initials: "AC", points: 1180 },
  { id: "3", name: "Pedro Oliveira", initials: "PO", points: 1050 },
  { id: "4", name: "Juliana Costa", initials: "JC", points: 920 },
  { id: "5", name: "Rafael Santos", initials: "RS", points: 870 },
  { id: "6", name: "Mariana Lima", initials: "ML", points: 740 },
];

const rankColors = ["#C9A84C", "#C0C0C0", "#CD7F32"];

// ===== SHARK MINI-GAME =====
interface Fish { x: number; y: number; vx: number; vy: number; caught: boolean; scale: number; }

type GameState = "menu" | "playing" | "end";

const sharkColors = [
  { fill: "hsl(210, 25%, 40%)", label: "Azul" },
  { fill: "hsl(220, 30%, 15%)", label: "Navy" },
  { fill: "hsl(42, 52%, 54%)", label: "Dourado" },
];

const SharkGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("menu");
  const [playerName, setPlayerName] = useState("");
  const [selectedShark, setSelectedShark] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const mouseRef = useRef({ x: 200, y: 200 });
  const fishRef = useRef<Fish[]>([]);
  const scoreRef = useRef(0);
  const timeRef = useRef(60);
  const animRef = useRef<number>(0);

  const spawnFish = useCallback((count: number, canvas: HTMLCanvasElement) => {
    const newFish: Fish[] = [];
    for (let i = 0; i < count; i++) {
      newFish.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 2,
        caught: false, scale: 1,
      });
    }
    return newFish;
  }, []);

  const startGame = () => {
    if (!playerName.trim()) return;
    scoreRef.current = 0;
    timeRef.current = 60;
    setScore(0);
    setTimeLeft(60);
    setGameState("playing");
  };

  useEffect(() => {
    if (gameState !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    fishRef.current = spawnFish(12, canvas);

    let lastSpawn = Date.now();

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
      mouseRef.current = { x: clientX - rect.left, y: clientY - rect.top };
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("touchmove", handleMove, { passive: true });

    const timer = setInterval(() => {
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) {
        setGameState("end");
        setScore(scoreRef.current);
      }
    }, 1000);

    const loop = () => {
      if (timeRef.current <= 0) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = "#050d1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Wave lines
      ctx.strokeStyle = "rgba(201,168,76,0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const y = 60 + i * 80 + Math.sin(Date.now() / 2000 + i) * 10;
        ctx.moveTo(0, y);
        for (let x = 0; x < canvas.width; x += 20) {
          ctx.lineTo(x, y + Math.sin(x / 60 + Date.now() / 1000) * 8);
        }
        ctx.stroke();
      }

      // Spawn school every 8s
      if (Date.now() - lastSpawn > 8000) {
        fishRef.current.push(...spawnFish(5, canvas));
        lastSpawn = Date.now();
      }

      // Fish
      fishRef.current = fishRef.current.filter(f => !f.caught || f.scale > 0.1);
      for (const fish of fishRef.current) {
        if (fish.caught) { fish.scale *= 0.9; }
        else {
          fish.x += fish.vx;
          fish.y += fish.vy;
          if (fish.x < 0 || fish.x > canvas.width) fish.vx *= -1;
          if (fish.y < 0 || fish.y > canvas.height) fish.vy *= -1;

          // Check catch
          const dx = mouseRef.current.x - fish.x;
          const dy = mouseRef.current.y - fish.y;
          if (Math.sqrt(dx * dx + dy * dy) < 25) {
            fish.caught = true;
            scoreRef.current += 1;
            setScore(scoreRef.current);
          }
        }

        ctx.save();
        ctx.translate(fish.x, fish.y);
        ctx.scale(fish.scale, fish.scale);
        ctx.fillStyle = "rgba(100,180,220,0.8)";
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(-14, -4);
        ctx.lineTo(-14, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Shark (player)
      const sx = mouseRef.current.x;
      const sy = mouseRef.current.y;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.fillStyle = sharkColors[selectedShark].fill;
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      // Dorsal fin
      ctx.beginPath();
      ctx.moveTo(-2, -10);
      ctx.lineTo(0, -20);
      ctx.lineTo(4, -10);
      ctx.closePath();
      ctx.fill();
      // Tail
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(-30, -8);
      ctx.lineTo(-28, 0);
      ctx.lineTo(-30, 8);
      ctx.closePath();
      ctx.fill();
      // Eye
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(12, -3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(12.5, -3, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // HUD
      ctx.fillStyle = "hsl(42,52%,54%)";
      ctx.font = "bold 14px Sora, sans-serif";
      ctx.fillText(playerName, 16, 30);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px Sora, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Peixes: ${scoreRef.current}`, canvas.width / 2, 30);
      ctx.textAlign = "right";
      ctx.fillStyle = timeRef.current <= 10 ? "#ef4444" : "#fff";
      ctx.font = "bold 20px Sora, sans-serif";
      const mins = Math.floor(timeRef.current / 60).toString().padStart(2, "0");
      const secs = (timeRef.current % 60).toString().padStart(2, "0");
      ctx.fillText(`${mins}:${secs}`, canvas.width - 16, 30);
      ctx.textAlign = "left";

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(timer);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("touchmove", handleMove);
    };
  }, [gameState, selectedShark, spawnFish, playerName]);

  if (gameState === "menu") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center space-y-6">
          <div className="text-5xl">🦈</div>
          <h2 className="text-2xl font-display font-semibold text-accent">Shark Hunter</h2>
          <div className="space-y-3 text-left">
            <label className="text-sm font-medium text-foreground block">Seu nome</label>
            <input value={playerName} onChange={e => setPlayerName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground" placeholder="Digite seu nome" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Escolha seu tubarão</label>
            <div className="flex justify-center gap-3">
              {sharkColors.map((s, i) => (
                <button key={i} onClick={() => setSelectedShark(i)}
                  className={`w-20 h-14 rounded-lg border-2 flex items-center justify-center transition-all ${selectedShark === i ? "border-accent" : "border-border"}`}>
                  <svg viewBox="0 0 60 30" className="w-14 h-8">
                    <ellipse cx="25" cy="15" rx="18" ry="8" fill={s.fill} />
                    <polygon points="7,15 0,8 2,15 0,22" fill={s.fill} />
                    <polygon points="23,7 25,0 28,7" fill={s.fill} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <button onClick={startGame} disabled={!playerName.trim()}
            className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all disabled:opacity-50">
            Iniciar Jogo
          </button>
        </div>
      </div>
    );
  }

  if (gameState === "end") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center space-y-6">
          <h2 className="text-2xl font-display font-semibold text-foreground">Fim de Jogo</h2>
          <p className="text-muted-foreground">{playerName}</p>
          <p className="text-4xl font-display font-bold text-accent">Você pescou {score} peixes</p>
          <div className="flex gap-3">
            <button onClick={startGame} className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">Jogar Novamente</button>
            <button onClick={() => setGameState("menu")} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-all">Menu Principal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <canvas ref={canvasRef} className="w-full h-[calc(100vh-120px)] rounded-xl" style={{ cursor: "none" }} />
  );
};

// ===== MAIN SHARK PAGE =====
const Shark = () => {
  const { profile } = useAuth();
  const [members, setMembers] = useState<RankMember[]>(getStored);
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [description, setDescription] = useState("");
  const [showGame, setShowGame] = useState(false);

  const sorted = [...members].sort((a, b) => b.points - a.points);
  const maxPoints = sorted[0]?.points || 1;

  const save = (next: RankMember[]) => { setMembers(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };

  const handleAddPoints = () => {
    if (!selectedMember || pointsToAdd <= 0) return;
    save(members.map(m => m.id === selectedMember ? { ...m, points: m.points + pointsToAdd } : m));
    toast({ title: "Pontuação adicionada!", duration: 2000 });
    setShowAddPoints(false);
    setSelectedMember(""); setPointsToAdd(0); setDescription("");
  };

  if (showGame) {
    return (
      <div className="space-y-4 transition-page">
        <button onClick={() => setShowGame(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Voltar ao ranking
        </button>
        <SharkGame />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 transition-page">
      {/* Shark Hero */}
      <div className="text-center space-y-4">
        <div className="relative w-80 h-52 mx-auto animate-shark-swim">
          <svg viewBox="0 0 400 200" className="w-full h-full animate-shark-wave" fill="none">
            <ellipse cx="200" cy="180" rx="120" ry="12" fill="hsl(var(--muted))" opacity="0.3" />
            <path d="M60 100 L20 70 L30 95 L20 120 L60 100Z" fill="hsl(var(--accent))" opacity="0.6" />
            <path d="M90 90 L60 95 L60 105 L90 110Z" fill="hsl(var(--accent))" opacity="0.5" />
            <path d="M320 95 C310 70 270 55 220 52 C170 50 120 60 90 80 L90 100 L320 95Z" fill="hsl(var(--accent))" opacity="0.7" />
            <path d="M320 100 L90 100 L90 115 C120 135 170 140 220 138 C270 135 310 120 320 100Z" fill="hsl(var(--accent))" opacity="0.5" />
            <path d="M220 52 L205 20 L180 55Z" fill="hsl(var(--accent))" opacity="0.8" />
            <path d="M240 115 L220 150 L200 120Z" fill="hsl(var(--accent))" opacity="0.6" />
            <path d="M320 95 C340 92 355 95 360 98 C355 102 340 105 320 100Z" fill="hsl(var(--accent))" opacity="0.7" />
            <circle cx="330" cy="88" r="5" fill="hsl(var(--background))" />
            <circle cx="331" cy="87" r="2" fill="hsl(var(--accent))" />
          </svg>
        </div>
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Shark</h1>
          <p className="text-muted-foreground mt-2">Gamificação e reconhecimento do cardume</p>
        </div>
        <button onClick={() => setShowGame(true)} className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">
          Jogar Shark Hunter
        </button>
      </div>

      {/* Add Points */}
      <div className="flex justify-end">
        <button onClick={() => setShowAddPoints(true)}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">
          <Plus className="h-4 w-4" /> Adicionar Pontuação
        </button>
      </div>

      {/* Ranking */}
      <div>
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Ranking Proativa</h2>
        <div className="space-y-3">
          {sorted.map((member, i) => {
            const isTop3 = i < 3;
            const color = isTop3 ? rankColors[i] : undefined;
            const progress = (member.points / maxPoints) * 100;
            return (
              <div key={member.id} className={`rounded-xl bg-card border border-border p-4 flex items-center gap-4 transition-all hover-lift ${isTop3 ? "ring-1" : ""}`}
                style={isTop3 ? { borderColor: color, boxShadow: `0 0 20px ${color}20` } : {}}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0" style={{ backgroundColor: isTop3 ? `${color}20` : undefined }}>
                  {i === 0 ? <Trophy className="h-5 w-5" style={{ color }} /> :
                   i === 1 ? <Medal className="h-5 w-5" style={{ color }} /> :
                   i === 2 ? <Star className="h-5 w-5" style={{ color }} /> :
                   <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>}
                </div>
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-bold shrink-0">{member.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                    <p className="text-sm font-bold text-accent ml-2">{member.points} pts</p>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: isTop3 ? color : "hsl(var(--accent))" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={showAddPoints} onOpenChange={setShowAddPoints}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Adicionar Pontuação</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Membro</Label>
              <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)} className="w-full rounded-lg bg-muted border border-border px-3 py-2 text-sm text-foreground mt-1">
                <option value="">Selecione...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div><Label>Pontos</Label><Input type="number" value={pointsToAdd} onChange={e => setPointsToAdd(Number(e.target.value))} /></div>
            <div><Label>Descrição</Label><Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Motivo da pontuação" /></div>
            <button onClick={handleAddPoints} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">Adicionar</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shark;
