import { useState } from "react";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PartnerForm {
  id?: string;
  name: string;
  tag: string;
  stage: string;
  email: string;
}

const columns = [
  { key: "cold", title: "Frias", subtitle: "Prospecção" },
  { key: "warm", title: "Mornas", subtitle: "Negociação" },
  { key: "hot", title: "Quentes", subtitle: "Fechamento" },
];

const emptyForm: PartnerForm = { name: "", tag: "", stage: "cold", email: "" };

const CRM = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<PartnerForm>(emptyForm);

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("partners").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async (f: PartnerForm) => {
      if (f.id) {
        const { error } = await supabase.from("partners").update({ name: f.name, email: f.email, tag: f.tag, stage: f.stage }).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("partners").insert({ name: f.name, email: f.email, tag: f.tag, stage: f.stage });
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["partners"] }); toast({ title: "Salvo!" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("partners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["partners"] }); toast({ title: "Removido!" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const openAdd = () => { setEditing(false); setForm({ ...emptyForm }); setShowForm(true); };
  const openEdit = (p: any) => { setEditing(true); setForm({ id: p.id, name: p.name, email: p.email, tag: p.tag, stage: p.stage }); setShowForm(true); };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Parcerias</h1>
          <p className="text-muted-foreground mt-1">Pipeline de relacionamentos comerciais</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all duration-300">
          <Plus className="h-4 w-4" /> Nova Parceria
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map(col => {
          const items = partners.filter((p: any) => p.stage === col.key);
          return (
            <div key={col.key} className="rounded-xl bg-muted/50 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
                  <p className="text-xs text-muted-foreground">{col.subtitle}</p>
                </div>
                <span className="text-xs font-bold bg-card rounded-full px-2.5 py-1 text-muted-foreground shadow-sm">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map((partner: any) => (
                  <div key={partner.id} className="rounded-lg bg-card p-4 shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-sm font-medium text-card-foreground">{partner.name}</p>
                    <span className="inline-block mt-2 text-xs font-medium bg-accent/10 text-accent-foreground rounded-md px-2 py-0.5">{partner.tag}</span>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <button onClick={() => openEdit(partner)} className="text-muted-foreground hover:text-foreground transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setDeleteId(partner.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar Parceria" : "Nova Parceria"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Nome</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>E-mail</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Tag</Label><Input value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} placeholder="Ex: Tecnologia, Financeiro" /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.stage} onValueChange={v => setForm({ ...form, stage: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cold">Fria — Prospecção</SelectItem>
                  <SelectItem value="warm">Morna — Negociação</SelectItem>
                  <SelectItem value="hot">Quente — Fechamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button onClick={() => { upsert.mutate(form); setShowForm(false); }} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">Salvar</button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tem certeza que deseja remover esta parceria?</p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setDeleteId(null)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-card-foreground hover:bg-muted transition-all">Cancelar</button>
            <button onClick={() => { if (deleteId) { remove.mutate(deleteId); setDeleteId(null); } }} className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground hover:opacity-90 transition-all">Excluir</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRM;
