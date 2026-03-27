import { useState } from "react";
import { Plus, Trash2, X, Image, LayoutGrid, LayoutList } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Parceria {
  id: string;
  parceiro: string;
  tipo: string;
  oferece: string;
  beneficios: string;
  contato: string;
  status: "Ativa" | "Inativa";
}

const STORAGE_KEY = "proativa_parcerias";

const defaultParcerias: Parceria[] = [
  { id: "1", parceiro: "Google for Startups", tipo: "Tecnologia", oferece: "Créditos Cloud", beneficios: "Infraestrutura tech", contato: "partner@google.com", status: "Ativa" },
  { id: "2", parceiro: "SEBRAE", tipo: "Capacitação", oferece: "Mentorias e eventos", beneficios: "Networking e conhecimento", contato: "contato@sebrae.com", status: "Ativa" },
  { id: "3", parceiro: "WeWork", tipo: "Coworking", oferece: "Espaço de trabalho", beneficios: "Ambiente profissional", contato: "spaces@wework.com", status: "Inativa" },
];

const getStored = (): Parceria[] => { try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : defaultParcerias; } catch { return defaultParcerias; } };

const ParceriasPage = () => {
  const [parcerias, setParcerias] = useState<Parceria[]>(getStored);
  const [showPanel, setShowPanel] = useState(false);
  const [view, setView] = useState<"table" | "cards">("table");
  const [form, setForm] = useState<Omit<Parceria, "id">>({ parceiro: "", tipo: "", oferece: "", beneficios: "", contato: "", status: "Ativa" });

  const save = (next: Parceria[]) => { setParcerias(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); toast({ title: "Alterações salvas", duration: 2000 }); };

  const handleAdd = () => {
    if (!form.parceiro) return;
    save([...parcerias, { ...form, id: crypto.randomUUID() }]);
    setForm({ parceiro: "", tipo: "", oferece: "", beneficios: "", contato: "", status: "Ativa" });
    setShowPanel(false);
  };

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="space-y-6 transition-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title font-display text-foreground">Parcerias</h1>
          <p className="text-sm text-muted-foreground">Gestão de parcerias institucionais</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button onClick={() => setView("table")} className={`px-3 py-1.5 text-xs ${view === "table" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}><LayoutList className="h-4 w-4" /></button>
            <button onClick={() => setView("cards")} className={`px-3 py-1.5 text-xs ${view === "cards" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}><LayoutGrid className="h-4 w-4" /></button>
          </div>
          <button onClick={() => setShowPanel(true)} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">
            <Plus className="h-4 w-4" /> Nova Parceria
          </button>
        </div>
      </div>

      {view === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parcerias.map(p => (
            <div key={p.id} className="rounded-xl bg-card border border-border p-5 hover-lift">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">{getInitials(p.parceiro)}</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{p.parceiro}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "Ativa" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {p.oferece.split(",").map((tag, i) => (
                  <span key={i} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{tag.trim()}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{p.tipo}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-border">
                {["Parceiro", "Tipo", "Oferece", "Benefícios", "Contato", "Status", ""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-accent uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parcerias.map((p, i) => (
                <tr key={p.id} className={`border-b border-border/50 hover:bg-muted/30 ${i % 2 === 0 ? "" : "bg-background-secondary"}`}>
                  <td className="px-5 py-3"><input value={p.parceiro} onChange={e => save(parcerias.map(x => x.id === p.id ? { ...x, parceiro: e.target.value } : x))} className="bg-transparent text-sm text-foreground w-full outline-none" /></td>
                  <td className="px-5 py-3"><input value={p.tipo} onChange={e => save(parcerias.map(x => x.id === p.id ? { ...x, tipo: e.target.value } : x))} className="bg-transparent text-sm text-muted-foreground w-full outline-none" /></td>
                  <td className="px-5 py-3"><input value={p.oferece} onChange={e => save(parcerias.map(x => x.id === p.id ? { ...x, oferece: e.target.value } : x))} className="bg-transparent text-sm text-muted-foreground w-full outline-none" /></td>
                  <td className="px-5 py-3"><input value={p.beneficios} onChange={e => save(parcerias.map(x => x.id === p.id ? { ...x, beneficios: e.target.value } : x))} className="bg-transparent text-sm text-muted-foreground w-full outline-none" /></td>
                  <td className="px-5 py-3"><input value={p.contato} onChange={e => save(parcerias.map(x => x.id === p.id ? { ...x, contato: e.target.value } : x))} className="bg-transparent text-sm text-muted-foreground w-full outline-none" /></td>
                  <td className="px-5 py-3">
                    <select value={p.status} onChange={e => save(parcerias.map(x => x.id === p.id ? { ...x, status: e.target.value as any } : x))}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${p.status === "Ativa" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                      <option value="Ativa">Ativa</option>
                      <option value="Inativa">Inativa</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => save(parcerias.filter(x => x.id !== p.id))} className="text-muted-foreground hover:text-destructive transition-colors hover-only-actions"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowPanel(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-[420px] max-w-full h-full bg-card border-l border-border p-6 space-y-5 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-foreground">Nova Parceria</h3>
              <button onClick={() => setShowPanel(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Parceiro", key: "parceiro", value: form.parceiro },
                { label: "Tipo de Parceria", key: "tipo", value: form.tipo },
                { label: "O que Oferecem", key: "oferece", value: form.oferece },
                { label: "Benefícios", key: "beneficios", value: form.beneficios },
                { label: "Contato", key: "contato", value: form.contato },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-foreground block mb-1">{f.label}</label>
                  <input value={f.value} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground" />
                </div>
              ))}
              <button onClick={handleAdd} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParceriasPage;
