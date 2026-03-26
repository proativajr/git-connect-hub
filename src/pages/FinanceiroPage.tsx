import { useState } from "react";
import { DollarSign, Plus, Trash2, Download, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFinanceiro } from "@/contexts/FinanceiroContext";
import FinanceiroPasswordGate from "@/components/FinanceiroPasswordGate";

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const FinanceiroPage = () => {
  return (
    <FinanceiroPasswordGate>
      <FinanceiroContent />
    </FinanceiroPasswordGate>
  );
};

const FinanceiroContent = () => {
  const { entries, addEntry, updateEntry, removeEntry, balance } = useFinanceiro();
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({
    description: "", category: "", type: "Receita" as "Receita" | "Despesa", value: 0, date: "", notes: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = monthFilter === "all" ? entries : entries.filter(e => {
    const m = new Date(e.date).getMonth();
    return months[m] === monthFilter;
  });

  const totalReceita = filtered.filter(e => e.type === "Receita").reduce((a, e) => a + e.value, 0);
  const totalDespesa = filtered.filter(e => e.type === "Despesa").reduce((a, e) => a + e.value, 0);

  const handleAdd = () => {
    addEntry(newEntry);
    setNewEntry({ description: "", category: "", type: "Receita", value: 0, date: "", notes: "" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6 transition-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title font-display text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Fluxo de caixa e controle financeiro</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-all">
            <Download className="h-4 w-4" /> Exportar
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition-all">
            <Plus className="h-4 w-4" /> Nova Entrada
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Saldo Total", value: balance, color: balance >= 0 ? "text-success" : "text-destructive" },
          { label: "Total Receitas", value: totalReceita, color: "text-success" },
          { label: "Total Despesas", value: totalDespesa, color: "text-destructive" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-card border border-border p-5">
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-display font-bold mt-1 animate-counter ${kpi.color}`}>
              R$ {kpi.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      {/* Month Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setMonthFilter("all")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${monthFilter === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
          Todos
        </button>
        {months.map(m => (
          <button key={m} onClick={() => setMonthFilter(m)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${monthFilter === m ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
            {m}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Descrição", "Categoria", "Tipo", "Valor (R$)", "Data", "Notas", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                <td className="px-5 py-3 text-sm text-foreground">{e.description}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{e.category}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${e.type === "Receita" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                    {e.type}
                  </span>
                </td>
                <td className={`px-5 py-3 text-sm font-medium ${e.type === "Receita" ? "text-success" : "text-destructive"}`}>
                  {e.type === "Receita" ? "+" : "-"}R$ {e.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{e.date}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{e.notes}</td>
                <td className="px-5 py-3">
                  <button onClick={() => setDeleteId(e.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma entrada encontrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Nova Entrada</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Descrição</Label><Input value={newEntry.description} onChange={e => setNewEntry({ ...newEntry, description: e.target.value })} /></div>
            <div><Label>Categoria</Label><Input value={newEntry.category} onChange={e => setNewEntry({ ...newEntry, category: e.target.value })} /></div>
            <div>
              <Label>Tipo</Label>
              <div className="flex gap-3 mt-1">
                {(["Receita", "Despesa"] as const).map(t => (
                  <button key={t} onClick={() => setNewEntry({ ...newEntry, type: t })}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${newEntry.type === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div><Label>Valor (R$)</Label><Input type="number" value={newEntry.value} onChange={e => setNewEntry({ ...newEntry, value: Number(e.target.value) })} /></div>
            <div><Label>Data</Label><Input type="date" value={newEntry.date} onChange={e => setNewEntry({ ...newEntry, date: e.target.value })} /></div>
            <div><Label>Notas</Label><Input value={newEntry.notes} onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })} /></div>
            <button onClick={handleAdd} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition-all">Salvar</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tem certeza que deseja remover esta entrada?</p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setDeleteId(null)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-all">Cancelar</button>
            <button onClick={() => { if (deleteId) { removeEntry(deleteId); setDeleteId(null); } }} className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground hover:brightness-105 transition-all">Excluir</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceiroPage;
