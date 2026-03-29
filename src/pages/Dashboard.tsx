import { Target, Eye, Star, DollarSign, Briefcase } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useFinanceiro } from "@/contexts/FinanceiroContext";
import { fetchOKRsFromSheetDB, defaultInfo } from "@/lib/sheetdb";
import EditButton from "@/components/EditButton";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ChartRenderer, type ChartConfig } from "@/pages/GenteGestaoPage";
import EmDesenvolvimento from "@/components/EmDesenvolvimento";

const valoreWords = ["Proatividade", "Resultado", "Excelência", "Dono", "Antecipação", "Dedicação", "Organização", "Rede"];

const Dashboard = () => {
  const { saldo } = useFinanceiro();
  const [pcoCharts, setPcoCharts] = useState<ChartConfig[]>([]);

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

  // Fetch PCO charts
  useEffect(() => {
    const fetchCharts = async () => {
      const { data } = await supabase.from("gente_uploads").select("*").eq("tipo", "chart").order("created_at");
      const parsed = (data || []).map((d: any) => ({ id: d.id, ...(d.metadata as any) })) as ChartConfig[];
      setPcoCharts(parsed);
    };
    fetchCharts();

    const channel = supabase.channel("pco_charts_dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "gente_uploads" }, () => fetchCharts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="space-y-8 transition-page">
      {/* Welcome Hero */}
      <div className="rounded-xl bg-card p-8 border border-border">
        <h1 className="text-3xl font-display font-bold text-foreground">Proativa Jr</h1>
        <p className="text-muted-foreground mt-1 capitalize">{today}</p>
        <p className="text-accent font-medium mt-3 italic">"Navegar é preciso. Resultados são inevitáveis."</p>
      </div>

      {/* Indicator Cards */}
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
      </div>

      {/* MVV Redesign — 2+1 layout */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
        </div>

        {/* Valores — full width pills */}
        <div className="rounded-2xl bg-card border border-border p-8 text-center relative overflow-hidden"
          style={{ background: "radial-gradient(circle at center, hsl(var(--accent) / 0.05), transparent)" }}>
          <Star className="h-8 w-8 text-accent mx-auto mb-3" />
          <p className="text-[10px] uppercase tracking-[0.12em] text-accent font-bold mb-6">Valores</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {valoreWords.map(word => (
              <span key={word} className="valores-pill px-5 py-2.5 rounded-full text-sm font-medium border">
                <span className="valores-pill-letter text-lg font-bold mr-0.5">{word[0]}</span>
                {word.slice(1)}
              </span>
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
            <span>Receita Atual</span><span>{faturamento} — {pctInterna}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${pctInterna}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Meta Externa</span><span>R$ 200.000 — {pctExterna}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent/60 rounded-full transition-all duration-700" style={{ width: `${pctExterna}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Meta Interna</span><span>R$ 260.000 — {pctInterna}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${pctInterna}%` }} />
          </div>
        </div>
      </div>

      {/* PCO Charts Section */}
      <div>
        <h2 className="text-base font-display font-semibold text-foreground mb-4">Indicadores PCO</h2>
        {pcoCharts.length === 0 ? (
          <EmDesenvolvimento title="Indicadores PCO" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            {pcoCharts.map(chart => (
              <div key={chart.id} className="rounded-xl bg-card border border-border p-4">
                <p className="text-sm font-semibold text-foreground mb-3">{chart.title}</p>
                <ChartRenderer config={chart} height={220} />
              </div>
            ))}
          </div>
        )}
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
