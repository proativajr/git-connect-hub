import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import logoIcon from "@/assets/logo-icon.png";
import logoText from "@/assets/logo-text.png";

const Login = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const isDark = theme === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { data: allowed } = await (supabase as any)
          .from("allowed_emails").select("id").eq("email", email.toLowerCase().trim()).maybeSingle();
        if (!allowed) {
          toast({ title: "Acesso negado", description: "Seu e-mail não foi autorizado pela diretoria.", variant: "destructive" });
          return;
        }
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
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

  // Theme-dependent styles for the right panel
  const rightPanelBg = isDark ? "#c9a84c" : "#021f3f";
  const headingColor = isDark ? "#111111" : "#ffffff";
  const subColor = isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)";
  const inputBg = isDark ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.08)";
  const inputBorder = isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)";
  const inputColor = isDark ? "#111111" : "#ffffff";
  const placeholderColor = isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
  const btnBg = isDark ? "#111111" : "#f5c400";
  const btnColor = isDark ? "#c9a84c" : "#021f3f";
  const linkColor = isDark ? "#111111" : "#f5c400";

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — solid matte gold */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative" style={{ backgroundColor: "#c9a84c" }}>
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <img src={logoIcon} alt="Proativa Jr" className="h-16 mb-6 rounded-xl" />
          <img src={logoText} alt="Proativa Jr" className="w-56 mb-6" />
          <p className="text-[22px] font-display font-semibold" style={{ color: "#111111" }}>Torre de Controle</p>
          <p className="text-[15px] mt-2 max-w-sm leading-relaxed" style={{ color: "rgba(0,0,0,0.6)" }}>
            Centralize KPIs, projetos e parcerias em um só lugar.
          </p>
        </div>
      </div>

      {/* Right Panel — theme-reactive */}
      <div className="flex-1 flex items-center justify-center px-6" style={{ backgroundColor: rightPanelBg }}>
        <div className="w-full max-w-md">
          {/* Mobile compact header */}
          <div className="lg:hidden flex flex-col items-center justify-center mb-8 rounded-xl py-6" style={{ backgroundColor: "#c9a84c" }}>
            <img src={logoIcon} alt="Proativa Jr" className="h-12 mb-3 rounded-xl" />
            <img src={logoText} alt="Proativa Jr" className="w-44" />
          </div>

          <h1 className="text-[20px] font-display font-semibold mb-1" style={{ color: headingColor }}>
            {isSignUp ? "Criar Conta" : "Bem-vindo de volta"}
          </h1>
          <p className="text-sm mb-8" style={{ color: subColor }}>
            {isSignUp ? "Cadastre-se na Torre de Controle" : "Faça login para continuar"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: headingColor }}>E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: subColor }} />
                <input type="email" required placeholder="seu@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all h-[44px]"
                  style={{
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    color: inputColor,
                    ["--tw-placeholder-color" as any]: placeholderColor,
                  }}
                />
                <style>{`
                  input::placeholder { color: ${placeholderColor} !important; }
                `}</style>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: headingColor }}>Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: subColor }} />
                <input type="password" required placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all h-[44px]"
                  style={{
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    color: inputColor,
                  }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-lg py-3 text-sm font-semibold hover:opacity-90 transition-all duration-150 disabled:opacity-50 h-[44px]"
              style={{ backgroundColor: btnBg, color: btnColor }}>
              {loading ? "Aguarde..." : isSignUp ? "Criar Conta" : "Entrar na Torre"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: subColor }}>
            {isSignUp ? "Já tem conta?" : "Não tem conta?"}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium hover:underline" style={{ color: linkColor }}>
              {isSignUp ? "Entrar" : "Criar conta"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
