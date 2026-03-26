import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Target, BookOpen, Image, Users, Settings, Fish,
  ChevronLeft, ChevronRight, ChevronDown, LogOut, Crown, Award, Briefcase, ShoppingCart,
  Grid3X3, FileText, Handshake, DollarSign, UserCheck, Megaphone, Lightbulb, BarChart3, TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logoProativa from "@/assets/logo-proativa.png";

interface SubItem {
  title: string;
  path: string;
  icon: any;
}

interface SubGroup {
  title: string;
  icon: any;
  items: SubItem[];
}

const diretorias: SubGroup[] = [
  {
    title: "Presidência",
    icon: Crown,
    items: [
      { title: "MEJ", path: "/presidencia/mej", icon: Target },
      { title: "Relação Institucional", path: "/presidencia/relacao-institucional", icon: FileText },
      { title: "Parcerias", path: "/presidencia/parcerias", icon: Handshake },
      { title: "Financeiro ⚠️", path: "/presidencia/financeiro", icon: DollarSign },
      { title: "Monday Base", path: "/presidencia/monday", icon: Grid3X3 },
    ],
  },
  {
    title: "Vice-Presidência",
    icon: Award,
    items: [
      { title: "Financeiro ⚠️", path: "/vice-presidencia/financeiro", icon: DollarSign },
      { title: "Gente e Gestão", path: "/vice-presidencia/gente-gestao", icon: UserCheck },
      { title: "EndoMarketing", path: "/vice-presidencia/endomarketing", icon: Megaphone },
      { title: "Monday Base VP", path: "/vice-presidencia/monday", icon: Grid3X3 },
    ],
  },
  {
    title: "Projetos",
    icon: Briefcase,
    items: [
      { title: "Projetos", path: "/projetos/lista", icon: Briefcase },
      { title: "Inovação", path: "/projetos/inovacao", icon: Lightbulb },
      { title: "Monday Base Projetos", path: "/projetos/monday", icon: Grid3X3 },
    ],
  },
  {
    title: "Comercial",
    icon: ShoppingCart,
    items: [
      { title: "Monday CRM", path: "/comercial/crm", icon: BarChart3 },
      { title: "Vendas", path: "/comercial/vendas", icon: TrendingUp },
      { title: "Marketing", path: "/comercial/marketing", icon: Megaphone },
      { title: "Monday Base Comercial", path: "/comercial/monday", icon: Grid3X3 },
    ],
  },
];

const topNavItems = [
  { title: "Visão Geral", path: "/dashboard", icon: LayoutDashboard },
];

const bottomNavItems = [
  { title: "Planejamento Estratégico", path: "/strategy", icon: Target },
  { title: "Identidade & Governança", path: "/culture", icon: BookOpen },
  { title: "Galeria", path: "/gallery", icon: Image },
  { title: "Membros", path: "/members", icon: Users },
  { title: "Shark 🦈", path: "/shark", icon: Fish },
  { title: "Configurações", path: "/settings", icon: Settings },
];

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [diretoriasOpen, setDiretoriasOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [loading, user, navigate]);

  // Auto-open the group that contains the current path
  useEffect(() => {
    for (const group of diretorias) {
      if (group.items.some(i => location.pathname === i.path)) {
        setDiretoriasOpen(true);
        setOpenGroups(prev => ({ ...prev, [group.title]: true }));
        break;
      }
    }
  }, [location.pathname]);

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

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (path: string) => location.pathname === path;

  const sidebarWidth = collapsed ? "72px" : "280px";

  return (
    <div className="flex min-h-screen w-full" style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar transition-all duration-300 overflow-hidden`}
        style={{ width: sidebarWidth }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center px-4 py-5">
          <img
            src={logoProativa}
            alt="Proativa Jr"
            className={`transition-all duration-300 ${collapsed ? "w-10" : "w-16"}`}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-2">
          {/* Top nav items */}
          {topNavItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-nav-item font-medium transition-all duration-150 ${
                isActive(item.path)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </button>
          ))}

          {/* Diretorias Accordion */}
          {!collapsed && (
            <div className="pt-3">
              <button
                onClick={() => setDiretoriasOpen(!diretoriasOpen)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-section-label uppercase text-sidebar-foreground/60"
              >
                <span>Diretorias</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${diretoriasOpen ? "rotate-180" : ""}`} />
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${diretoriasOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
                {diretorias.map((group) => (
                  <div key={group.title} className="mt-0.5">
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-nav-item font-semibold text-sidebar-foreground/90 hover:bg-sidebar-accent transition-all duration-150"
                    >
                      <group.icon className="h-4.5 w-4.5 shrink-0" />
                      <span className="flex-1 text-left">{group.title}</span>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${openGroups[group.title] ? "rotate-180" : ""}`} />
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ${openGroups[group.title] ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                      {group.items.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 ml-4 text-[13px] transition-all duration-150 ${
                            isActive(item.path)
                              ? "text-sidebar-primary-foreground bg-sidebar-primary border-l-2 border-sidebar-primary-foreground"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          }`}
                        >
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

          {/* Collapsed diretorias icon */}
          {collapsed && (
            <button
              onClick={() => { setCollapsed(false); setDiretoriasOpen(true); }}
              className="flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sidebar-foreground/80 hover:bg-sidebar-accent transition-all duration-150"
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
          )}

          {/* Separator */}
          {!collapsed && <div className="my-2 mx-3 border-t border-sidebar-border/30" />}

          {/* Bottom nav items */}
          {bottomNavItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-nav-item font-medium transition-all duration-150 ${
                isActive(item.path)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="space-y-0.5 px-3 pb-4 border-t border-sidebar-border/30 pt-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-nav-item font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-nav-item font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-150"
          >
            {collapsed ? <ChevronRight className="h-5 w-5 shrink-0" /> : <><ChevronLeft className="h-5 w-5 shrink-0" /><span>Recolher</span></>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 transition-all duration-300" style={{ marginLeft: sidebarWidth }}>
        <div className="min-h-screen p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
