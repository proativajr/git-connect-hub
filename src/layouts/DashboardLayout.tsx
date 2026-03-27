import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Target, BookOpen, Image, Users, Settings, Fish,
  ChevronLeft, ChevronRight, ChevronDown, LogOut, Crown, Award, Briefcase, ShoppingCart,
  Grid3X3, FileText, Handshake, DollarSign, UserCheck, Megaphone, Lightbulb, BarChart3, TrendingUp, Menu, X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import logoProativa from "@/assets/logo-proativa.png";

const OrgChartIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="9" cy="3" r="2" /><circle cx="4" cy="14" r="2" /><circle cx="14" cy="14" r="2" />
    <line x1="9" y1="5" x2="9" y2="9" /><line x1="4" y1="9" x2="14" y2="9" /><line x1="4" y1="9" x2="4" y2="12" /><line x1="14" y1="9" x2="14" y2="12" />
  </svg>
);

interface SubItem { title: string; path: string; icon: any; }
interface SubGroup { title: string; icon: any; items: SubItem[]; }

const diretorias: SubGroup[] = [
  { title: "Presidência", icon: Crown, items: [
    { title: "MEJ", path: "/presidencia/mej", icon: Target },
    { title: "Relação Institucional", path: "/presidencia/relacao-institucional", icon: FileText },
    { title: "Parcerias", path: "/presidencia/parcerias", icon: Handshake },
    { title: "Financeiro", path: "/presidencia/financeiro", icon: DollarSign },
    { title: "Monday - Presidência", path: "/presidencia/monday", icon: Grid3X3 },
  ]},
  { title: "Vice-Presidência", icon: Award, items: [
    { title: "Financeiro", path: "/vice-presidencia/financeiro", icon: DollarSign },
    { title: "Gente e Gestão", path: "/vice-presidencia/gente-gestao", icon: UserCheck },
    { title: "EndoMarketing", path: "/vice-presidencia/endomarketing", icon: Megaphone },
    { title: "Monday - VP", path: "/vice-presidencia/monday", icon: Grid3X3 },
  ]},
  { title: "Projetos", icon: Briefcase, items: [
    { title: "Projetos", path: "/projetos/lista", icon: Briefcase },
    { title: "Inovação", path: "/projetos/inovacao", icon: Lightbulb },
    { title: "Monday - Projetos", path: "/projetos/monday", icon: Grid3X3 },
  ]},
  { title: "Comercial", icon: ShoppingCart, items: [
    { title: "Monday CRM", path: "/comercial/crm", icon: BarChart3 },
    { title: "Vendas", path: "/comercial/vendas", icon: TrendingUp },
    { title: "Marketing", path: "/comercial/marketing", icon: Megaphone },
    { title: "Monday - Comercial", path: "/comercial/monday", icon: Grid3X3 },
  ]},
];

const topNavItems = [{ title: "Visão Geral", path: "/dashboard", icon: LayoutDashboard }];

