import { useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Departments = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [editMetrics, setEditMetrics] = useState(false);
  const [tmpMetrics, setTmpMetrics] = useState<{ id: string; label: string; value: string }[]>([]);

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const currentDeptId = departments[activeTab]?.id;

  const { data: metrics = [] } = useQuery({
    queryKey: ["department_metrics", currentDeptId],
    queryFn: async () => {
      const { data, error } = await supabase.from("department_metrics").select("*").eq("department_id", currentDeptId).order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!currentDeptId,
  });

  const updateMetric = useMutation({
    mutationFn: async (items: { id: string; label: string; value: string }[]) => {
      for (const item of items) {
        const { error } = await supabase.from("department_metrics").update({ label: item.label, value: item.value }).eq("id", item.id);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["department_metrics"] }); toast({ title: "Salvo!" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const currentDept = departments[activeTab];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Diretorias & KPIs</h1>
          <p className="text-muted-foreground mt-1">Análise detalhada de performance por setor</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setTmpMetrics(metrics.map((m: any) => ({ id: m.id, label: m.label, value: m.value }))); setEditMetrics(true); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all duration-300">
            <Pencil className="h-4 w-4" /> Editar Métricas
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
        {departments.map((s: any, i: number) => (
          <button key={s.id} onClick={() => setActiveTab(i)}
            className={`flex-1 rounded-md py-2.5 px-3 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === i ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-card-foreground"
            }`}>
            {s.name}
          </button>
        ))}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m: any) => (
          <div key={m.id} className="rounded-xl bg-card p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <p className="text-2xl font-bold text-card-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-card-foreground mb-4">{currentDept?.name} — Evolução Mensal</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { month: "Jan", value: 30 }, { month: "Fev", value: 40 }, { month: "Mar", value: 50 },
            { month: "Abr", value: 45 }, { month: "Mai", value: 60 }, { month: "Jun", value: 55 },
            { month: "Jul", value: 70 }, { month: "Ago", value: 65 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 88%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(220 10% 46%)" }} />
            <Tooltip contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(220 13% 88%)", borderRadius: "8px", fontSize: "13px" }} />
            <Bar dataKey="value" fill="hsl(50 96% 51%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Edit Metrics Dialog */}
      <Dialog open={editMetrics} onOpenChange={setEditMetrics}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Métricas — {currentDept?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            {tmpMetrics.map((m, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <div><Label>Label</Label><Input value={m.label} onChange={e => { const u = [...tmpMetrics]; u[i] = { ...u[i], label: e.target.value }; setTmpMetrics(u); }} /></div>
                <div><Label>Valor</Label><Input value={m.value} onChange={e => { const u = [...tmpMetrics]; u[i] = { ...u[i], value: e.target.value }; setTmpMetrics(u); }} /></div>
              </div>
            ))}
            <button onClick={() => { updateMetric.mutate(tmpMetrics); setEditMetrics(false); }} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">Salvar</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Departments;
