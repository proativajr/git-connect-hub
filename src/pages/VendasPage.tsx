import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Contrato {
  id: string;
  cliente: string;
  servico: string;
  valor: number;
  dataInicio: string;
  dataFim: string;
  status: "Ativo" | "Encerrado" | "Em negociação";
}

const STORAGE_KEY = "proativa_vendas_contratos";

const defaultContratos: Contrato[] = [
  { id: "1", cliente: "TechCo Ltda", servico: "Consultoria Digital", valor: 12000, dataInicio: "2026-01-10", dataFim: "2026-04-10", status: "Ativo" },
  { id: "2", cliente: "StartupX", servico: "Desenvolvimento Web", valor: 8500, dataInicio: "2026-02-01", dataFim: "2026-05-01", status: "Ativo" },
  { id: "3", cliente: "CorpBig SA", servico: "Pesquisa de Mercado", valor: 25000, dataInicio: "2025-10-15", dataFim: "2026-01-15", status: "Encerrado" },
];

const getStored = (): Contrato[] => { try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : defaultContratos; } catch { return defaultContratos; } };

const statusColors: Record<string, string> = {
  "Ativo": "bg-success/20 text-success",
  "Encerrado": "bg-muted text-muted-foreground",
  "Em negociação": "bg-accent/20 text-accent",
};

const daysBetween = (a: string, b: string) => {
  if (!a || !b) return 0;
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
};

const VendasPage = () => {
  const [contratos, setContratos] = useState<Contrato[]>(getStored);
  const [showPanel, setShowPanel] = useState(false);
  const [form, setForm] = useState<Omit<Contrato, "id">>({ cliente: "", servico: "", valor: 0, dataInicio: "", dataFim: "", status: "Em negociação" });

  const save = (next: Contrato[]) => { setContratos(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); toast({ title: "Alterações salvas", duration: 2000 }); };

  const totalContratos = contratos.length;
  const totalReceita = contratos.reduce((s, c) => s + c.valor, 0);

  const handleAdd = () => {
    if (!form.cliente || !form.servico) return;
    save([...contratos, { ...form, id: crypto.randomUUID() }]);
    setForm({ cliente: "", servico: "", valor: 0, dataInicio: "", dataFim: "", status: "Em negociação" });
    setShowPanel(false);
  };

  return (
    <div className="space-y-6 transition-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title font-display text-foreground">Vendas</h1>
          <p className="text-sm text-muted-foreground">Contratos e faturamento</p>
        </div>
        <button onClick={() => setShowPanel(true)} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">
          <Plus className="h-4 w-4" /> Novo Contrato
        </button>
      </div>

      <div className="rounded-xl bg-card border border-border overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              {["Cliente", "Serviço", "Valor (R$)", "Início", "Fim", "Duração", "Status", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-accent uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contratos.map((c, i) => (
              <tr key={c.id} className={`border-b border-border/50 hover:bg-muted/30 ${i % 2 === 0 ? "" : "bg-background-secondary"}`}>
                <td className="px-5 py-3"><input value={c.cliente} onChange={e => save(contratos.map(x => x.id === c.id ? { ...x, cliente: e.target.value } : x))} className="bg-transparent text-sm text-foreground w-full outline-none" /></td>
                <td className="px-5 py-3"><input value={c.servico} onChange={e => save(contratos.map(x => x.id === c.id ? { ...x, servico: e.target.value } : x))} className="bg-transparent text-sm text-muted-foreground w-full outline-none" /></td>
                <td className="px-5 py-3"><input type="number" value={c.valor} onChange={e => save(contratos.map(x => x.id === c.id ? { ...x, valor: Number(e.target.value) } : x))} className="bg-transparent text-sm text-foreground w-24 outline-none" /></td>
                <td className="px-5 py-3"><input type="date" value={c.dataInicio} onChange={e => save(contratos.map(x => x.id === c.id ? { ...x, dataInicio: e.target.value } : x))} className="bg-transparent text-sm text-muted-foreground outline-none" /></td>
                <td className="px-5 py-3"><input type="date" value={c.dataFim} onChange={e => save(contratos.map(x => x.id === c.id ? { ...x, dataFim: e.target.value } : x))} className="bg-transparent text-sm text-muted-foreground outline-none" /></td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{daysBetween(c.dataInicio, c.dataFim)} dias</td>
                <td className="px-5 py-3">
                  <select value={c.status} onChange={e => save(contratos.map(x => x.id === c.id ? { ...x, status: e.target.value as any } : x))}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${statusColors[c.status]}`}>
                    <option value="Ativo">Ativo</option>
                    <option value="Encerrado">Encerrado</option>
                    <option value="Em negociação">Em negociação</option>
                  </select>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => save(contratos.filter(x => x.id !== c.id))} className="text-muted-foreground hover:text-destructive transition-colors hover-only-actions"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/30">
              <td className="px-5 py-3 text-sm font-semibold text-foreground">{totalContratos} contratos</td>
              <td className="px-5 py-3" />
              <td className="px-5 py-3 text-sm font-semibold text-accent">R$ {totalReceita.toLocaleString("pt-BR")}</td>
              <td colSpan={5} />
            </tr>
          </tfoot>
        </table>
      </div>

      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowPanel(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-[420px] max-w-full h-full bg-card border-l border-border p-6 space-y-5 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-foreground">Novo Contrato</h3>
              <button onClick={() => setShowPanel(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-sm font-medium text-foreground block mb-1">Cliente</label><input value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground" /></div>
              <div><label className="text-sm font-medium text-foreground block mb-1">Serviço</label><input value={form.servico} onChange={e => setForm({ ...form, servico: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground" /></div>
              <div><label className="text-sm font-medium text-foreground block mb-1">Valor (R$)</label><input type="number" value={form.valor} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground" /></div>
              <div><label className="text-sm font-medium text-foreground block mb-1">Data Início</label><input type="date" value={form.dataInicio} onChange={e => setForm({ ...form, dataInicio: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground" /></div>
              <div><label className="text-sm font-medium text-foreground block mb-1">Data Fim</label><input type="date" value={form.dataFim} onChange={e => setForm({ ...form, dataFim: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground" /></div>
              <div><label className="text-sm font-medium text-foreground block mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground"><option value="Em negociação">Em negociação</option><option value="Ativo">Ativo</option><option value="Encerrado">Encerrado</option></select></div>
              <button onClick={handleAdd} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendasPage;
