import { useState } from "react";
import { Upload, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  goal: string;
  responsible: string;
  deadline: string;
  status: "Em andamento" | "Concluída" | "Atrasada";
}

const STORAGE_KEY = "proativa_gente_gestao";

const getStored = (): Goal[] => {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : defaultGoals;
  } catch { return defaultGoals; }
};

const defaultGoals: Goal[] = [
  { id: "1", goal: "Implementar PDI para todos os membros", responsible: "João Silva", deadline: "2026-06-30", status: "Em andamento" },
  { id: "2", goal: "Realizar pesquisa de clima organizacional", responsible: "Maria Santos", deadline: "2026-04-15", status: "Concluída" },
  { id: "3", goal: "Organizar treinamento de liderança", responsible: "Pedro Costa", deadline: "2026-03-20", status: "Atrasada" },
];

const statusColors: Record<string, string> = {
  "Em andamento": "bg-primary/20 text-primary",
  "Concluída": "bg-success/20 text-success",
  "Atrasada": "bg-destructive/20 text-destructive",
};

const statusProgress: Record<string, number> = {
  "Em andamento": 50,
  "Concluída": 100,
  "Atrasada": 30,
};

const GenteGestaoPage = () => {
  const [goals, setGoals] = useState<Goal[]>(getStored);

  const save = (next: Goal[]) => {
    setGoals(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    toast({ title: "Alterações salvas", duration: 2000 });
  };

  const addGoal = () => {
    save([...goals, { id: crypto.randomUUID(), goal: "", responsible: "", deadline: "", status: "Em andamento" }]);
  };

  const updateGoal = (id: string, field: keyof Goal, value: string) => {
    save(goals.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const removeGoal = (id: string) => {
    save(goals.filter(g => g.id !== id));
  };

  return (
    <div className="space-y-6 transition-page">
      <div>
        <h1 className="text-page-title font-display text-foreground">Gente e Gestão</h1>
        <p className="text-sm text-muted-foreground">PDI, PCO e metas de desenvolvimento</p>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Upload PDI", desc: "Plano de Desenvolvimento Individual" },
          { label: "Upload PCO", desc: "Pesquisa de Clima Organizacional" },
        ].map(item => (
          <button key={item.label} className="flex items-center gap-3 rounded-xl border-2 border-dashed border-primary/40 bg-card p-6 hover:border-primary hover:bg-muted/30 transition-all group">
            <Upload className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Drag & Drop Area */}
      <div className="rounded-xl border-2 border-dashed border-border bg-card/50 p-10 text-center">
        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Arraste e solte arquivos PDF aqui</p>
        <p className="text-xs text-muted-foreground mt-1">ou clique nos botões acima para upload</p>
      </div>

      {/* Goals Table */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold text-foreground">Metas de Desenvolvimento</h2>
        <button onClick={addGoal} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition-all">
          <Plus className="h-4 w-4" /> Nova Meta
        </button>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Meta", "Responsável", "Prazo", "Status", "Progresso", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {goals.map((g) => (
              <tr key={g.id} className={`border-b border-border/50 transition-colors ${
                g.status === "Atrasada" ? "bg-destructive/5" : g.status === "Concluída" ? "bg-success/5" : ""
              }`}>
                <td className="px-5 py-3">
                  <input value={g.goal} onChange={e => updateGoal(g.id, "goal", e.target.value)}
                    className="bg-transparent text-sm text-foreground w-full outline-none focus:border-b focus:border-primary transition-all" />
                </td>
                <td className="px-5 py-3">
                  <input value={g.responsible} onChange={e => updateGoal(g.id, "responsible", e.target.value)}
                    className="bg-transparent text-sm text-muted-foreground w-full outline-none focus:border-b focus:border-primary transition-all" />
                </td>
                <td className="px-5 py-3">
                  <input type="date" value={g.deadline} onChange={e => updateGoal(g.id, "deadline", e.target.value)}
                    className="bg-transparent text-sm text-muted-foreground outline-none focus:border-b focus:border-primary transition-all" />
                </td>
                <td className="px-5 py-3">
                  <select value={g.status} onChange={e => updateGoal(g.id, "status", e.target.value)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${statusColors[g.status]}`}>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Atrasada">Atrasada</option>
                  </select>
                </td>
                <td className="px-5 py-3">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${
                      g.status === "Concluída" ? "bg-success" : g.status === "Atrasada" ? "bg-destructive" : "bg-primary"
                    }`} style={{ width: `${statusProgress[g.status]}%` }} />
                  </div>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => removeGoal(g.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GenteGestaoPage;
