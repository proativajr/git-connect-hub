import { Target, Eye, Star, DollarSign, Briefcase, FileText, ClipboardList } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFinanceiro } from "@/contexts/FinanceiroContext";
import { useGente } from "@/contexts/GenteContext";
import { fetchOKRsFromSheetDB, defaultInfo } from "@/lib/sheetdb";
import EditButton from "@/components/EditButton";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const predadorValues = [
  { letter: "P", word: "Proatividade", meaning: "agir antes que seja necessário" },
  { letter: "R", word: "Resultado", meaning: "foco em entregas de alto impacto" },
  { letter: "E", word: "Excelência", meaning: "qualidade em tudo que fazemos" },
  { letter: "D", word: "Dono", meaning: "senso de responsabilidade total" },
  { letter: "A", word: "Antecipação", meaning: "prever e se preparar para o futuro" },
  { letter: "D", word: "Dedicação", meaning: "comprometimento total com a causa" },
  { letter: "O", word: "Organização", meaning: "processos claros e estruturados" },
  { letter: "R", word: "Rede", meaning: "construção de relacionamentos estratégicos" },
];

// PCO chart mock data
const pcoStatusData = [
  { name: "Concluído", value: 42 },
  { name: "Em andamento", value: 35 },
  { name: "Atrasado", value: 23 },
];
const pcoStatusColors = ["#16a34a", "#f5c400", "#dc2626"];

const pcoDiretoriaData = [
  { name: "Projetos", value: 38 },
  { name: "Comercial", value: 28 },
  { name: "VP", value: 20 },
  { name: "Presidência", value: 14 },
];
const pcoDiretoriaColors = ["#021f3f", "#2b3f65", "#f5c400", "#c9a84c"];

const pcoMonthlyData = [
  { month: "Out", count: 12 },
  { month: "Nov", count: 18 },
  { month: "Dez", count: 15 },
  { month: "Jan", count: 22 },
  { month: "Fev", count: 28 },
  { month: "Mar", count: 35 },
];

