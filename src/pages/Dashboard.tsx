import { useState } from "react";
import { Briefcase, DollarSign, Star, CheckCircle2, Quote, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import EditButton from "@/components/EditButton";

const kpiIcons = [Briefcase, DollarSign, Star];

const Dashboard = () => {
  const queryClient = useQueryClient();

  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboard_metrics"],
    queryFn: async () => {
      const { data, error } = await supabase.from("dashboard_metrics").select("*").limit(1).single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch priorities
  const { data: priorities = [] } = useQuery({
    queryKey: ["quarterly_priorities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quarterly_priorities").select("*").order("sort_order");
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
  const [editQuote, setEditQuote] = useState(false);
  const [editRevenue, setEditRevenue] = useState(false);
  const [editKpiIdx, setEditKpiIdx] = useState<number | null>(null);
  const [editPriorities, setEditPriorities] = useState(false);
  const [tmpQuote, setTmpQuote] = useState("");
  const [tmpAuthor, setTmpAuthor] = useState("");
  const [tmpGoal, setTmpGoal] = useState(0);
  const [tmpCurrent, setTmpCurrent] = useState(0);
  const [tmpKpiValue, setTmpKpiValue] = useState("");
  const [tmpKpiSub, setTmpKpiSub] = useState("");
  const [tmpPriorities, setTmpPriorities] = useState<{ id: string; title: string }[]>([]);

  if (metricsLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!metrics) return <p className="text-muted-foreground">Sem dados disponíveis.</p>;

  const revenuePercent = Math.round((Number(metrics.revenue_current) / Number(metrics.revenue_goal)) * 100);
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

      {/* Quote Banner */}
      <div className="rounded-xl bg-primary p-6 flex items-start gap-4 relative">
        <Quote className="h-8 w-8 text-accent shrink-0 mt-0.5" />
        <p className="text-primary-foreground text-lg italic font-light leading-relaxed flex-1">
          "{metrics.quote_text}" — {metrics.quote_author}
        </p>
        <EditButton
          onClick={() => { setTmpQuote(metrics.quote_text); setTmpAuthor(metrics.quote_author); setEditQuote(true); }}
          className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
        />
      </div>

      {/* Revenue Thermometer */}
      <div className="rounded-xl bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-card-foreground">Receita Anual</h2>
          </div>
          <EditButton label="Editar" onClick={() => { setTmpGoal(Number(metrics.revenue_goal)); setTmpCurrent(Number(metrics.revenue_current)); setEditRevenue(true); }} />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>R$ {(Number(metrics.revenue_current) / 1000).toFixed(0)}.000</span>
          <span>Meta: R$ {(Number(metrics.revenue_goal) / 1000).toFixed(0)}.000</span>
        </div>
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${revenuePercent}%` }} />
        </div>
        <p className="text-right text-sm font-semibold text-accent mt-2">{revenuePercent}% atingido</p>
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

      {/* Edit Quote Dialog */}
      <Dialog open={editQuote} onOpenChange={setEditQuote}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Citação</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Citação</Label><Input value={tmpQuote} onChange={e => setTmpQuote(e.target.value)} /></div>
            <div><Label>Autor</Label><Input value={tmpAuthor} onChange={e => setTmpAuthor(e.target.value)} /></div>
            <button onClick={() => { updateMetrics.mutate({ quote_text: tmpQuote, quote_author: tmpAuthor }); setEditQuote(false); }} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">Salvar</button>
          </div>
        </DialogContent>
      </Dialog>

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
