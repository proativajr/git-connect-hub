import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChartRenderer, type ChartConfig, CHART_COLORS } from "./ChartRenderer";

type ChartType = "barras" | "barras_h" | "linhas" | "area" | "pizza" | "rosca";

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "barras", label: "Barras" },
  { value: "barras_h", label: "Horizontal" },
  { value: "linhas", label: "Linhas" },
  { value: "area", label: "Área" },
  { value: "pizza", label: "Pizza" },
  { value: "rosca", label: "Rosca" },
];

interface BuilderProps {
  initial: ChartConfig | null;
  onSave: (config: Omit<ChartConfig, "id">) => void;
  onClose: () => void;
}

const ChartBuilderModal = ({ initial, onSave, onClose }: BuilderProps) => {
  const mapType = (t: string | undefined): ChartType => {
    const map: Record<string, ChartType> = { bar: "barras", barH: "barras_h", line: "linhas", area: "area", pie: "pizza", donut: "rosca" };
    return (map[t || ""] || t || "barras") as ChartType;
  };

  const [title, setTitle] = useState(initial?.title || "");
  const [type, setType] = useState<ChartType>(mapType(initial?.chartType || initial?.type));
  const [rows, setRows] = useState<{ label: string; value: string }[]>(
    initial?.data?.length ? initial.data.map(d => ({ label: d.name || d.label || "", value: String(d.value) })) : [{ label: "", value: "" }]
  );
  const [color, setColor] = useState(initial?.color || "#c9a84c");
  const [showLegend, setShowLegend] = useState(initial?.showLegend ?? true);
  const [showLabels, setShowLabels] = useState(initial?.showLabels ?? false);

  const addRow = () => setRows([...rows, { label: "", value: "" }]);
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: "label" | "value", val: string) => {
    setRows(rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
  };

  const validRows = rows.filter(r => r.label.trim() && r.value.trim() && !isNaN(Number(r.value)));

  const preview: ChartConfig = {
    id: "preview", title, type, chartType: type, color, showLegend, showLabels,
    data: validRows.map(r => ({ name: r.label.trim(), label: r.label.trim(), value: Number(r.value) })),
  };

  const handleSave = () => {
    onSave({
      title: title.trim(),
      type,
      chartType: type,
      color,
      showLegend,
      showLabels,
      data: validRows.map(r => ({ name: r.label.trim(), label: r.label.trim(), value: Number(r.value) })),
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-[520px] max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-foreground">{initial ? "Editar Gráfico" : "Criar Gráfico"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Title */}
          <div>
            <label className="text-[13px] font-medium text-foreground block mb-1.5">Título do gráfico *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Distribuição por Status"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none transition-colors" />
          </div>

          {/* Chart type pills */}
          <div>
            <label className="text-[13px] font-medium text-foreground block mb-2">Tipo de gráfico</label>
            <div className="flex flex-wrap gap-2">
              {CHART_TYPES.map(ct => (
                <button key={ct.value} type="button" onClick={() => setType(ct.value)}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${
                    type === ct.value
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-background text-muted-foreground border-border hover:bg-muted"
                  }`}>
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color + toggles */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <label className="text-[13px] font-medium text-foreground">Cor</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer bg-background p-0.5" />
              <span className="text-xs text-muted-foreground font-mono">{color}</span>
            </div>
            <label className="flex items-center gap-2 text-[13px] text-foreground cursor-pointer">
              <input type="checkbox" checked={showLegend} onChange={e => setShowLegend(e.target.checked)} className="accent-accent" />
              Legenda
            </label>
            <label className="flex items-center gap-2 text-[13px] text-foreground cursor-pointer">
              <input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} className="accent-accent" />
              Rótulos
            </label>
          </div>

          {/* Data rows */}
          <div>
            <label className="text-[13px] font-medium text-foreground block mb-2">Dados *</label>
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-[1fr_100px_32px] gap-0 bg-muted px-3 py-2 border-b border-border">
                <span className="text-xs font-semibold text-muted-foreground">Rótulo</span>
                <span className="text-xs font-semibold text-muted-foreground">Valor</span>
                <span />
              </div>
              {rows.map((row, i) => (
                <div key={i} className={`grid grid-cols-[1fr_100px_32px] gap-0 px-3 py-1.5 items-center border-b border-border last:border-b-0 ${i % 2 === 0 ? "bg-card" : "bg-background"}`}>
                  <input value={row.label} onChange={e => updateRow(i, "label", e.target.value)} placeholder={`Rótulo ${i + 1}`}
                    className="h-8 px-2 bg-transparent border border-transparent rounded text-[13px] text-foreground focus:border-accent focus:outline-none w-full" />
                  <input type="number" value={row.value} onChange={e => updateRow(i, "value", e.target.value)} placeholder="0"
                    className="h-8 px-2 bg-transparent border border-transparent rounded text-[13px] text-foreground focus:border-accent focus:outline-none w-full" />
                  <button type="button" onClick={() => removeRow(i)} disabled={rows.length === 1}
                    className="text-destructive disabled:opacity-30 p-1"><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              <button type="button" onClick={addRow}
                className="w-full py-2 border-t border-border text-[13px] text-accent font-medium flex items-center justify-center gap-1.5 hover:bg-muted transition-colors">
                <Plus className="h-3.5 w-3.5" /> Adicionar linha
              </button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="text-[13px] font-medium text-foreground block mb-2">Pré-visualização</label>
            <div className="rounded-lg border border-border bg-background p-4 h-[200px]">
              {validRows.length > 0 ? (
                <ChartRenderer config={preview} height={170} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <span className="text-muted-foreground text-[13px]">Preencha os dados para ver o preview</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-11 rounded-lg border border-border bg-background text-sm text-muted-foreground font-medium hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button type="button" onClick={handleSave}
              className="flex-[2] h-11 rounded-lg bg-accent text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">
              {initial ? "Atualizar Gráfico" : "Salvar Gráfico"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChartBuilderModal;
