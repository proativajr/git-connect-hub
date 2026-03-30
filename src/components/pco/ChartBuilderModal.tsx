import { useState } from "react";
import { X, BarChart2, BarChart, PieChart as PieChartIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChartRenderer, type ChartConfig } from "./ChartRenderer";

const CHART_TYPES = [
  { value: "bar", label: "Barras", icon: BarChart2 },
  { value: "barH", label: "Barras horizontais", icon: BarChart },
  { value: "line", label: "Linhas", icon: BarChart2 },
  { value: "area", label: "Área", icon: BarChart2 },
  { value: "pie", label: "Pizza", icon: PieChartIcon },
  { value: "donut", label: "Rosca", icon: PieChartIcon },
  { value: "scatter", label: "Dispersão", icon: BarChart2 },
] as const;

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

export default ChartBuilderModal;