const bottomNavItems = [
  { title: "Planejamento Estratégico", path: "/strategy", icon: Target },
  { title: "Identidade & Governança", path: "/culture", icon: BookOpen },
  { title: "Galeria", path: "/gallery", icon: Image },
  { title: "Membros", path: "/members", icon: Users },
  { title: "Shark", path: "/shark", icon: Fish },
  { title: "Configurações", path: "/settings", icon: Settings },
];

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [diretoriasOpen, setDiretoriasOpen] = useState(false);
  const [activeDirectory, setActiveDirectory] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { theme } = useTheme();

  useEffect(() => { if (!loading && !user) navigate("/"); }, [loading, user, navigate]);

  useEffect(() => {
    for (const group of diretorias) {
      if (group.items.some(i => location.pathname === i.path)) {
        setDiretoriasOpen(true);
        setActiveDirectory(group.title);
        break;
      }
    }
  }, [location.pathname]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>;
  if (!user) return null;

  const handleLogout = async () => { await signOut(); navigate("/"); };
  const toggleDirectory = (title: string) => setActiveDirectory(prev => prev === title ? null : title);
  const isActive = (path: string) => location.pathname === path;
  const sidebarWidth = collapsed ? "64px" : "260px";

  const navContent = (
    <>
      <div className="flex items-center justify-center px-4 py-5">
        <img src={logoProativa} alt="Proativa Jr" className={`transition-all duration-300 ${collapsed ? "w-8" : "w-14"}`} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-2">
        {topNavItems.map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-nav-item font-medium transition-all duration-150 ${
              isActive(item.path) ? "bg-accent/20 text-accent border-l-[3px] border-accent" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            }`}>
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </button>
        ))}

        {!collapsed && (
          <div className="pt-5">
            <p className="px-3 mb-2 text-section-label uppercase text-accent">Diretorias</p>
            <button onClick={() => setDiretoriasOpen(!diretoriasOpen)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-nav-item font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent transition-all">
              <OrgChartIcon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1 text-left">Diretorias</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${diretoriasOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${diretoriasOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
              {diretorias.map(group => (
                <div key={group.title} className="mt-0.5">
                  <button onClick={() => toggleDirectory(group.title)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-nav-item font-semibold text-sidebar-foreground/90 hover:bg-sidebar-accent transition-all">
                    <group.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{group.title}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeDirectory === group.title ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${activeDirectory === group.title ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                    {group.items.map(item => (
                      <button key={item.path} onClick={() => navigate(item.path)}
                        className={`flex w-full items-center gap-2.5 rounded-md pl-10 pr-3 py-2 text-[13px] transition-all duration-150 ${
                          isActive(item.path) ? "text-accent bg-accent/20 border-l-[3px] border-accent" : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        }`}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {collapsed && (
          <button onClick={() => { setCollapsed(false); setDiretoriasOpen(true); }}
            className="flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sidebar-foreground/70 hover:bg-sidebar-accent transition-all">
            <OrgChartIcon className="h-5 w-5" />
          </button>
        )}

        {!collapsed && <div className="my-3 mx-3 border-t border-sidebar-border/30" />}
        {!collapsed && <p className="px-3 mb-2 text-section-label uppercase text-accent">Planejamento</p>}

        {bottomNavItems.map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-nav-item font-medium transition-all duration-150 ${
              isActive(item.path) ? "bg-accent/20 text-accent border-l-[3px] border-accent" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            }`}>
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </button>
        ))}
      </nav>

      <div className="space-y-0.5 px-3 pb-4 border-t border-sidebar-border/30 pt-2">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-nav-item font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all">
          <LogOut className="h-5 w-5 shrink-0" />{!collapsed && <span>Sair</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-nav-item font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all">
          {collapsed ? <ChevronRight className="h-5 w-5 shrink-0" /> : <><ChevronLeft className="h-5 w-5 shrink-0" /><span>Recolher</span></>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile top bar */}
      <div className="sm:hidden fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4 bg-sidebar border-b border-sidebar-border">
        <button onClick={() => setMobileOpen(true)} className="text-accent"><Menu className="h-6 w-6" /></button>
        <img src={logoProativa} alt="Proativa" className="h-8" />
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-bold">
          {(user?.email || "U")[0].toUpperCase()}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-[280px] h-full bg-sidebar flex flex-col overflow-y-auto">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-sidebar-foreground/60"><X className="h-5 w-5" /></button>
            {navContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden sm:flex fixed inset-y-0 left-0 z-30 flex-col bg-sidebar transition-all duration-300 overflow-hidden" style={{ width: sidebarWidth }}>
        {navContent}
      </aside>

      {/* Main content */}
      <main className="flex-1 transition-all duration-300 sm:ml-[var(--sw)] mt-14 sm:mt-0" style={{ "--sw": sidebarWidth } as React.CSSProperties}>
        <div className="min-h-screen p-4 sm:p-8 max-w-[1400px] mx-auto">
          <Outlet key={location.pathname} />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
