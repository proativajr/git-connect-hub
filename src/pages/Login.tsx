import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logoIcon from "@/assets/logo-icon.png";
import logoText from "@/assets/logo-text.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        // Check allowlist before signup
        const { data: allowed } = await supabase
          .from("allowed_emails")
          .select("id")
          .eq("email", email.toLowerCase().trim())
          .maybeSingle();
        if (!allowed) {
          toast({ title: "Acesso negado", description: "Seu e-mail não foi autorizado pela diretoria.", variant: "destructive" });
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: "Conta criada!", description: "Verifique seu e-mail para confirmar o cadastro." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary opacity-80" />
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <div className="mb-8 flex flex-col items-center">
            <img src={logoIcon} alt="Proativa Jr" className="w-32 mb-4 rounded-2xl" />
            <img src={logoText} alt="Proativa Jr" className="w-56" />
          </div>
          <p className="text-primary-foreground/80 text-lg font-light max-w-sm leading-relaxed">
            Torre de Controle — Centralize KPIs, projetos e parcerias em um só lugar.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex flex-col items-center justify-center mb-8">
            <img src={logoIcon} alt="Proativa Jr" className="w-28 mb-3 rounded-xl" />
            <img src={logoText} alt="Proativa Jr" className="w-44" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">
            {isSignUp ? "Criar Conta" : "Bem-vindo de volta"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isSignUp ? "Cadastre-se na Torre de Controle" : "Entre na Torre de Controle"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email" required placeholder="seu@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password" required placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Aguarde..." : isSignUp ? "Criar Conta" : "Entrar na Torre"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? "Já tem conta?" : "Não tem conta?"}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-accent font-medium hover:underline">
              {isSignUp ? "Entrar" : "Criar conta"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
