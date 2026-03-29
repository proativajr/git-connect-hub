import { useState } from "react";
import { Lock, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface PasswordGateProps {
  sectionKey: string;
  children: React.ReactNode;
}

const PasswordGate = ({ sectionKey, children }: PasswordGateProps) => {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    try {
      const { data } = await supabase.rpc("verify_access_code", {
        p_section_key: sectionKey,
        p_candidate: password,
      });
      if (data === true) {
        setUnlocked(true);
      } else {
        setError(true);
        setTimeout(() => setError(false), 600);
      }
    } catch {
      setError(true);
      setTimeout(() => setError(false), 600);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 4) {
      toast({ title: "A nova senha deve ter pelo menos 4 caracteres", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    const { data } = await supabase.rpc("update_access_code", {
      p_section_key: sectionKey,
      p_current_code: currentPassword,
      p_new_code: newPassword,
    });
    if (data === true) {
      toast({ title: "Senha alterada com sucesso" });
      setShowChangeDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast({ title: "Senha atual incorreta", variant: "destructive" });
    }
  };

  if (unlocked) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setShowChangeDialog(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent underline-offset-2 hover:underline transition-colors"
          >
            <KeyRound className="h-3.5 w-3.5" /> Alterar senha
          </button>
        </div>
        {children}
        <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
          <DialogContent className="bg-card border-border max-w-sm">
            <DialogHeader><DialogTitle>Alterar Senha de Acesso</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Senha atual</Label><Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></div>
              <div><Label>Nova senha</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
              <div><Label>Confirmar nova senha</Label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
              <button onClick={handleChangePassword} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">
                Salvar
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-8 max-w-[380px] w-full text-center space-y-6">
        <Lock className="h-7 w-7 text-accent mx-auto" />
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">Acesso Restrito</h2>
          <p className="text-sm text-muted-foreground mt-1">Digite a senha de acesso para continuar</p>
        </div>
        <div className="space-y-2">
          <input
            type="password"
            placeholder="Digite a senha de acesso"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false); }}
            className={`w-full h-[44px] rounded-lg border bg-background px-3 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-accent ${
              error ? "border-destructive animate-shake" : "border-border"
            }`}
          />
          {error && <p className="text-xs text-destructive">Senha incorreta</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? "Verificando..." : "Confirmar"}
        </button>
      </form>
    </div>
  );
};

export default PasswordGate;
