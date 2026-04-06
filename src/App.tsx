import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FinanceiroProvider } from "@/contexts/FinanceiroContext";
import { GenteProvider } from "@/contexts/GenteContext";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Strategy from "./pages/Strategy";
import Culture from "./pages/Culture";
import Gallery from "./pages/Gallery";
import Members from "./pages/Members";
import Settings from "./pages/Settings";
import FinanceiroPage from "./pages/FinanceiroPage";
import VendasPage from "./pages/VendasPage";
import GenteGestaoPage from "./pages/GenteGestaoPage";
import MondayCRMPage from "./pages/MondayCRMPage";
import MondayBoardSupabase from "./pages/MondayBoardSupabase";
import ParceriasPage from "./pages/ParceriasPage";
import ParceriasShowcasePage from "./pages/ParceriasShowcasePage";
import EmDesenvolvimento from "./components/EmDesenvolvimento";
import PasswordGate from "./components/PasswordGate";
import NotFound from "./pages/NotFound";
import SharkChat from "./components/SharkChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <FinanceiroProvider>
          <GenteProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/strategy" element={<Strategy />} />
                    <Route path="/culture" element={<Culture />} />
                    <Route path="/parcerias" element={<ParceriasShowcasePage />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/members" element={<Members />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/gamificacao" element={<EmDesenvolvimento title="Gamificação" />} />

                    {/* Presidência */}
                    <Route path="/presidencia/mej" element={<EmDesenvolvimento title="MEJ" />} />
                    <Route path="/presidencia/relacao-institucional" element={<EmDesenvolvimento />} />
                    <Route path="/presidencia/parcerias" element={<ParceriasPage />} />
                    <Route path="/presidencia/financeiro" element={<PasswordGate sectionKey="pres_financeiro"><FinanceiroPage /></PasswordGate>} />
                    <Route path="/presidencia/monday" element={<MondayBoardSupabase boardId="board_presidencia" title="Monday — Presidência" />} />

                    {/* Vice-Presidência */}
                    <Route path="/vice-presidencia/financeiro" element={<PasswordGate sectionKey="vp_financeiro"><FinanceiroPage /></PasswordGate>} />
                    <Route path="/vice-presidencia/gente-gestao" element={<PasswordGate sectionKey="gente_gestao"><GenteGestaoPage /></PasswordGate>} />
                    <Route path="/vice-presidencia/endomarketing" element={<EmDesenvolvimento />} />
                    <Route path="/vice-presidencia/monday" element={<MondayBoardSupabase boardId="board_vp" title="Monday — Vice-Presidência" />} />

                    {/* Projetos */}
                    <Route path="/projetos/lista" element={<EmDesenvolvimento title="Projetos" />} />
                    <Route path="/projetos/inovacao" element={<EmDesenvolvimento />} />
                    <Route path="/projetos/monday" element={<MondayBoardSupabase boardId="board_projetos" title="Monday — Projetos" />} />

                    {/* Comercial */}
                    <Route path="/comercial/crm" element={<MondayCRMPage />} />
                    <Route path="/comercial/vendas" element={<VendasPage />} />
                    <Route path="/comercial/marketing" element={<EmDesenvolvimento />} />
                    <Route path="/comercial/monday" element={<MondayBoardSupabase boardId="board_comercial" title="Monday — Comercial" />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <SharkChat />
              </BrowserRouter>
            </TooltipProvider>
          </GenteProvider>
        </FinanceiroProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
