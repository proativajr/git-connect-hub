import { useState } from "react";
import { Plus, Trash2, Edit2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  nome: string;
  empresa: string;
  etapa: string;
  responsavel: string;
  valor: number;
  dataEntrada: string;
  ultimoContato: string;
}

const STORAGE_KEY = "proativa_crm_leads";
const ETAPAS = ["Prospecção", "Primeiro Contato", "Proposta", "Negociação", "Fechado", "Perdido"];

const defaultLeads: Lead[] = [
  { id: "1", nome: "João Empresa", empresa: "TechCo", etapa: "Proposta", responsavel: "Ana", valor: 12000, dataEntrada: "2026-01-10", ultimoContato: "2026-03-20" },
  { id: "2", nome: "Maria Startup", empresa: "StartupX", etapa: "Fechado", responsavel: "Pedro", valor: 8500, dataEntrada: "2026-02-05", ultimoContato: "2026-03-15" },
  { id: "3", nome: "Carlos Corp", empresa: "CorpBig", etapa: "Negociação", responsavel: "Ana", valor: 25000, dataEntrada: "2026-01-20", ultimoContato: "2026-03-18" },
  { id: "4", nome: "Lucia MEI", empresa: "MeiShop", etapa: "Primeiro Contato", responsavel: "Lucas", valor: 3000, dataEntrada: "2026-03-01", ultimoContato: "2026-03-22" },
  { id: "5", nome: "Roberto Ind", empresa: "IndBrasil", etapa: "Perdido", responsavel: "Pedro", valor: 15000, dataEntrada: "2026-01-15", ultimoContato: "2026-02-28" },
];

const getStored = (): Lead[] => { try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : defaultLeads; } catch { return defaultLeads; } };

const etapaColors: Record<string, string> = {
  "Prospecção": "bg-muted text-muted-foreground",
  "Primeiro Contato": "bg-accent/20 text-accent",
  "Proposta": "bg-blue-500/20 text-blue-400",
  "Negociação": "bg-purple-500/20 text-purple-400",
  "Fechado": "bg-success/20 text-success",
  "Perdido": "bg-destructive/20 text-destructive",
};

