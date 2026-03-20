import { useEffect } from "react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Target, BarChart3, BookOpen, Handshake, Users, Settings, Fish, Image,
  ChevronLeft, ChevronRight, LogOut, Columns3,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logoProativa from "@/assets/logo-proativa.png";

const navItems = [
  { title: "Visão Geral", path: "/dashboard", icon: LayoutDashboard, multiLine: false },
  { title: "Planejamento Estratégico", path: "/strategy", icon: Target, multiLine: false },
  { title: "Diretorias", path: "/departments", icon: BarChart3, multiLine: false },
  { title: "Identidade do Cardume &\nGovernança", path: "/culture", icon: BookOpen, multiLine: true },
  { title: "Parcerias", path: "/crm", icon: Handshake, multiLine: false },
  { title: "Galeria", path: "/gallery", icon: Image, multiLine: false },
  { title: "Membros", path: "/members", icon: Users, multiLine: false },
  { title: "Shark", path: "/shark", icon: Fish, multiLine: false },
  { title: "Gestão (Monday)", path: "/monday", icon: Columns3, multiLine: false },
  { title: "Configurações", path: "/settings", icon: Settings, multiLine: false },
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

  const handleNavClick = (path: string) => {
    // Handle hash navigation for governance
    if (path.includes("#")) {
      const [basePath, hash] = path.split("#");
      if (location.pathname === basePath) {
        // Already on the page, just scroll
        const el = document.getElementById(hash);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        navigate(`${basePath}#${hash}`);
      }
    } else {
      navigate(path);
    }
  };

  const isActive = (itemPath: string) => {
    const basePath = itemPath.split("#")[0];
    return location.pathname === basePath;
  };

  return (
    <div className="flex min-h-screen w-full" style={{ "--sidebar-width": collapsed ? "72px" : "256px" } as React.CSSProperties}>
      <aside className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-primary transition-all duration-300 ${collapsed ? "w-[72px]" : "w-64"}`}>
        <div className="flex items-center justify-center px-4 py-6">
          <img src={logoProativa} alt="Proativa Jr" className={`transition-all duration-300 ${collapsed ? "w-10" : "w-20"}`} />
        </div>
        <nav className="flex-1 space-y-1 px-3 mt-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path} onClick={() => handleNavClick(item.path)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                  active ? "bg-sidebar-accent text-sidebar-primary" : "text-primary-foreground/70 hover:bg-sidebar-accent hover:text-primary-foreground"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  item.multiLine ? (
                    <span className="text-left leading-tight">
                      <span className="block">Identidade do Cardume &</span>
                      <span className="block">Governança</span>
                    </span>
                  ) : (
                    <span className="truncate">{item.title}</span>
                  )
                )}
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
