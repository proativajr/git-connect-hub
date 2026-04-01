import { useEffect, useState, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Target, BookOpen, Image, Users, Settings, Gamepad2,
  ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronR, LogOut, Crown, Award, Briefcase, ShoppingCart,
  Grid3X3, FileText, Handshake, DollarSign, UserCheck, Megaphone, Lightbulb, BarChart3, TrendingUp, Menu, X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import logoProativaColor from "@/assets/logo-proativa.png";
import logoDarkIcon from "@/assets/logo-dark-icon.png";

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

const mainNavItems = [
  { title: "Planejamento Estratégico", path: "/strategy", icon: Target },
  { title: "Identidade & Governança", path: "/culture", icon: BookOpen },
  { title: "Parcerias", path: "/parcerias", icon: Handshake },
  { title: "Galeria", path: "/gallery", icon: Image },
  { title: "Membros", path: "/members", icon: Users },
  { title: "Gamificação", path: "/gamificacao", icon: Gamepad2 },
];

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });
  const [activeDirectory, setActiveDirectory] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const flyoutBtnRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { theme } = useTheme();

  useEffect(() => { if (!loading && !user) navigate("/"); }, [loading, user, navigate]);

  useEffect(() => {
    for (const group of diretorias) {
      if (group.items.some(i => location.pathname === i.path)) {
        setActiveDirectory(group.title);
        return;
      }
    }
  }, [location.pathname]);

  useEffect(() => { setMobileOpen(false); setFlyoutOpen(false); }, [location.pathname]);

  // Close flyout on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node) &&
          flyoutBtnRef.current && !flyoutBtnRef.current.contains(e.target as Node)) {
        setFlyoutOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFlyoutOpen(false); };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("mousedown", handleClick); document.removeEventListener("keydown", handleKey); };
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" /></div>;
  if (!user) return null;

  const handleLogout = async () => { await signOut(); navigate("/"); };
  const toggleDirectory = (title: string) => setActiveDirectory(prev => prev === title ? null : title);
  const isActive = (path: string) => location.pathname === path;
  const isDiretoriaActive = diretorias.some(g => g.items.some(i => location.pathname === i.path));
  const sidebarWidth = collapsed ? "64px" : "260px";

  const handleDiretoriasClick = (e: React.MouseEvent) => {
    if (collapsed) { setCollapsed(false); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setFlyoutPos({ top: rect.top, left: rect.right });
    setFlyoutOpen(!flyoutOpen);
  };

  const navContent = (isMobile = false) => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-center px-4 py-4">
        <img src={theme === 'dark' ? logoDarkIcon : logoProativaColor} alt="Proativa Jr" className={`transition-all duration-300 ${collapsed && !isMobile ? "w-8" : "w-12"}`} />
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {topNavItems.map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 h-9 text-[13px] font-medium transition-all duration-150 ${
              isActive(item.path) ? "bg-accent/20 text-accent border-l-[3px] border-accent" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            }`}>
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {(!collapsed || isMobile) && <span>{item.title}</span>}
          </button>
        ))}

        {(!collapsed || isMobile) && <p className="px-3 mb-1 mt-3.5 text-[10px] uppercase tracking-[0.1em] font-bold text-accent pt-3.5">Diretorias</p>}

        <button
          ref={flyoutBtnRef}
          onClick={handleDiretoriasClick}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 h-9 text-[13px] font-medium transition-all duration-150 ${
            isDiretoriaActive || flyoutOpen ? "bg-accent/20 text-accent" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          }`}>
          <OrgChartIcon className="h-[18px] w-[18px] shrink-0" />
          {(!collapsed || isMobile) && (
            <>
              <span className="flex-1 text-left">Diretorias</span>
              <ChevronR className={`h-3 w-3 transition-transform duration-200 ${flyoutOpen ? "rotate-90" : ""}`} />
            </>
          )}
        </button>

        {/* Mobile: inline accordion for diretorias */}
        {flyoutOpen && isMobile && (
          <div className="pl-2 mt-1 space-y-0.5">
            {diretorias.map(group => (
              <div key={group.title}>
                <button onClick={() => toggleDirectory(group.title)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 h-9 text-[12px] font-semibold transition-all ${
                    activeDirectory === group.title ? "text-accent" : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
                  }`}>
                  <group.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{group.title}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeDirectory === group.title ? "rotate-180" : ""}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-250 ${activeDirectory === group.title ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}>
                  {group.items.map(item => (
                    <button key={item.path} onClick={() => navigate(item.path)}
                      className={`flex w-full items-center gap-2 rounded-md pl-10 pr-3 h-8 text-[11px] transition-all ${
                        isActive(item.path) ? "text-accent bg-accent/20 border-l-[3px] border-accent" : "text-sidebar-foreground/60 hover:bg-sidebar-accent"
                      }`}>
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {(!collapsed || isMobile) && <div className="my-2 mx-3 border-t border-sidebar-border/30" />}
        {(!collapsed || isMobile) && <p className="px-3 mb-1 text-[10px] uppercase tracking-[0.1em] font-bold text-accent pt-3.5">Planejamento</p>}

        {mainNavItems.map(item => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 h-9 text-[13px] font-medium transition-all duration-150 ${
              isActive(item.path) ? "bg-accent/20 text-accent border-l-[3px] border-accent" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            }`}>
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {(!collapsed || isMobile) && <span>{item.title}</span>}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-0.5 px-3 pb-3 border-t border-sidebar-border/30 pt-2">
        <button onClick={() => navigate("/settings")}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 h-9 text-[13px] font-medium transition-all ${
            isActive("/settings") ? "bg-accent/20 text-accent" : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          }`}>
          <Settings className="h-[18px] w-[18px] shrink-0" />{(!collapsed || isMobile) && <span>Configurações</span>}
        </button>
        <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 h-9 text-[13px] font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all">
          <LogOut className="h-[18px] w-[18px] shrink-0" />{(!collapsed || isMobile) && <span>Sair</span>}
        </button>
        {!isMobile && (
          <button onClick={() => setCollapsed(!collapsed)} className="flex w-full items-center gap-2.5 rounded-lg px-3 h-9 text-[13px] font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all">
            {collapsed ? <ChevronRight className="h-[18px] w-[18px] shrink-0" /> : <><ChevronLeft className="h-[18px] w-[18px] shrink-0" /><span>Recolher</span></>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile top bar */}
      <div className="sm:hidden fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4 bg-sidebar border-b border-sidebar-border">
        <button onClick={() => setMobileOpen(true)} className="text-accent"><Menu className="h-6 w-6" /></button>
        <img src={theme === 'dark' ? logoProativaWhite : logoProativaColor} alt="Proativa" className="h-8" />
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
            {navContent(true)}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden sm:flex fixed inset-y-0 left-0 z-30 flex-col bg-sidebar transition-all duration-300" style={{ width: sidebarWidth, overflow: "hidden" }}>
        {navContent(false)}
      </aside>

      {/* Floating flyout for Diretorias (desktop only) */}
      {flyoutOpen && !mobileOpen && (
        <div
          ref={flyoutRef}
          className="fixed z-[100] w-[200px] bg-sidebar border border-sidebar-border rounded-r-[10px] shadow-xl py-2 animate-fade-in"
          style={{ top: flyoutPos.top, left: flyoutPos.left, maxHeight: "70vh", overflowY: "auto" }}
        >
          {diretorias.map(group => (
            <div key={group.title}>
              <button onClick={() => toggleDirectory(group.title)}
                className={`flex w-full items-center gap-2.5 px-4 h-10 text-[13px] font-semibold transition-all ${
                  activeDirectory === group.title ? "text-accent" : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }`}>
                <group.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{group.title}</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activeDirectory === group.title ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-250 ${activeDirectory === group.title ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}>
                {group.items.map(item => (
                  <button key={item.path} onClick={() => { navigate(item.path); setFlyoutOpen(false); }}
                    className={`flex w-full items-center gap-2 pl-10 pr-4 h-9 text-[12px] transition-all ${
                      isActive(item.path) ? "text-accent bg-accent/15 border-l-[3px] border-accent" : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    }`}>
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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
