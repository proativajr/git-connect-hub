import { useState } from "react";
import { BarChart3, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "proativa_monday_crm_kpis";

const getStored = () => {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : { leads: 42, propostas: 18, contratos: 8 };
  } catch { return { leads: 42, propostas: 18, contratos: 8 }; }
};

const MondayCRMPage = () => {
  const [kpis, setKpis] = useState(getStored);
  const [editKpi, setEditKpi] = useState<string | null>(null);
  const [tmpValue, setTmpValue] = useState(0);

  const taxaConversao = kpis.propostas > 0 ? ((kpis.contratos / kpis.propostas) * 100).toFixed(1) : "0.0";

  const save = (next: typeof kpis) => {
    setKpis(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    toast({ title: "Alterações salvas", duration: 2000 });
  };

  const kpiCards = [
    { key: "leads", label: "Leads Totais", value: kpis.leads },
    { key: "propostas", label: "Propostas Enviadas", value: kpis.propostas },
    { key: "contratos", label: "Contratos Fechados", value: kpis.contratos },
    { key: "taxa", label: "Taxa de Conversão", value: `${taxaConversao}%`, readonly: true },
  ];

  return (
    <div className="space-y-6 transition-page">
      <div>
        <h1 className="text-page-title font-display text-foreground">Monday CRM</h1>
        <p className="text-sm text-muted-foreground">Gestão de leads e pipeline comercial</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.key} className="rounded-xl bg-primary p-5 relative group">
            <p className="text-sm text-primary-foreground/70">{kpi.label}</p>
            <p className="text-3xl font-display font-bold text-primary-foreground mt-1 animate-counter">{kpi.value}</p>
            {!(kpi as any).readonly && (
              <button
                onClick={() => { setEditKpi(kpi.key); setTmpValue(kpi.value as number); }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary-foreground/60 hover:text-primary-foreground"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Iframe placeholder */}
      <div className="rounded-xl bg-card border border-border p-10 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Iframe do Monday.com</p>
          <p className="text-xs text-muted-foreground mt-1">Área reservada para integração com Monday CRM</p>
        </div>
      </div>

      {/* Edit KPI Dialog */}
      <Dialog open={!!editKpi} onOpenChange={() => setEditKpi(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Editar KPI</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Valor</Label><Input type="number" value={tmpValue} onChange={e => setTmpValue(Number(e.target.value))} /></div>
            <button onClick={() => {
              if (editKpi) {
                save({ ...kpis, [editKpi]: tmpValue });
                setEditKpi(null);
              }
            }} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition-all">Salvar</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MondayCRMPage;
