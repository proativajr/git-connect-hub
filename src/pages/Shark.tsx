import { useState } from "react";
import { Trophy, Plus, Star, Medal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface RankMember {
  id: string;
  name: string;
  initials: string;
  points: number;
}

const STORAGE_KEY = "proativa_shark_ranking";

const getStored = (): RankMember[] => {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : defaultMembers;
  } catch { return defaultMembers; }
};

const defaultMembers: RankMember[] = [
  { id: "1", name: "Lucas Mendes", initials: "LM", points: 1250 },
  { id: "2", name: "Ana Clara", initials: "AC", points: 1180 },
  { id: "3", name: "Pedro Oliveira", initials: "PO", points: 1050 },
  { id: "4", name: "Juliana Costa", initials: "JC", points: 920 },
  { id: "5", name: "Rafael Santos", initials: "RS", points: 870 },
  { id: "6", name: "Mariana Lima", initials: "ML", points: 740 },
];

const rankColors = ["#F5B800", "#C0C0C0", "#CD7F32"];
const rankIcons = [Trophy, Medal, Star];

const SharkSVG = () => (
  <div className="relative w-80 h-52 mx-auto animate-shark-swim">
    <svg viewBox="0 0 400 200" className="w-full h-full animate-shark-wave" fill="none">
      {/* Shadow */}
      <ellipse cx="200" cy="180" rx="120" ry="12" fill="hsl(var(--muted))" opacity="0.3" />
      
      {/* Tail */}
      <path d="M60 100 L20 70 L30 95 L20 120 L60 100Z" fill="hsl(230 30% 40%)" />
      
      {/* Caudal peduncle */}
      <path d="M90 90 L60 95 L60 105 L90 110Z" fill="hsl(230 25% 45%)" />
      
      {/* Main body - upper */}
      <path d="M320 95 C310 70 270 55 220 52 C170 50 120 60 90 80 L90 100 L320 95Z" fill="hsl(230 25% 40%)" />
      
      {/* Main body - lower (belly) */}
      <path d="M320 100 L90 100 L90 115 C120 135 170 140 220 138 C270 135 310 120 320 100Z" fill="hsl(230 20% 55%)" />
      
      {/* Belly highlight */}
      <path d="M300 102 C290 115 250 125 200 128 C160 130 130 125 110 118 L110 105 L300 102Z" fill="hsl(230 20% 65%)" opacity="0.6" />
      
      {/* Dorsal fin */}
      <path d="M220 52 L205 20 L180 55Z" fill="hsl(230 30% 35%)" />
      
      {/* Second dorsal */}
      <path d="M140 65 L132 45 L120 68Z" fill="hsl(230 30% 35%)" />
      
      {/* Pectoral fin */}
      <path d="M240 115 L220 150 L200 120Z" fill="hsl(230 25% 40%)" />
      
      {/* Pelvic fin */}
      <path d="M150 112 L140 135 L130 112Z" fill="hsl(230 25% 40%)" />
      
      {/* Head/snout */}
      <path d="M320 95 C340 92 355 95 360 98 C355 102 340 105 320 100Z" fill="hsl(230 25% 40%)" />
      
      {/* Gill slits */}
      <line x1="280" y1="82" x2="278" y2="108" stroke="hsl(230 30% 30%)" strokeWidth="1.5" opacity="0.5" />
      <line x1="270" y1="80" x2="268" y2="110" stroke="hsl(230 30% 30%)" strokeWidth="1.5" opacity="0.5" />
      <line x1="260" y1="78" x2="258" y2="112" stroke="hsl(230 30% 30%)" strokeWidth="1.5" opacity="0.5" />
      
      {/* Eye */}
      <circle cx="330" cy="88" r="5" fill="hsl(230 40% 20%)" />
      <circle cx="331" cy="87" r="2" fill="hsl(230 20% 70%)" />
      
      {/* Body contour */}
      <path d="M355 93 C310 68 270 55 220 52 C170 50 120 60 90 80" stroke="hsl(230 30% 30%)" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M355 103 C310 125 270 135 220 138 C170 140 120 135 90 115" stroke="hsl(230 30% 30%)" strokeWidth="1" fill="none" opacity="0.4" />
    </svg>
  </div>
);

