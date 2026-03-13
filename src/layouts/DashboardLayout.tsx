import { useEffect } from "react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Target, BarChart3, BookOpen, Handshake, Users, Settings, Fish, Image, ShieldCheck,
  ChevronLeft, ChevronRight, LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logoProativa from "@/assets/logo-proativa.png";

const navItems = [
  { title: "Visão Geral", path: "/dashboard", icon: LayoutDashboard },
  { title: "Planejamento Estratégico", path: "/strategy", icon: Target },
  { title: "Diretorias", path: "/departments", icon: BarChart3 },
  { title: "Identidade do Cardume", path: "/culture", icon: BookOpen },
  { title: "Governança", path: "/governance", icon: ShieldCheck },
  { title: "Parcerias", path: "/crm", icon: Handshake },
  { title: "Galeria", path: "/gallery", icon: Image },
  { title: "Membros", path: "/members", icon: Users },
  { title: "Shark", path: "/shark", icon: Fish },
  { title: "Configurações", path: "/settings", icon: Settings },
];

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full" style={{ "--sidebar-width": collapsed ? "72px" : "256px" } as React.CSSProperties}>
      <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-primary transition-all duration-300 ${collapsed ? "w-[72px]" : "w-64"}`}>
        <div className="flex items-center justify-center px-4 py-6">
          <img src={logoProativa} alt="Proativa Jr" className={`transition-all duration-300 ${collapsed ? "w-10" : "w-20"}`} />
        </div>
        <nav className="flex-1 space-y-1 px-3 mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path} onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                  isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-primary-foreground/70 hover:bg-sidebar-accent hover:text-primary-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </button>
            );
          })}
        </nav>
        <div className="space-y-1 px-3 pb-4">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-foreground/50 hover:text-primary-foreground transition-all duration-300">
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-foreground/50 hover:text-primary-foreground transition-all duration-300">
            {collapsed ? <ChevronRight className="h-5 w-5 shrink-0" /> : <><ChevronLeft className="h-5 w-5 shrink-0" /><span>Recolher</span></>}
          </button>
        </div>
      </aside>
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-[72px]" : "ml-64"}`}>
        <div className="min-h-screen p-8"><Outlet /></div>
      </main>
    </div>
  );
};

export default DashboardLayout;
