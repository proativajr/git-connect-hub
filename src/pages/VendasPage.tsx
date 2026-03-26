import { useState } from "react";
import { TrendingUp, Plus, Trash2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface Contrato {
  id: string;
  cliente: string;
  tipo: string;
  duracao: number;
  valor: number;
  dataFechamento: string;
  status: "Ativo" | "Concluído" | "Cancelado";
}

const STORAGE_KEY = "proativa_vendas";

const getStored = (): Contrato[] => {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : defaultData;
  } catch { return defaultData; }
};

const defaultData: Contrato[] = [
  { id: "1", cliente: "Empresa Alpha", tipo: "Consultoria", duracao: 3, valor: 8500, dataFechamento: "2026-01-15", status: "Ativo" },
  { id: "2", cliente: "Startup Beta", tipo: "Projeto", duracao: 6, valor: 15000, dataFechamento: "2026-02-20", status: "Ativo" },
  { id: "3", cliente: "Corp Gamma", tipo: "Assessoria", duracao: 12, valor: 24000, dataFechamento: "2025-11-10", status: "Concluído" },
  { id: "4", cliente: "Tech Delta", tipo: "Consultoria", duracao: 2, valor: 5000, dataFechamento: "2026-03-01", status: "Ativo" },
];

const VendasPage = () => {
  const [contratos, setContratos] = useState<Contrato[]>(getStored);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Contrato, "id">>({ cliente: "", tipo: "", duracao: 1, valor: 0, dataFechamento: "", status: "Ativo" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const save = (next: Contrato[]) => {
    setContratos(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    toast({ title: "Alterações salvas", duration: 2000 });
  };

  const totalFaturado = contratos.reduce((a, c) => a + c.valor, 0);
  const mediaPorContrato = contratos.length > 0 ? totalFaturado / contratos.length : 0;
  const contratosAtivos = contratos.filter(c => c.status === "Ativo").length;

  const handleSave = () => {
    if (editId) {
      save(contratos.map(c => c.id === editId ? { ...c, ...form } : c));
      setEditId(null);
    } else {
      save([...contratos, { ...form, id: crypto.randomUUID() }]);
    }
    setShowAdd(false);
    setForm({ cliente: "", tipo: "", duracao: 1, valor: 0, dataFechamento: "", status: "Ativo" });
  };

  const openEdit = (c: Contrato) => {
    setForm({ cliente: c.cliente, tipo: c.tipo, duracao: c.duracao, valor: c.valor, dataFechamento: c.dataFechamento, status: c.status });
    setEditId(c.id);
    setShowAdd(true);
  };

  const statusColor: Record<string, string> = {
    Ativo: "bg-success/20 text-success",
    Concluído: "bg-primary/20 text-primary",
    Cancelado: "bg-destructive/20 text-destructive",
  };

  return (
    <div className="space-y-6 transition-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title font-display text-foreground">Vendas</h1>
          <p className="text-sm text-muted-foreground">Contratos fechados e métricas comerciais</p>
        </div>
        <button onClick={() => { setEditId(null); setForm({ cliente: "", tipo: "", duracao: 1, valor: 0, dataFechamento: "", status: "Ativo" }); setShowAdd(true); }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition-all">
          <Plus className="h-4 w-4" /> Novo Contrato
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Faturado", value: `R$ ${totalFaturado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
          { label: "Média por Contrato", value: `R$ ${mediaPorContrato.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
          { label: "Contratos Ativos", value: String(contratosAtivos) },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl bg-primary p-5">
            <p className="text-sm text-primary-foreground/70">{kpi.label}</p>
            <p className="text-2xl font-display font-bold text-primary-foreground mt-1 animate-counter">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["#", "Cliente", "Tipo de Contrato", "Duração (meses)", "Valor (R$)", "Data de Fechamento", "Status", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contratos.map((c, i) => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 group transition-colors hover:border-l-2 hover:border-l-primary">
                <td className="px-5 py-3 text-sm text-muted-foreground">{i + 1}</td>
                <td className="px-5 py-3 text-sm font-medium text-foreground">{c.cliente}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{c.tipo}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{c.duracao}</td>
                <td className="px-5 py-3 text-sm font-medium text-foreground">R$ {c.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{c.dataFechamento}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[c.status]}`}>{c.status}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(c)} className="text-muted-foreground hover:text-foreground transition-colors"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteId(c.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>{editId ? "Editar Contrato" : "Novo Contrato"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Cliente</Label><Input value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} /></div>
            <div><Label>Tipo de Contrato</Label><Input value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} /></div>
            <div><Label>Duração (meses)</Label><Input type="number" value={form.duracao} onChange={e => setForm({ ...form, duracao: Number(e.target.value) })} /></div>
            <div><Label>Valor (R$)</Label><Input type="number" value={form.valor} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} /></div>
            <div><Label>Data de Fechamento</Label><Input type="date" value={form.dataFechamento} onChange={e => setForm({ ...form, dataFechamento: e.target.value })} /></div>
            <div>
              <Label>Status</Label>
              <div className="flex gap-2 mt-1">
                {(["Ativo", "Concluído", "Cancelado"] as const).map(s => (
                  <button key={s} onClick={() => setForm({ ...form, status: s })}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${form.status === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleSave} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition-all">Salvar</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tem certeza que deseja remover este contrato?</p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setDeleteId(null)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-all">Cancelar</button>
            <button onClick={() => { if (deleteId) { save(contratos.filter(c => c.id !== deleteId)); setDeleteId(null); } }} className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground hover:brightness-105 transition-all">Excluir</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendasPage;
