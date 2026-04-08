import { useState, useEffect } from "react";
import { Plus, Trash2, X, LayoutGrid, LayoutList, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Parceria {
  id: string;
  parceiro: string;
  tipo: string | null;
  oferece: string | null;
  beneficios: string | null;
  contato: string | null;
  status: string | null;
  logo_url: string | null;
  position: number;
}

const ParceriasPage = () => {
  const [parcerias, setParcerias] = useState<Parceria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [view, setView] = useState<"table" | "cards">("table");
  const [form, setForm] = useState({ parceiro: "", tipo: "", oferece: "", beneficios: "", contato: "", status: "ativa" });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchParcerias = async () => {
    const { data } = await supabase.from("parcerias").select("*").order("position");
    setParcerias((data as Parceria[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchParcerias();
    const channel = supabase
      .channel("parcerias_management")
      .on("postgres_changes", { event: "*", schema: "public", table: "parcerias" }, () => fetchParcerias())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const uploadLogo = async (file: File, parceriaId: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${parceriaId}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("parcerias-logos").upload(fileName, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("parcerias-logos").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleAdd = async () => {
    if (!form.parceiro) return;
    try {
      const { data, error } = await supabase.from("parcerias").insert({
        parceiro: form.parceiro,
        tipo: form.tipo || null,
        oferece: form.oferece || null,
        beneficios: form.beneficios || null,
        contato: form.contato || null,
        status: form.status,
        position: parcerias.length,
      }).select().single();

      if (error) throw error;

      if (logoFile && data) {
        const logoUrl = await uploadLogo(logoFile, data.id);
        await supabase.from("parcerias").update({ logo_url: logoUrl }).eq("id", data.id);
      }

      resetForm();
      toast({ title: "Parceria adicionada", duration: 2000 });
    } catch (err) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("parcerias").delete().eq("id", id);
    toast({ title: "Parceria removida", duration: 2000 });
  };

  const handleInlineEdit = async (id: string, field: string, value: string) => {
    setParcerias(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    const updatePayload: Record<string, any> = { [field]: value };
    await (supabase as any).from("parcerias").update(updatePayload).eq("id", id);
  };

  const resetForm = () => {
    setForm({ parceiro: "", tipo: "", oferece: "", beneficios: "", contato: "", status: "ativa" });
    setLogoFile(null);
    setLogoPreview(null);
    setShowPanel(false);
    setEditingId(null);
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="space-y-6 transition-page">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-card rounded-xl animate-pulse border border-border" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 transition-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-page-title font-display text-foreground">Parcerias Estratégicas</h1>
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
            <div key={p.id} className="rounded-xl bg-card border border-border p-5 hover-lift group relative">
              <button onClick={() => handleDelete(p.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all hover-only-actions">
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3 mb-3">
                {p.logo_url ? (
                  <img src={p.logo_url} alt={p.parceiro} className="w-10 h-10 object-contain rounded-lg" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">{getInitials(p.parceiro)}</div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{p.parceiro}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "ativa" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>{p.status === "ativa" ? "Ativa" : "Inativa"}</span>
                </div>
              </div>
              {p.oferece && <p className="text-xs text-muted-foreground line-clamp-2">{p.oferece}</p>}
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
                  <td className="px-5 py-3"><input value={p.parceiro} onChange={e => handleInlineEdit(p.id, "parceiro", e.target.value)} className="bg-transparent text-sm text-foreground w-full outline-none" /></td>
                  <td className="px-5 py-3"><input value={p.tipo || ""} onChange={e => handleInlineEdit(p.id, "tipo", e.target.value)} className="bg-transparent text-sm text-muted-foreground w-full outline-none" /></td>
                  <td className="px-5 py-3"><input value={p.oferece || ""} onChange={e => handleInlineEdit(p.id, "oferece", e.target.value)} className="bg-transparent text-sm text-muted-foreground w-full outline-none" /></td>
                  <td className="px-5 py-3"><input value={p.beneficios || ""} onChange={e => handleInlineEdit(p.id, "beneficios", e.target.value)} className="bg-transparent text-sm text-muted-foreground w-full outline-none" /></td>
                  <td className="px-5 py-3"><input value={p.contato || ""} onChange={e => handleInlineEdit(p.id, "contato", e.target.value)} className="bg-transparent text-sm text-muted-foreground w-full outline-none" /></td>
                  <td className="px-5 py-3">
                    <select value={p.status || "ativa"} onChange={e => handleInlineEdit(p.id, "status", e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${p.status === "ativa" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                      <option value="ativa">Ativa</option>
                      <option value="inativa">Inativa</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive transition-colors hover-only-actions"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={resetForm}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-[420px] max-w-full h-full bg-card border-l border-border p-6 space-y-5 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-foreground">Nova Parceria</h3>
              <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Logo</label>
                <div className="flex items-center gap-3">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="w-16 h-16 object-contain rounded-lg border border-border" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-xs">Logo</div>
                  )}
                  <label className="cursor-pointer text-sm text-accent hover:underline">
                    Escolher imagem
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoSelect} />
                  </label>
                </div>
              </div>
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
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground">
                  <option value="ativa">Ativa</option>
                  <option value="inativa">Inativa</option>
                </select>
              </div>
              <button onClick={handleAdd} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParceriasPage;