const Shark = () => {
  const { profile } = useAuth();
  const [members, setMembers] = useState<RankMember[]>(getStored);
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [description, setDescription] = useState("");

  const sorted = [...members].sort((a, b) => b.points - a.points);
  const maxPoints = sorted[0]?.points || 1;

  const save = (next: RankMember[]) => {
    setMembers(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleAddPoints = () => {
    if (!selectedMember || pointsToAdd <= 0) return;
    const next = members.map(m => m.id === selectedMember ? { ...m, points: m.points + pointsToAdd } : m);
    save(next);
    toast({ title: "Pontuação adicionada!", duration: 2000 });
    setShowAddPoints(false);
    setSelectedMember("");
    setPointsToAdd(0);
    setDescription("");
  };

  // Find user in ranking
  const userName = profile?.full_name || "";
  const userRank = sorted.findIndex(m => m.name === userName);

  return (
    <div className="fixed inset-0 left-[var(--sidebar-width,280px)] bg-background overflow-y-auto">
      <div className="max-w-4xl mx-auto py-12 px-8 space-y-10">
        {/* Shark Hero */}
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-3xl" />
            <div className="pt-8 pb-4">
              <SharkSVG />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground">Shark 🦈</h1>
            <p className="text-muted-foreground mt-2">Gamificação e reconhecimento do cardume</p>
          </div>
        </div>

        {/* My Points Card */}
        {userRank >= 0 && (
          <div className="rounded-xl bg-primary p-6 text-center">
            <p className="text-sm text-primary-foreground/70">Meus Pontos</p>
            <p className="text-4xl font-display font-bold text-primary-foreground mt-1">{sorted[userRank].points}</p>
            <p className="text-sm text-primary-foreground/70 mt-1">Posição #{userRank + 1}</p>
          </div>
        )}

        {/* Add Points Button */}
        <div className="flex justify-end">
          <button onClick={() => setShowAddPoints(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition-all">
            <Plus className="h-4 w-4" /> Adicionar Pontuação
          </button>
        </div>

        {/* Ranking Leaderboard */}
        <div>
          <h2 className="text-xl font-display font-bold text-foreground mb-4">Ranking Proativa 🦈</h2>
          <div className="space-y-3">
            {sorted.map((member, i) => {
              const isTop3 = i < 3;
              const RankIcon = isTop3 ? rankIcons[i] : Star;
              const color = isTop3 ? rankColors[i] : undefined;
              const progress = (member.points / maxPoints) * 100;

              return (
                <div
                  key={member.id}
                  className={`rounded-xl bg-card border border-border p-4 flex items-center gap-4 transition-all hover-lift ${
                    isTop3 ? "ring-1" : ""
                  }`}
                  style={isTop3 ? { borderColor: color, boxShadow: `0 0 20px ${color}20` } : {}}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0" style={{ backgroundColor: isTop3 ? `${color}20` : undefined }}>
                    {isTop3 ? (
                      <RankIcon className="h-5 w-5" style={{ color }} />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-bold shrink-0">
                    {member.initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                      <p className="text-sm font-bold text-primary ml-2">{member.points} pts</p>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: isTop3 ? color : "hsl(var(--primary))" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Points Dialog */}
      <Dialog open={showAddPoints} onOpenChange={setShowAddPoints}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Adicionar Pontuação</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Membro</Label>
              <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)}
                className="w-full rounded-lg bg-muted border border-border px-3 py-2 text-sm text-foreground mt-1">
                <option value="">Selecione...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div><Label>Pontos</Label><Input type="number" value={pointsToAdd} onChange={e => setPointsToAdd(Number(e.target.value))} /></div>
            <div><Label>Descrição</Label><Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Motivo da pontuação" /></div>
            <button onClick={handleAddPoints} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition-all">Adicionar</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shark;
