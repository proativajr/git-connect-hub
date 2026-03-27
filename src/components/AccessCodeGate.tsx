import { useState } from "react";
import { Lock, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Props {
  children: React.ReactNode;
  storageKey: string;
  allowPasswordChange?: boolean;
}

const getCode = (key: string) => localStorage.getItem(`access_code_${key}`) || "1234";
const setCode = (key: string, code: string) => localStorage.setItem(`access_code_${key}`, code);

const AccessCodeGate = ({ children, storageKey, allowPasswordChange = false }: Props) => {
  const [unlocked, setUnlocked] = useState(false);
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError(false);

    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${storageKey}-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all filled
    if (value && index === 3 && next.every(d => d)) {
      const code = next.join("");
      if (code === getCode(storageKey)) {
        setUnlocked(true);
      } else {
        setError(true);
        setTimeout(() => { setDigits(["", "", "", ""]); setError(false); }, 600);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const prev = document.getElementById(`pin-${storageKey}-${index - 1}`);
      prev?.focus();
    }
  };

  const handleConfirm = () => {
    const code = digits.join("");
    if (code.length < 4) return;
    if (code === getCode(storageKey)) {
      setUnlocked(true);
    } else {
      setError(true);
      setTimeout(() => { setDigits(["", "", "", ""]); setError(false); }, 600);
    }
  };

  const handleChangeCode = () => {
    if (currentCode !== getCode(storageKey)) {
      toast({ title: "Código atual incorreto", variant: "destructive" });
      return;
    }
    if (newCode.length < 4) {
      toast({ title: "O novo código deve ter pelo menos 4 dígitos", variant: "destructive" });
      return;
    }
    if (newCode !== confirmCode) {
      toast({ title: "Os códigos não coincidem", variant: "destructive" });
      return;
    }
    setCode(storageKey, newCode);
    setCurrentCode("");
    setNewCode("");
    setConfirmCode("");
    setShowChangeDialog(false);
    toast({ title: "Código de acesso alterado com sucesso" });
  };

  if (unlocked) {
    return (
      <div>
        {allowPasswordChange && (
          <div className="flex justify-end mb-3">
            <button
              onClick={() => setShowChangeDialog(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors"
            >
              <KeyRound className="h-3.5 w-3.5" /> Alterar código de acesso
            </button>
          </div>
        )}
        {children}
        <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
          <DialogContent className="bg-card border-border max-w-sm">
            <DialogHeader><DialogTitle>Alterar Código de Acesso</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div><Label>Código atual</Label><Input type="password" value={currentCode} onChange={e => setCurrentCode(e.target.value)} /></div>
              <div><Label>Novo código</Label><Input type="password" value={newCode} onChange={e => setNewCode(e.target.value)} /></div>
              <div><Label>Confirmar novo código</Label><Input type="password" value={confirmCode} onChange={e => setConfirmCode(e.target.value)} /></div>
              <button onClick={handleChangeCode} className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">
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
      <div className="bg-background-secondary rounded-xl border border-border p-8 max-w-[360px] w-full text-center space-y-6">
        <Lock className="h-8 w-8 text-accent mx-auto" />
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground">Acesso Restrito</h2>
          <p className="text-sm text-muted-foreground mt-1">Digite o código de acesso para continuar</p>
        </div>
        <div className="flex justify-center gap-3">
          {digits.map((d, i) => (
            <input
              key={i}
              id={`pin-${storageKey}-${i}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigitChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-[48px] h-[56px] text-center text-xl font-semibold rounded-lg border bg-card text-foreground outline-none transition-all focus:ring-2 focus:ring-accent ${
                error ? "border-destructive animate-shake" : "border-border"
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleConfirm}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
};

export default AccessCodeGate;
