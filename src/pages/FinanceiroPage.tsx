import { useState } from "react";
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown, X } from "lucide-react";
import { useFinanceiro } from "@/contexts/FinanceiroContext";

const categorias = ["Projetos", "Operacional", "Infraestrutura", "Marketing", "Eventos", "Outros"];

const FinanceiroPage = () => {
  const { entries, addEntry, updateEntry, removeEntry, totalReceitas, totalDespesas, saldo } = useFinanceiro();
  const [showPanel, setShowPanel] = useState(false);
  const [form, setForm] = useState({ categoria: "Projetos", tipo: "Receita" as "Receita" | "Despesa", descricao: "", valor: 0, data: "", status: "Pendente" as "Confirmado" | "Pendente" });

  const handleAdd = () => {
    if (!form.descricao || !form.valor) return;
    addEntry(form);
    setForm({ categoria: "Projetos", tipo: "Receita", descricao: "", valor: 0, data: "", status: "Pendente" });
    setShowPanel(false);
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6 transition-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title font-display text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground">Fluxo de caixa compartilhado</p>
        </div>
        <button onClick={() => setShowPanel(true)} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">
          <Plus className="h-4 w-4" /> Adicionar Lançamento
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1"><TrendingUp className="h-4 w-4 text-success" /><span className="text-xs">Total Receitas</span></div>
          <p className="text-metric font-display text-success">{fmt(totalReceitas)}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1"><TrendingDown className="h-4 w-4 text-destructive" /><span className="text-xs">Total Despesas</span></div>
          <p className="text-metric font-display text-destructive">{fmt(totalDespesas)}</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1"><DollarSign className="h-4 w-4 text-accent" /><span className="text-xs">Saldo</span></div>
          <p className={`text-metric font-display ${saldo >= 0 ? "text-success" : "text-destructive"}`}>{fmt(saldo)}</p>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border sticky top-0 bg-card z-10">
              {["Categoria", "Tipo", "Descrição", "Valor (R$)", "Data", "Status", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-accent uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.id} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-card" : "bg-background-secondary"}`}>
                <td className="px-5 py-3">
                  <select value={e.categoria} onChange={ev => updateEntry(e.id, { categoria: ev.target.value })} className="bg-transparent text-sm text-foreground outline-none cursor-pointer">
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <select value={e.tipo} onChange={ev => updateEntry(e.id, { tipo: ev.target.value as any })}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${e.tipo === "Receita" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                    <option value="Receita">Receita</option>
                    <option value="Despesa">Despesa</option>
                  </select>
                </td>
                <td className="px-5 py-3">
                  <input value={e.descricao} onChange={ev => updateEntry(e.id, { descricao: ev.target.value })} className="bg-transparent text-sm text-foreground w-full outline-none" />
                </td>
                <td className="px-5 py-3">
                  <input type="number" value={e.valor} onChange={ev => updateEntry(e.id, { valor: Number(ev.target.value) })} className="bg-transparent text-sm text-foreground w-24 outline-none" />
                </td>
                <td className="px-5 py-3">
                  <input type="date" value={e.data} onChange={ev => updateEntry(e.id, { data: ev.target.value })} className="bg-transparent text-sm text-muted-foreground outline-none" />
                </td>
                <td className="px-5 py-3">
                  <select value={e.status} onChange={ev => updateEntry(e.id, { status: ev.target.value as any })}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${e.status === "Confirmado" ? "bg-success/20 text-success" : "bg-accent/20 text-accent"}`}>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => removeEntry(e.id)} className="text-muted-foreground hover:text-destructive transition-colors hover-only-actions"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowPanel(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-[420px] max-w-full h-full bg-card border-l border-border p-6 space-y-5 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-foreground">Novo Lançamento</h3>
              <button onClick={() => setShowPanel(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-foreground block mb-1">Descrição</label><input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground" /></div>
              <div><label className="text-sm font-medium text-foreground block mb-1">Categoria</label><select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground">{categorias.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="text-sm font-medium text-foreground block mb-1">Tipo</label><select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as any })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground"><option value="Receita">Receita</option><option value="Despesa">Despesa</option></select></div>
              <div><label className="text-sm font-medium text-foreground block mb-1">Valor (R$)</label><input type="number" value={form.valor} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground" /></div>
              <div><label className="text-sm font-medium text-foreground block mb-1">Data</label><input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground" /></div>
              <div><label className="text-sm font-medium text-foreground block mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground"><option value="Pendente">Pendente</option><option value="Confirmado">Confirmado</option></select></div>
              <button onClick={handleAdd} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceiroPage;
