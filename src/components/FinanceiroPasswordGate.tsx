import { useState } from "react";
import { Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AUTHORIZED_EMAILS = [
  "vp.proativajr@gmail.com",
  "presidencia.proativajr@gmail.com",
];

const STORAGE_KEY = "financeiro_access_password";
const DEFAULT_PASSWORD = "proativanoverde";

const getStoredPassword = () => localStorage.getItem(STORAGE_KEY) || DEFAULT_PASSWORD;
const setStoredPassword = (pw: string) => localStorage.setItem(STORAGE_KEY, pw);

interface Props {
  children: React.ReactNode;
}

const FinanceiroPasswordGate = ({ children }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unlocked, setUnlocked] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Change password state
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const userEmail = user?.email || "";
  const canChangePassword = AUTHORIZED_EMAILS.includes(userEmail);

  const handleUnlock = () => {
    if (password === getStoredPassword()) {
      setUnlocked(true);
      setShowDialog(false);
      setPassword("");
      setError("");
    } else {
      setError("Senha incorreta");
    }
  };

  const handleChangePassword = () => {
    if (newPassword.length < 4) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 4 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    setStoredPassword(newPassword);
    setNewPassword("");
    setConfirmPassword("");
    setShowChangeDialog(false);
    toast({ title: "Senha alterada", description: "A senha de acesso ao Financeiro foi atualizada." });
  };

  if (unlocked) {
    return (
      <div>
        {canChangePassword && (
          <div className="flex justify-end mb-3">
            <Button variant="ghost" size="sm" onClick={() => setShowChangeDialog(true)} className="text-xs gap-1.5 text-muted-foreground">
              <KeyRound className="h-3.5 w-3.5" /> Alterar senha
            </Button>
          </div>
        )}
        {children}

        <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Alterar Senha do Financeiro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nova senha</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha" />
              </div>
              <div className="space-y-2">
                <Label>Confirmar senha</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar" />
              </div>
              <Button onClick={handleChangePassword} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => { setShowDialog(true); setError(""); setPassword(""); }}
        className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <Lock className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-medium">Conteúdo protegido — clique para desbloquear</p>
      </button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" /> Acesso ao Financeiro
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Senha de acesso</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                  placeholder="Digite a senha"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <Button onClick={handleUnlock} className="w-full">Desbloquear</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FinanceiroPasswordGate;
