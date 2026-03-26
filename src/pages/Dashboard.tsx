import { useState } from "react";
import { Target, Eye, Award, DollarSign, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import EditButton from "@/components/EditButton";
import { fetchOKRsFromSheetDB, defaultInfo } from "@/lib/sheetdb";

const predadorValues = ["Proatividade", "Resultado", "Excelência", "Dono", "Antecipação", "Dedicação", "Organização", "Rede"];

const Dashboard = () => {
  const queryClient = useQueryClient();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboard_metrics"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("dashboard_metrics").select("*").limit(1).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: okrData } = useQuery({
    queryKey: ["sheetdb_okrs"],
    queryFn: fetchOKRsFromSheetDB,
    staleTime: 5 * 60 * 1000,
  });

  const faturamento = okrData?.info?.faturamento ?? defaultInfo.faturamento;

  const updateMetrics = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      if (!metrics) return;
      const { error } = await (supabase as any).from("dashboard_metrics").update(updates).eq("id", (metrics as any).id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["dashboard_metrics"] }); toast({ title: "Salvo!" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const [editRevenue, setEditRevenue] = useState(false);
  const [tmpGoal, setTmpGoal] = useState(0);
  const [tmpCurrent, setTmpCurrent] = useState(0);

  if (metricsLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const parsedFaturamento = parseFloat((faturamento || "0").replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
  const revenueGoal = 260000;
  const revenuePercent = revenueGoal > 0 ? Math.round((parsedFaturamento / revenueGoal) * 100) : 0;

  return (
    <div className="space-y-8 transition-page">
      {/* Welcome Hero */}
      <div className="rounded-xl bg-card p-8 border border-border">
        <h1 className="text-3xl font-display font-bold text-foreground">Proativa Jr</h1>
        <p className="text-muted-foreground mt-1 capitalize">{today}</p>
        <p className="text-primary font-medium mt-3 italic">"Navegar é preciso. Resultados são inevitáveis."</p>
      </div>

      {/* MVV Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            title: "Missão",
            text: "Formar líderes, por meio da vivência empresarial, realizando projetos de alto impacto.",
            icon: Target,
          },
          {
            title: "Visão",
            text: "Alcançar maturidade de gestão e fortalecer nossa imagem no ecossistema em 2026, operando com processos estruturados e pessoas proativas que garantam resultados agressivos.",
            icon: Eye,
          },
          {
            title: "Valores",
            text: "PREDADOR",
            icon: Award,
            isPredador: true,
          },
        ].map((box) => (
          <div
            key={box.title}
            className="rounded-xl bg-card border border-border border-l-4 border-l-primary p-6 flex flex-col gap-3 hover-lift group"
          >
            <div className="flex items-center gap-2.5">
              <box.icon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-display font-bold text-foreground">{box.title}</h3>
            </div>
            {(box as any).isPredador ? (
              <div className="flex flex-wrap gap-2">
                {predadorValues.map((v) => (
                  <span key={v} className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {v}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm leading-relaxed">{box.text}</p>
            )}
          </div>
        ))}
      </div>

      {/* Revenue Thermometer */}
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-display font-semibold text-foreground">Receita Anual</h2>
          </div>
          <EditButton label="Editar" onClick={() => { setTmpGoal(revenueGoal); setTmpCurrent(parsedFaturamento); setEditRevenue(true); }} />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{faturamento}</span>
          <span>Meta: R$ 260.000,00</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${Math.min(revenuePercent, 100)}%` }} />
        </div>
        <p className="text-right text-sm font-semibold text-primary mt-2">{revenuePercent}% atingido</p>
      </div>

      {/* Edit Revenue Dialog */}
      <Dialog open={editRevenue} onOpenChange={setEditRevenue}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Editar Receita Anual</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Valor Atual (R$)</Label><Input type="number" value={tmpCurrent} onChange={e => setTmpCurrent(Number(e.target.value))} /></div>
            <div><Label>Meta (R$)</Label><Input type="number" value={tmpGoal} onChange={e => setTmpGoal(Number(e.target.value))} /></div>
            <button onClick={() => { updateMetrics.mutate({ revenue_current: tmpCurrent, revenue_goal: tmpGoal }); setEditRevenue(false); }} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition-all">Salvar</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
