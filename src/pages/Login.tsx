import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GOOGLE_SCOPES } from "@/hooks/useGoogleToken";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import logoDarkFull from "@/assets/logo-dark-full.png";
import logoColorProativa from "@/assets/logo-color-proativa.png";

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

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: GOOGLE_SCOPES,
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  // Theme colors
  const leftBg = isDark ? "#111111" : "#021f3f";
  const rightBg = isDark ? "#c9a84c" : "#ffffff";
  const dividerColor = isDark ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.15)";
  const torreColor = isDark ? "#c9a84c" : "#ffffff";
  const taglineColor = isDark ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.8)";

  const headingColor = isDark ? "#111111" : "#0d2240";
  const subColor = isDark ? "rgba(0,0,0,0.6)" : "#4a6080";
  const labelColor = isDark ? "#111111" : "#0d2240";
  const inputBg = isDark ? "rgba(0,0,0,0.18)" : "#f4f7fb";
  const inputBorder = isDark ? "rgba(0,0,0,0.25)" : "#dde4ed";
  const inputColor = isDark ? "#111111" : "#0d2240";
  const placeholderColor = isDark ? "rgba(0,0,0,0.45)" : "#9aacbe";
  const iconColor = isDark ? "rgba(0,0,0,0.5)" : "#4a6080";
  const btnBg = isDark ? "#111111" : "#f5c400";
  const btnColor = isDark ? "#c9a84c" : "#021f3f";
  const btnHoverBg = isDark ? "#1a1a1a" : "#e5b600";
  const linkTextColor = isDark ? "rgba(0,0,0,0.65)" : "#4a6080";
  const linkColor = isDark ? "#111111" : "#021f3f";

  const focusRing = isDark
    ? "focus:border-[#111111] focus:shadow-[0_0_0_2px_rgba(0,0,0,0.15)]"
    : "focus:border-[#0d2240] focus:shadow-[0_0_0_2px_rgba(2,31,63,0.12)]";

  return (
    <div className="flex flex-col sm:flex-row min-h-screen">
      {/* LEFT — Logo panel */}
      <div
        className="flex flex-col items-center justify-center sm:w-1/2 h-[160px] sm:h-screen shrink-0"
        style={{ backgroundColor: leftBg, borderRight: `1px solid ${dividerColor}` }}
      >
        <div className="flex flex-col items-center text-center px-8">
          <img
            src={isDark ? logoDarkFull : logoColorProativa}
            alt="Proativa Jr"
            className="h-40 sm:h-[240px] mb-3 sm:mb-6"
          />
          <p
            className="text-[18px] sm:text-[22px] font-display font-semibold"
            style={{ color: torreColor }}
          >
            Torre de Controle
          </p>
          <p
            className="text-[13px] sm:text-[15px] mt-1 sm:mt-2 max-w-sm leading-relaxed"
            style={{ color: taglineColor }}
          >
            Centralize KPIs, projetos e parcerias em um só lugar.
          </p>
        </div>
      </div>

      {/* RIGHT — Form panel */}
      <div
        className="flex-1 flex items-center justify-center px-6 sm:w-1/2"
        style={{ backgroundColor: rightBg }}
      >
        <div className="w-full max-w-md">
          <h1
            className="text-[20px] font-display font-semibold mb-1"
            style={{ color: headingColor, fontWeight: isDark ? 700 : 600 }}
          >
            {isSignUp ? "Criar Conta" : "Bem-vindo de volta"}
          </h1>
          <p className="text-sm mb-8" style={{ color: subColor }}>
            {isSignUp ? "Cadastre-se na Torre de Controle" : "Faça login para continuar"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="text-[13px] font-medium mb-1.5 block"
                style={{ color: labelColor, fontWeight: isDark ? 600 : 500 }}
              >
                E-mail
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: iconColor }}
                />
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-lg pl-10 pr-4 py-3 text-sm outline-none transition-all h-[44px] ${focusRing}`}
                  style={{
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    color: inputColor,
                  }}
                />
              </div>
            </div>

            <div>
              <label
                className="text-[13px] font-medium mb-1.5 block"
                style={{ color: labelColor, fontWeight: isDark ? 600 : 500 }}
              >
                Senha
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: iconColor }}
                />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-lg pl-10 pr-4 py-3 text-sm outline-none transition-all h-[44px] ${focusRing}`}
                  style={{
                    backgroundColor: inputBg,
                    border: `1px solid ${inputBorder}`,
                    color: inputColor,
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-3 text-sm font-semibold transition-all duration-150 disabled:opacity-50 h-[48px]"
              style={{ backgroundColor: btnBg, color: btnColor }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = btnHoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = btnBg)}
            >
              {loading ? "Aguarde..." : isSignUp ? "Criar Conta" : "Entrar na Torre"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: linkTextColor }}>
            {isSignUp ? "Já tem conta?" : "Não tem conta?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium hover:underline"
              style={{
                color: linkColor,
                fontWeight: isDark ? 700 : 600,
                textDecoration: isDark ? "underline" : "none",
              }}
            >
              {isSignUp ? "Entrar" : "Criar conta"}
            </button>
          </p>
        </div>
      </div>

      {/* Placeholder styles */}
      <style>{`
        input::placeholder { color: ${placeholderColor} !important; }
      `}</style>
    </div>
  );
};

export default Login;