const Dashboard = () => {
  const { saldo } = useFinanceiro();
  const { pdiCount, pcoCount } = useGente();

  const { data: okrData } = useQuery({
    queryKey: ["sheetdb_okrs"],
    queryFn: fetchOKRsFromSheetDB,
    staleTime: 5 * 60 * 1000,
  });

  const info = okrData?.info ?? defaultInfo;
  const faturamento = info.faturamento;
  const parsedFaturamento = parseFloat((faturamento || "0").replace(/[R$\s.]/g, "").replace(",", ".")) || 0;

  const [editRevenue, setEditRevenue] = useState(false);
  const [tmpGoal, setTmpGoal] = useState(0);
  const [tmpCurrent, setTmpCurrent] = useState(0);

  const metaExterna = 200000;
  const metaInterna = 260000;
  const pctExterna = Math.min(100, Math.round((parsedFaturamento / metaExterna) * 100));
  const pctInterna = Math.min(100, Math.round((parsedFaturamento / metaInterna) * 100));

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-8 transition-page">
      {/* Welcome Hero */}
      <div className="rounded-xl bg-card p-8 border border-border">
        <h1 className="text-3xl font-display font-bold text-foreground">Proativa Jr</h1>
        <p className="text-muted-foreground mt-1 capitalize">{today}</p>
        <p className="text-accent font-medium mt-3 italic">"Navegar é preciso. Resultados são inevitáveis."</p>
      </div>

      {/* Indicator Cards - 2x2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-card border border-border p-5">
          <Briefcase className="h-5 w-5 text-accent/70 mb-2" />
          <p className="text-metric font-display text-accent">{info.numProjetos}</p>
          <p className="text-sm text-muted-foreground">Projetos ativos</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <DollarSign className="h-5 w-5 text-accent/70 mb-2" />
          <p className={`text-metric font-display ${saldo >= 0 ? "text-success" : "text-destructive"}`}>{fmt(saldo)}</p>
          <p className="text-sm text-muted-foreground">Saldo atual</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <ClipboardList className="h-5 w-5 text-accent/70 mb-2" />
          <p className="text-metric font-display text-accent">{pcoCount}</p>
          <p className="text-sm text-muted-foreground">PCOs registrados</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <FileText className="h-5 w-5 text-accent/70 mb-2" />
          <p className="text-metric font-display text-accent">{pdiCount}</p>
          <p className="text-sm text-muted-foreground">PDIs registrados</p>
        </div>
      </div>

      {/* MVV Redesign — 3 identical spotlight cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Missão */}
        <div className="rounded-2xl bg-card border border-border p-8 text-center relative overflow-hidden"
          style={{ background: "radial-gradient(circle at center, hsl(var(--accent) / 0.05), transparent)" }}>
          <Target className="h-8 w-8 text-accent mx-auto mb-3" />
          <p className="text-[10px] uppercase tracking-[0.12em] text-accent font-bold mb-4">Missão</p>
          <p className="text-base font-light italic text-foreground leading-relaxed">
            Formar líderes, por meio da vivência empresarial, realizando projetos de alto impacto.
          </p>
        </div>

        {/* Visão */}
        <div className="rounded-2xl bg-card border border-border p-8 text-center relative overflow-hidden"
          style={{ background: "radial-gradient(circle at center, hsl(var(--accent) / 0.05), transparent)" }}>
          <Eye className="h-8 w-8 text-accent mx-auto mb-3" />
          <p className="text-[10px] uppercase tracking-[0.12em] text-accent font-bold mb-4">Visão</p>
          <p className="text-base font-light italic text-foreground leading-relaxed">
            Alcançar maturidade de gestão e fortalecer nossa imagem no ecossistema em 2026, operando com processos estruturados e pessoas proativas que garantam resultados agressivos.
          </p>
        </div>

        {/* Valores — PREDADOR expanded */}
        <div className="rounded-2xl bg-card border border-border p-8 text-center relative overflow-hidden"
          style={{ background: "radial-gradient(circle at center, hsl(var(--accent) / 0.05), transparent)" }}>
          <Star className="h-8 w-8 text-accent mx-auto mb-3" />
          <p className="text-[10px] uppercase tracking-[0.12em] text-accent font-bold mb-4">Valores</p>
          <div className="space-y-0 text-left">
            {predadorValues.map((v, i) => (
              <div key={i} className={`flex items-baseline gap-3 py-1.5 ${i < predadorValues.length - 1 ? "border-b border-border" : ""}`}>
                <span className="text-lg font-bold text-accent w-6 shrink-0">{v.letter}</span>
                <span className="text-sm font-semibold text-foreground">{v.word}</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">— {v.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Bars */}
      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-display font-semibold text-foreground">Receita Anual</h2>
          </div>
          <EditButton label="Editar" onClick={() => { setTmpGoal(metaInterna); setTmpCurrent(parsedFaturamento); setEditRevenue(true); }} />
        </div>

        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Receita Atual</span>
            <span>{faturamento} — {pctInterna}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${pctInterna}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Meta Externa</span>
            <span>R$ 200.000 — {pctExterna}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent/60 rounded-full transition-all duration-700" style={{ width: `${pctExterna}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Meta Interna</span>
            <span>R$ 260.000 — {pctInterna}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${pctInterna}%` }} />
          </div>
        </div>
      </div>

      {/* PCO Charts Section */}
      <div>
        <h2 className="text-base font-display font-semibold text-foreground mb-4">Indicadores de PCO</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Status Distribution */}
          <div className="rounded-xl bg-card border border-border p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Distribuição por Status</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pcoStatusData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {pcoStatusData.map((_, i) => <Cell key={i} fill={pcoStatusColors[i]} />)}
                </Pie>
                <Legend fontSize={11} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Diretoria Distribution */}
          <div className="rounded-xl bg-card border border-border p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Distribuição por Diretoria</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pcoDiretoriaData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {pcoDiretoriaData.map((_, i) => <Cell key={i} fill={pcoDiretoriaColors[i]} />)}
                </Pie>
                <Legend fontSize={11} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Evolution */}
          <div className="rounded-xl bg-card border border-border p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Evolução Mensal</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={pcoMonthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#f5c400" fill="#f5c400" fillOpacity={0.4} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <Dialog open={editRevenue} onOpenChange={setEditRevenue}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Editar Receita Anual</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Valor Atual (R$)</Label><Input type="number" value={tmpCurrent} onChange={e => setTmpCurrent(Number(e.target.value))} /></div>
            <div><Label>Meta (R$)</Label><Input type="number" value={tmpGoal} onChange={e => setTmpGoal(Number(e.target.value))} /></div>
            <button onClick={() => setEditRevenue(false)} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">Salvar</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
