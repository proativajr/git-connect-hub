import { useState, useRef } from "react";
import { Plus, Upload, Pencil, Trash2, Loader2, Mail, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface MemberForm {
  id?: string;
  name: string;
  role: string;
  email: string;
  squad: string;
}

const emptyForm: MemberForm = { name: "", role: "", email: "", squad: "" };

const Members = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [newAllowedEmail, setNewAllowedEmail] = useState("");

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("members").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async (f: MemberForm) => {
      if (f.id) {
        const { error } = await supabase.from("members").update({ name: f.name, role: f.role, email: f.email, squad: f.squad }).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("members").insert({ name: f.name, role: f.role, email: f.email, squad: f.squad });
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["members"] }); toast({ title: "Salvo!" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["members"] }); toast({ title: "Removido!" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const bulkInsert = useMutation({
    mutationFn: async (items: MemberForm[]) => {
      const { error } = await supabase.from("members").insert(items.map(i => ({ name: i.name, role: i.role, email: i.email, squad: i.squad })));
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["members"] }); toast({ title: "CSV importado!" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  // Allowlist queries & mutations
  const { data: allowedEmails = [] } = useQuery({
    queryKey: ["allowed_emails"],
    queryFn: async () => {
      const { data, error } = await supabase.from("allowed_emails").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles_emails"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Get registered emails from members table to cross-reference
  const registeredEmails = new Set(members.map((m: any) => m.email?.toLowerCase()));
  const pendingEmails = allowedEmails.filter((ae: any) => !registeredEmails.has(ae.email?.toLowerCase()));

  const addAllowedEmail = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.from("allowed_emails").insert({ email: email.toLowerCase().trim() });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["allowed_emails"] }); toast({ title: "E-mail autorizado!" }); setNewAllowedEmail(""); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const revokeAllowedEmail = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("allowed_emails").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["allowed_emails"] }); toast({ title: "Permissão revogada!" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const openAdd = () => { setEditing(false); setForm({ ...emptyForm }); setShowForm(true); };
  const openEdit = (m: any) => { setEditing(true); setForm({ id: m.id, name: m.name, role: m.role, email: m.email, squad: m.squad }); setShowForm(true); };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").slice(1).filter(l => l.trim());
      const newMembers: MemberForm[] = lines.map(line => {
        const [name, role, email, squad] = line.split(",").map(s => s.trim());
        return { name: name || "", role: role || "", email: email || "", squad: squad || "" };
      });
      if (newMembers.length > 0) bulkInsert.mutate(newMembers);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Membros</h1>
          <p className="text-muted-foreground mt-1">Gestão do corpo diretivo e consultores</p>
        </div>
        <div className="flex gap-3">
          <input type="file" accept=".csv" ref={fileRef} className="hidden" onChange={handleCSV} />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted transition-all duration-300">
            <Upload className="h-4 w-4" /> Importar CSV
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all duration-300">
            <Plus className="h-4 w-4" /> Adicionar Membro
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Nome</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Cargo</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">E-mail</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Squad</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m: any, i: number) => (
                <tr key={m.id} className={`hover:bg-muted/50 transition-colors ${i < members.length - 1 ? "border-b border-border" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                        {m.name.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <span className="text-sm font-medium text-card-foreground">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{m.role}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{m.email}</td>
                  <td className="px-6 py-4"><span className="text-xs font-medium bg-accent/10 text-accent-foreground rounded-md px-2.5 py-1">{m.squad}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(m)} className="text-muted-foreground hover:text-foreground transition-colors"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(m.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Allowlist Section */}
      {isAdmin && (
        <div className="rounded-xl bg-card shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Autorizar Novo Acesso</h2>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={newAllowedEmail}
                onChange={e => setNewAllowedEmail(e.target.value)}
                className="pl-10"
              />
            </div>
            <button
              onClick={() => { if (newAllowedEmail.trim()) addAllowedEmail.mutate(newAllowedEmail); }}
              disabled={!newAllowedEmail.trim() || addAllowedEmail.isPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Mail className="h-4 w-4" /> Autorizar E-mail
            </button>
          </div>

          {pendingEmails.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">E-mails Pendentes de Cadastro</h3>
              <div className="space-y-2">
                {pendingEmails.map((ae: any) => (
                  <div key={ae.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5">
                    <span className="text-sm text-card-foreground">{ae.email}</span>
                    <button
                      onClick={() => revokeAllowedEmail.mutate(ae.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar Membro" : "Adicionar Membro"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Nome</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Cargo</Label><Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></div>
            <div><Label>E-mail</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Squad</Label><Input value={form.squad} onChange={e => setForm({ ...form, squad: e.target.value })} /></div>
            <button onClick={() => { upsert.mutate(form); setShowForm(false); }} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">Salvar</button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tem certeza que deseja remover este membro?</p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setDeleteId(null)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-card-foreground hover:bg-muted transition-all">Cancelar</button>
            <button onClick={() => { if (deleteId) { remove.mutate(deleteId); setDeleteId(null); } }} className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground hover:opacity-90 transition-all">Excluir</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Members;