const MondayCRMPage = () => {
  const [leads, setLeads] = useState<Lead[]>(getStored);
  const [showPanel, setShowPanel] = useState(false);
  const [form, setForm] = useState<Omit<Lead, "id">>({ nome: "", empresa: "", etapa: "Prospecção", responsavel: "", valor: 0, dataEntrada: "", ultimoContato: "" });
  const [search, setSearch] = useState("");

  const save = (next: Lead[]) => { setLeads(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); toast({ title: "Alterações salvas", duration: 2000 }); };

  const totalLeads = leads.length;
  const fechados = leads.filter(l => l.etapa === "Fechado").length;
  const perdidos = leads.filter(l => l.etapa === "Perdido").length;
  const taxaConversao = totalLeads > 0 ? ((fechados / totalLeads) * 100).toFixed(1) : "0.0";
  const valorFechado = leads.filter(l => l.etapa === "Fechado").reduce((s, l) => s + l.valor, 0);

  const etapaCounts = ETAPAS.map(e => ({ etapa: e, count: leads.filter(l => l.etapa === e).length }));

  const filtered = leads.filter(l =>
    l.nome.toLowerCase().includes(search.toLowerCase()) ||
    l.empresa.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.nome) return;
    save([...leads, { ...form, id: crypto.randomUUID() }]);
    setForm({ nome: "", empresa: "", etapa: "Prospecção", responsavel: "", valor: 0, dataEntrada: "", ultimoContato: "" });
    setShowPanel(false);
  };

  // SVG ring
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = parseFloat(taxaConversao);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-6 transition-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title font-display text-foreground">Monday CRM</h1>
          <p className="text-sm text-muted-foreground">Gestão de leads e pipeline comercial</p>
        </div>
        <button onClick={() => setShowPanel(true)} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">
          <Plus className="h-4 w-4" /> Novo Lead
        </button>
      </div>

      {/* Conversion ring + metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-card border border-border p-6 flex items-center gap-6">
          <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
              <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--accent))" strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-display font-semibold text-accent">{taxaConversao}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3 text-sm">
              <div><span className="text-muted-foreground">Total:</span> <span className="text-foreground font-semibold">{totalLeads}</span></div>
              <div><span className="text-muted-foreground">Fechados:</span> <span className="text-success font-semibold">{fechados}</span></div>
              <div><span className="text-muted-foreground">Perdidos:</span> <span className="text-destructive font-semibold">{perdidos}</span></div>
              <div><span className="text-muted-foreground">Valor:</span> <span className="text-accent font-semibold">R$ {valorFechado.toLocaleString("pt-BR")}</span></div>
            </div>
          </div>
        </div>

        {/* Funnel pills */}
        <div className="rounded-xl bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground mb-3">Pipeline por Etapa</p>
          <div className="flex flex-wrap gap-2">
            {etapaCounts.map(e => (
              <div key={e.etapa} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${etapaColors[e.etapa]}`}>
                {e.etapa}: {e.count}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar leads..."
        className="w-full max-w-sm rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent" />

      {/* Table */}
      <div className="rounded-xl bg-card border border-border overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border">
              {["Lead", "Empresa", "Etapa", "Responsável", "Valor (R$)", "Data Entrada", "Último Contato", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-accent uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={l.id} className={`border-b border-border/50 hover:bg-muted/30 ${i % 2 === 0 ? "" : "bg-background-secondary"}`}>
                <td className="px-5 py-3"><input value={l.nome} onChange={e => save(leads.map(x => x.id === l.id ? { ...x, nome: e.target.value } : x))} className="bg-transparent text-sm text-foreground w-full outline-none" /></td>
                <td className="px-5 py-3"><input value={l.empresa} onChange={e => save(leads.map(x => x.id === l.id ? { ...x, empresa: e.target.value } : x))} className="bg-transparent text-sm text-muted-foreground w-full outline-none" /></td>
                <td className="px-5 py-3">
                  <select value={l.etapa} onChange={e => save(leads.map(x => x.id === l.id ? { ...x, etapa: e.target.value } : x))}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${etapaColors[l.etapa]}`}>
                    {ETAPAS.map(et => <option key={et} value={et}>{et}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3"><input value={l.responsavel} onChange={e => save(leads.map(x => x.id === l.id ? { ...x, responsavel: e.target.value } : x))} className="bg-transparent text-sm text-muted-foreground w-full outline-none" /></td>
                <td className="px-5 py-3"><input type="number" value={l.valor} onChange={e => save(leads.map(x => x.id === l.id ? { ...x, valor: Number(e.target.value) } : x))} className="bg-transparent text-sm text-foreground w-24 outline-none" /></td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{l.dataEntrada}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{l.ultimoContato}</td>
                <td className="px-5 py-3">
                  <button onClick={() => save(leads.filter(x => x.id !== l.id))} className="text-muted-foreground hover:text-destructive transition-colors hover-only-actions"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowPanel(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-[420px] max-w-full h-full bg-card border-l border-border p-6 space-y-5 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-foreground">Novo Lead</h3>
              <button onClick={() => setShowPanel(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Nome", value: form.nome, key: "nome" },
                { label: "Empresa", value: form.empresa, key: "empresa" },
                { label: "Responsável", value: form.responsavel, key: "responsavel" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-foreground block mb-1">{f.label}</label>
                  <input value={f.value} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground" />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Etapa</label>
                <select value={form.etapa} onChange={e => setForm({ ...form, etapa: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground">
                  {ETAPAS.map(et => <option key={et} value={et}>{et}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Valor (R$)</label>
                <input type="number" value={form.valor} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground" />
              </div>
              <button onClick={handleAdd} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MondayCRMPage;
