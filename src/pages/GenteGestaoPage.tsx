import { useState, useEffect, useCallback } from "react";
import { ChevronDown, Plus, Trash2, Pencil, X, BarChart2, BarChart, PieChart as PieChartIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, AreaChart, Area, BarChart as ReBarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EmDesenvolvimento from "@/components/EmDesenvolvimento";

interface ChartConfig {
  id: string;
  title: string;
  type: "bar" | "barH" | "line" | "area" | "pie" | "donut" | "scatter";
  data: { label: string; value: number }[];
  color: string;
  showLegend: boolean;
  showLabels: boolean;
}

const CHART_TYPES = [
  { value: "bar", label: "Barras", icon: BarChart2 },
  { value: "barH", label: "Barras horizontais", icon: BarChart },
  { value: "line", label: "Linhas", icon: BarChart2 },
  { value: "area", label: "Área", icon: BarChart2 },
  { value: "pie", label: "Pizza", icon: PieChartIcon },
  { value: "donut", label: "Rosca", icon: PieChartIcon },
  { value: "scatter", label: "Dispersão", icon: BarChart2 },
] as const;

const CHART_COLORS = ["hsl(var(--accent))", "#16a34a", "#dc2626", "#2563eb", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

const GenteGestaoPage = () => {
  const [activeTab, setActiveTab] = useState<"PCO" | "PDI">("PCO");
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingChart, setEditingChart] = useState<ChartConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCharts = useCallback(async () => {
    const { data } = await supabase.from("gente_uploads").select("*").eq("tipo", "chart").order("created_at");
    const parsed = (data || []).map((d: any) => ({
      id: d.id,
      ...(d.metadata as any),
    })) as ChartConfig[];
    setCharts(parsed);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCharts(); }, [fetchCharts]);

  const handleSaveChart = async (config: Omit<ChartConfig, "id">) => {
    if (editingChart) {
      await supabase.from("gente_uploads").update({
        metadata: config as any,
        nome_arquivo: config.title,
      }).eq("id", editingChart.id);
      toast({ title: "Gráfico atualizado", duration: 2000 });
    } else {
      await supabase.from("gente_uploads").insert({
        nome_arquivo: config.title,
        tipo: "chart",
        storage_path: "chart",
        metadata: config as any,
      });
      toast({ title: "Gráfico criado", duration: 2000 });
    }
    setEditingChart(null);
    setShowBuilder(false);
    fetchCharts();
  };

  const handleDeleteChart = async (id: string) => {
    await supabase.from("gente_uploads").delete().eq("id", id);
    setCharts(prev => prev.filter(c => c.id !== id));
    toast({ title: "Gráfico removido", duration: 2000 });
  };

  return (
    <div className="space-y-6 transition-page">
      <div>
        <h1 className="text-page-title font-display text-foreground">Gente e Gestão</h1>
        <p className="text-sm text-muted-foreground">PCO e PDI</p>
      </div>

      <div className="flex gap-2">
        {(["PCO", "PDI"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium border transition-all ${
              activeTab === tab ? "bg-accent text-accent-foreground border-accent" : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}>
            {tab} <ChevronDown className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>

      {activeTab === "PDI" && <EmDesenvolvimento title="PDI" />}

      {activeTab === "PCO" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-foreground">Gráficos PCO</h2>
            <button onClick={() => { setEditingChart(null); setShowBuilder(true); }}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">
              <Plus className="h-4 w-4" /> Criar Gráfico
            </button>
          </div>

          {charts.length === 0 && !loading && (
            <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
              <BarChart2 className="h-10 w-10 text-accent/40 mx-auto mb-3" />
              <p className="text-lg font-semibold text-muted-foreground">Nenhum gráfico criado</p>
              <p className="text-sm text-muted-foreground mt-1">Crie seu primeiro gráfico PCO para visualizar indicadores</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            {charts.map(chart => (
              <div key={chart.id} className="rounded-xl bg-card border border-border p-4 group relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">{chart.title}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity hover-only-actions">
                    <button onClick={() => { setEditingChart(chart); setShowBuilder(true); }} className="text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDeleteChart(chart.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <ChartRenderer config={chart} height={220} />
              </div>
            ))}
          </div>
        </div>
      )}

      {showBuilder && (
        <ChartBuilderModal
          initial={editingChart}
          onSave={handleSaveChart}
          onClose={() => { setShowBuilder(false); setEditingChart(null); }}
        />
      )}
    </div>
  );
};

const ChartRenderer = ({ config, height = 220 }: { config: ChartConfig; height?: number }) => {
  const data = config.data.map(d => ({ name: d.label, value: d.value }));
  const colors = [config.color, ...CHART_COLORS.filter(c => c !== config.color)];

  if (config.type === "pie" || config.type === "donut") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={config.type === "donut" ? 40 : 0}
            label={config.showLabels ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false} labelLine={false} fontSize={11}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          {config.showLegend && <Legend fontSize={11} />}
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (config.type === "line") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip />
          {config.showLegend && <Legend />}
          <Line type="monotone" dataKey="value" stroke={config.color} strokeWidth={2} dot={{ fill: config.color }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (config.type === "area") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip />
          {config.showLegend && <Legend />}
          <Area type="monotone" dataKey="value" stroke={config.color} fill={config.color} fillOpacity={0.4} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (config.type === "scatter") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis dataKey="value" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip />
          <Scatter data={data} fill={config.color} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  if (config.type === "barH") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
          <Tooltip />
          {config.showLegend && <Legend />}
          <Bar dataKey="value" fill={config.color} radius={[0, 4, 4, 0]} />
        </ReBarChart>
      </ResponsiveContainer>
    );
  }

  // Default: bar
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip />
        {config.showLegend && <Legend />}
        <Bar dataKey="value" fill={config.color} radius={[4, 4, 0, 0]} />
      </ReBarChart>
    </ResponsiveContainer>
  );
};

interface BuilderProps {
  initial: ChartConfig | null;
  onSave: (config: Omit<ChartConfig, "id">) => void;
  onClose: () => void;
}

const ChartBuilderModal = ({ initial, onSave, onClose }: BuilderProps) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [type, setType] = useState<ChartConfig["type"]>(initial?.type || "bar");
  const [data, setData] = useState<{ label: string; value: number }[]>(initial?.data || [{ label: "", value: 0 }]);
  const [color, setColor] = useState(initial?.color || "#c9a84c");
  const [showLegend, setShowLegend] = useState(initial?.showLegend ?? true);
  const [showLabels, setShowLabels] = useState(initial?.showLabels ?? true);

  const addRow = () => setData([...data, { label: "", value: 0 }]);
  const removeRow = (i: number) => setData(data.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: "label" | "value", val: string) => {
    setData(data.map((d, idx) => idx === i ? { ...d, [field]: field === "value" ? Number(val) : val } : d));
  };

  const preview: ChartConfig = { id: "preview", title, type, data, color, showLegend, showLabels };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-[560px] max-h-[80vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{initial ? "Editar Gráfico" : "Criar Gráfico"}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-0 p-6 pt-4">
          {/* Left: chart types */}
          <div className="w-[160px] shrink-0 border-r border-border pr-3 space-y-0.5">
            {CHART_TYPES.map(ct => (
              <button key={ct.value} onClick={() => setType(ct.value as any)}
                className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-[13px] transition-all ${
                  type === ct.value ? "bg-accent/20 text-accent border-l-[3px] border-accent" : "text-muted-foreground hover:bg-muted"
                }`}>
                <ct.icon className="h-4 w-4 shrink-0" />
                {ct.label}
              </button>
            ))}
          </div>

          {/* Right: config */}
          <div className="flex-1 pl-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Título do gráfico</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Dados</label>
              <div className="space-y-1.5">
                {data.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={row.label} onChange={e => updateRow(i, "label", e.target.value)} placeholder="Rótulo"
                      className="flex-1 rounded border border-border bg-background px-2 py-1.5 text-xs text-foreground" />
                    <input type="number" value={row.value} onChange={e => updateRow(i, "value", e.target.value)} placeholder="Valor"
                      className="w-20 rounded border border-border bg-background px-2 py-1.5 text-xs text-foreground" />
                    {data.length > 1 && (
                      <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addRow} className="text-xs text-accent hover:underline mt-1">+ Adicionar linha</button>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-foreground">Cor principal</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-foreground">
                <input type="checkbox" checked={showLegend} onChange={e => setShowLegend(e.target.checked)} className="accent-accent" />
                Mostrar legenda
              </label>
              <label className="flex items-center gap-2 text-xs text-foreground">
                <input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} className="accent-accent" />
                Mostrar rótulos
              </label>
            </div>

            {/* Preview */}
            <div className="border border-border rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Preview</p>
              <ChartRenderer config={preview} height={180} />
            </div>

            <div className="flex justify-between pt-2">
              <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
              <button onClick={() => onSave({ title, type, data, color, showLegend, showLabels })}
                className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">
                Salvar Gráfico
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ChartRenderer };
export type { ChartConfig };
export default GenteGestaoPage;
