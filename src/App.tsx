import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FinanceiroProvider } from "@/contexts/FinanceiroContext";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Strategy from "./pages/Strategy";
import Culture from "./pages/Culture";
import CRM from "./pages/CRM";
import Gallery from "./pages/Gallery";
import Members from "./pages/Members";
import Settings from "./pages/Settings";
import Shark from "./pages/Shark";
import FinanceiroPage from "./pages/FinanceiroPage";
import VendasPage from "./pages/VendasPage";
import GenteGestaoPage from "./pages/GenteGestaoPage";
import MondayCRMPage from "./pages/MondayCRMPage";
import MondayBasePage from "./pages/MondayBasePage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";
import SharkChat from "./components/SharkChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FinanceiroProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/strategy" element={<Strategy />} />
                <Route path="/culture" element={<Culture />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/members" element={<Members />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/shark" element={<Shark />} />

                {/* Presidência */}
                <Route path="/presidencia/mej" element={<PlaceholderPage title="MEJ" description="Metas e objetivos do movimento empresa júnior" />} />
                <Route path="/presidencia/relacao-institucional" element={<PlaceholderPage title="Relação Institucional" description="Gestão de relações institucionais" />} />
                <Route path="/presidencia/parcerias" element={<CRM />} />
                <Route path="/presidencia/financeiro" element={<FinanceiroPage />} />
                <Route path="/presidencia/monday" element={<MondayBasePage title="Monday Base — Presidência" />} />

                {/* Vice-Presidência */}
                <Route path="/vice-presidencia/financeiro" element={<FinanceiroPage />} />
                <Route path="/vice-presidencia/gente-gestao" element={<GenteGestaoPage />} />
                <Route path="/vice-presidencia/endomarketing" element={<PlaceholderPage title="EndoMarketing" description="Comunicação interna e engajamento" />} />
                <Route path="/vice-presidencia/monday" element={<MondayBasePage title="Monday Base — Vice-Presidência" />} />

                {/* Projetos */}
                <Route path="/projetos/lista" element={<PlaceholderPage title="Projetos" description="Lista de projetos ativos" />} />
                <Route path="/projetos/inovacao" element={<PlaceholderPage title="Inovação" description="Projetos de inovação e pesquisa" />} />
                <Route path="/projetos/monday" element={<MondayBasePage title="Monday Base — Projetos" />} />

                {/* Comercial */}
                <Route path="/comercial/crm" element={<MondayCRMPage />} />
                <Route path="/comercial/vendas" element={<VendasPage />} />
                <Route path="/comercial/marketing" element={<PlaceholderPage title="Marketing" description="Estratégias de marketing e comunicação" />} />
                <Route path="/comercial/monday" element={<MondayBasePage title="Monday Base — Comercial" />} />

                {/* Legacy routes */}
                <Route path="/departments" element={<Dashboard />} />
                <Route path="/crm" element={<CRM />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <SharkChat />
          </BrowserRouter>
        </TooltipProvider>
      </FinanceiroProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
