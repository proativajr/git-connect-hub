import { useState } from "react";
import { Pencil, Loader2, ChevronDown, Briefcase, ShoppingCart, Crown, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const DIRECTORIES = [
  {
    key: "projetos",
    name: "Projetos",
    icon: Briefcase,
    subSections: ["Projetos", "Inovação"],
  },
  {
    key: "comercial",
    name: "Comercial",
    icon: ShoppingCart,
    subSections: ["Vendas", "CRM", "Marketing"],
  },
  {
    key: "vice-presidencia",
    name: "Vice-presidência",
    icon: Award,
    subSections: ["Gente e Gestão", "Financeiro", "Endomarketing"],
  },
  {
    key: "presidencia",
    name: "Presidência",
    icon: Crown,
    subSections: ["Financeiro", "Parcerias", "Relação Institucional", "MEJ"],
  },
];

const chartData = [
  { month: "Jan", value: 30 }, { month: "Fev", value: 40 }, { month: "Mar", value: 50 },
  { month: "Abr", value: 45 }, { month: "Mai", value: 60 }, { month: "Jun", value: 55 },
  { month: "Jul", value: 70 }, { month: "Ago", value: 65 },
];

const Departments = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const currentDir = DIRECTORIES[activeTab];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Diretorias & KPIs</h1>
          <p className="text-muted-foreground mt-1">Análise detalhada de performance por setor</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
        {DIRECTORIES.map((dir, i) => {
          const Icon = dir.icon;
          return (
            <button key={dir.key} onClick={() => setActiveTab(i)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 px-3 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === i ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-card-foreground"
              }`}>
              <Icon className="h-4 w-4" />
              {dir.name}
            </button>
          );
        })}
      </div>

      {/* Sub-sections */}
      <Accordion type="multiple" defaultValue={currentDir.subSections} className="space-y-3">
        {currentDir.subSections.map((sub) => (
          <AccordionItem key={sub} value={sub} className="rounded-xl bg-card shadow-sm border-none overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <span className="text-base font-semibold text-card-foreground">{sub}</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5">
              {/* Metrics placeholder */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                {["Meta", "Realizado", "Variação", "Status"].map((label) => (
                  <div key={label} className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xl font-bold text-card-foreground">—</p>
                    <p className="text-xs text-muted-foreground mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="rounded-lg bg-muted/30 p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{sub} — Evolução Mensal</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Departments;
