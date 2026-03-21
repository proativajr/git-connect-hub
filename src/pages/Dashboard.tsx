import { useState } from "react";
import { Briefcase, DollarSign, Star, CheckCircle2, X, Loader2, Target, Eye, Award } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import EditButton from "@/components/EditButton";
import { fetchOKRsFromSheetDB, defaultInfo } from "@/lib/sheetdb";

const kpiIcons = [Briefcase, DollarSign, Star];

const Dashboard = () => {
  const queryClient = useQueryClient();

  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboard_metrics"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("dashboard_metrics").select("*").limit(1).single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch OKR data from SheetDB (for faturamento sync)
  const { data: okrData } = useQuery({
    queryKey: ["sheetdb_okrs"],
    queryFn: fetchOKRsFromSheetDB,
    staleTime: 5 * 60 * 1000,
  });

  const faturamento = okrData?.info?.faturamento ?? defaultInfo.faturamento;

  // Fetch priorities
  const { data: priorities = [] } = useQuery({
    queryKey: ["quarterly_priorities"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("quarterly_priorities").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Mutations
  const updateMetrics = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      if (!metrics) return;
      const { error } = await supabase.from("dashboard_metrics").update(updates).eq("id", metrics.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["dashboard_metrics"] }); toast({ title: "Salvo!" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updatePriority = useMutation({
    mutationFn: async (items: { id: string; title: string }[]) => {
      // Delete removed, upsert existing
      const currentIds = items.map(i => i.id).filter(Boolean);
      if (priorities.length > 0) {
        const toDelete = priorities.filter((p: any) => !currentIds.includes(p.id));
        for (const d of toDelete) {
          await supabase.from("quarterly_priorities").delete().eq("id", d.id);
        }
      }
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id) {
          await supabase.from("quarterly_priorities").update({ title: item.title, sort_order: i }).eq("id", item.id);
        } else {
          await supabase.from("quarterly_priorities").insert({ title: item.title, sort_order: i });
        }
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["quarterly_priorities"] }); toast({ title: "Prioridades salvas!" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  // UI state
  const [editRevenue, setEditRevenue] = useState(false);
  const [editKpiIdx, setEditKpiIdx] = useState<number | null>(null);
  const [editPriorities, setEditPriorities] = useState(false);
  const [tmpGoal, setTmpGoal] = useState(0);
  const [tmpCurrent, setTmpCurrent] = useState(0);
  const [tmpKpiValue, setTmpKpiValue] = useState("");
  const [tmpKpiSub, setTmpKpiSub] = useState("");
  const [tmpPriorities, setTmpPriorities] = useState<{ id: string; title: string }[]>([]);

  if (metricsLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!metrics) return <p className="text-muted-foreground">Sem dados disponíveis.</p>;

  // Parse faturamento from SheetDB (e.g. "R$ 50.000,00" -> 50000)
  const parsedFaturamento = parseFloat(faturamento.replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
  const revenueCurrent = parsedFaturamento;
  const revenueGoal = 260000;
  const revenuePercent = revenueGoal > 0 ? Math.round((revenueCurrent / revenueGoal) * 100) : 0;
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const kpis = [
    { label: "Projetos Ativos", value: String(metrics.active_projects), sub: metrics.active_projects_sub, icon: Briefcase },
    { label: "Faturamento YTD", value: metrics.ytd_revenue, sub: metrics.ytd_revenue_sub, icon: DollarSign },
    { label: "NPS Global", value: String(metrics.global_nps), sub: metrics.global_nps_sub, icon: Star },
  ];

  const kpiFields: Record<number, { valueKey: string; subKey: string }> = {
    0: { valueKey: "active_projects", subKey: "active_projects_sub" },
    1: { valueKey: "ytd_revenue", subKey: "ytd_revenue_sub" },
    2: { valueKey: "global_nps", subKey: "global_nps_sub" },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground mt-1 capitalize">{today}</p>
      </div>

      {/* Missão, Visão, Valores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Missão", text: "Formar líderes, por meio da vivência empresarial, realizando projetos de alto impacto.", icon: Target },
          { title: "Visão", text: "Alcançar maturidade de gestão e fortalecer nossa imagem no ecossistema em 2026, operando com processos estruturados e pessoas proativas que garantam resultados agressivos em faturamento, qualidade de projetos e desenvolvimento dos membros", icon: Eye },
          { title: "Valores", text: "PREDADOR\nProatividade, Resultado, Excelência, Dono, Antecipação, Dedicação, Organização e Rede", icon: Award },
        ].map((box) => (
          <div key={box.title} className="rounded-lg bg-primary border-l-4 border-accent p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <box.icon className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-bold text-primary-foreground">{box.title}</h3>
            </div>
            <p className="text-primary-foreground/90 text-sm leading-relaxed whitespace-pre-line">{box.text}</p>
          </div>
        ))}
      </div>

      {/* Revenue Thermometer */}
      <div className="rounded-xl bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-card-foreground">Receita Anual</h2>
          </div>
          <EditButton label="Editar" onClick={() => { setTmpGoal(revenueGoal); setTmpCurrent(Number(metrics.revenue_current)); setEditRevenue(true); }} />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{faturamento}</span>
          <span>Meta Interna: R$ 260.000,00</span>
        </div>
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${revenuePercent}%` }} />
        </div>
        <p className="text-right text-sm font-semibold text-accent mt-2">{revenuePercent}% atingido</p>

        <div className="flex justify-between text-sm text-muted-foreground mb-2 mt-4">
          <span>{faturamento}</span>
          <span>Meta Externa: R$ 200.000,00</span>
        </div>
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent/70 rounded-full transition-all duration-700" style={{ width: `${revenueGoal > 0 ? Math.round((revenueCurrent / 200000) * 100) : 0}%` }} />
        </div>
        <p className="text-right text-sm font-semibold text-accent/70 mt-2">{revenueGoal > 0 ? Math.round((revenueCurrent / 200000) * 100) : 0}% atingido</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className="rounded-xl bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 relative">
            <EditButton onClick={() => { setTmpKpiValue(kpi.value); setTmpKpiSub(kpi.sub); setEditKpiIdx(i); }} className="absolute top-3 right-3" />
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-accent/10 p-3"><kpi.icon className="h-6 w-6 text-accent" /></div>
              <div>
                <p className="text-3xl font-bold text-card-foreground">{kpi.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{kpi.label}</p>
                <p className="text-xs font-medium text-accent mt-1">{kpi.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vision Board */}
      <div className="rounded-xl bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground">Prioridades do Trimestre</h2>
          <EditButton label="Editar Prioridades" onClick={() => { setTmpPriorities(priorities.map((p: any) => ({ id: p.id, title: p.title }))); setEditPriorities(true); }} />
        </div>
        <ul className="space-y-3">
          {priorities.map((p: any) => (
            <li key={p.id} className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
              <span className="text-sm text-card-foreground">{p.title}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit Revenue Dialog */}
      <Dialog open={editRevenue} onOpenChange={setEditRevenue}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Receita Anual</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Valor Atual (R$)</Label><Input type="number" value={tmpCurrent} onChange={e => setTmpCurrent(Number(e.target.value))} /></div>
            <div><Label>Meta (R$)</Label><Input type="number" value={tmpGoal} onChange={e => setTmpGoal(Number(e.target.value))} /></div>
            <button onClick={() => { updateMetrics.mutate({ revenue_current: tmpCurrent, revenue_goal: tmpGoal }); setEditRevenue(false); }} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">Salvar</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit KPI Dialog */}
      <Dialog open={editKpiIdx !== null} onOpenChange={() => setEditKpiIdx(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar KPI</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Valor</Label><Input value={tmpKpiValue} onChange={e => setTmpKpiValue(e.target.value)} /></div>
            <div><Label>Subtítulo</Label><Input value={tmpKpiSub} onChange={e => setTmpKpiSub(e.target.value)} /></div>
            <button onClick={() => {
              if (editKpiIdx !== null) {
                const f = kpiFields[editKpiIdx];
                const val = editKpiIdx === 0 ? Number(tmpKpiValue) : editKpiIdx === 2 ? Number(tmpKpiValue) : tmpKpiValue;
                updateMetrics.mutate({ [f.valueKey]: val, [f.subKey]: tmpKpiSub });
                setEditKpiIdx(null);
              }
            }} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">Salvar</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Priorities Dialog */}
      <Dialog open={editPriorities} onOpenChange={setEditPriorities}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Prioridades</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2 max-h-[60vh] overflow-y-auto">
            {tmpPriorities.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={p.title} onChange={e => { const u = [...tmpPriorities]; u[i] = { ...u[i], title: e.target.value }; setTmpPriorities(u); }} />
                <button onClick={() => setTmpPriorities(tmpPriorities.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
              </div>
            ))}
            <button onClick={() => setTmpPriorities([...tmpPriorities, { id: "", title: "" }])} className="text-sm text-accent font-medium">+ Adicionar</button>
          </div>
          <button onClick={() => { updatePriority.mutate(tmpPriorities.filter(p => p.title.trim())); setEditPriorities(false); }} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all mt-2">Salvar</button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
