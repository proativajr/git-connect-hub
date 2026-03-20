import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Strategy from "./pages/Strategy";
import Departments from "./pages/Departments";
import Culture from "./pages/Culture";

import CRM from "./pages/CRM";
import Gallery from "./pages/Gallery";

import Members from "./pages/Members";
import Settings from "./pages/Settings";
import Shark from "./pages/Shark";
import Monday from "./pages/Monday";
import NotFound from "./pages/NotFound";
import SharkChat from "./components/SharkChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/strategy" element={<Strategy />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/culture" element={<Culture />} />
              
              <Route path="/crm" element={<CRM />} />
              <Route path="/gallery" element={<Gallery />} />
              
              <Route path="/members" element={<Members />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/shark" element={<Shark />} />
            </Route>
            <Route path="/monday" element={<Monday />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SharkChat />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
