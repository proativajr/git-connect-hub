import { useState } from "react";
import { Briefcase, ShoppingCart, Crown, Award, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FinanceiroPasswordGate from "@/components/FinanceiroPasswordGate";

const DIRECTORIES = [
  { key: "projetos", name: "Projetos", icon: Briefcase, subSections: ["Projetos", "Inovação"] },
  { key: "comercial", name: "Comercial", icon: ShoppingCart, subSections: ["Vendas", "CRM", "Marketing"] },
  { key: "vice-presidencia", name: "Vice-presidência", icon: Award, subSections: ["Gente e Gestão", "Financeiro", "Endomarketing"] },
  { key: "presidencia", name: "Presidência", icon: Crown, subSections: ["Financeiro", "Parcerias", "Relação Institucional", "MEJ"] },
];

const chartData = [
  { month: "Jan", value: 30 }, { month: "Fev", value: 40 }, { month: "Mar", value: 50 },
  { month: "Abr", value: 45 }, { month: "Mai", value: 60 }, { month: "Jun", value: 55 },
  { month: "Jul", value: 70 }, { month: "Ago", value: 65 },
];

// Dados do fluxo de caixa
const fluxoCaixaData = [
  { month: "Jan", entradas: 5200, saidas: 3800, saldo: 1400 },
  { month: "Fev", entradas: 4800, saidas: 4200, saldo: 600 },
  { month: "Mar", entradas: 6100, saidas: 3500, saldo: 2600 },
  { month: "Abr", entradas: 5500, saidas: 4900, saldo: 600 },
  { month: "Mai", entradas: 7200, saidas: 5100, saldo: 2100 },
  { month: "Jun", entradas: 6800, saidas: 4600, saldo: 2200 },
  { month: "Jul", entradas: 7500, saidas: 5300, saldo: 2200 },
  { month: "Ago", entradas: 8000, saidas: 5800, saldo: 2200 },
];

const gastosCategoria = [
  { name: "Operacional", value: 4500, color: "hsl(var(--primary))" },
  { name: "Marketing", value: 2800, color: "hsl(var(--accent))" },
  { name: "Pessoal", value: 3200, color: "hsl(var(--destructive))" },
  { name: "Infraestrutura", value: 1500, color: "hsl(var(--muted-foreground))" },
];

const transacoesRecentes = [
  { desc: "Pagamento fornecedor A", tipo: "saida", valor: 1200, data: "08/03" },
  { desc: "Receita projeto X", tipo: "entrada", valor: 3500, data: "07/03" },
  { desc: "Aluguel escritório", tipo: "saida", valor: 800, data: "05/03" },
  { desc: "Consultoria Y", tipo: "entrada", valor: 2200, data: "04/03" },
  { desc: "Material de escritório", tipo: "saida", valor: 350, data: "03/03" },
];

const isFinanceiro = (sub: string) => sub === "Financeiro";

const FinanceiroContent = () => (
  <div className="space-y-5">
    {/* Cards resumo */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { label: "Entradas", value: "R$ 8.000", icon: TrendingUp, change: "+12%", positive: true },
        { label: "Saídas", value: "R$ 5.800", icon: TrendingDown, change: "+8%", positive: false },
        { label: "Saldo", value: "R$ 2.200", icon: DollarSign, change: "+5%", positive: true },
        { label: "Total Gastos", value: "R$ 12.000", icon: DollarSign, change: "-3%", positive: true },
      ].map((item) => (
        <div key={item.label} className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between mb-1">
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <span className={`text-xs flex items-center gap-0.5 ${item.positive ? "text-primary" : "text-destructive"}`}>
              {item.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {item.change}
            </span>
          </div>
          <p className="text-xl font-bold text-card-foreground">{item.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
        </div>
      ))}
    </div>

    {/* Fluxo de Caixa */}
    <div className="rounded-lg bg-muted/30 p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Fluxo de Caixa — Evolução Mensal</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={fluxoCaixaData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} formatter={(value: number) => [`R$ ${value.toLocaleString()}`, ""]} />
          <Line type="monotone" dataKey="entradas" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Entradas" />
          <Line type="monotone" dataKey="saidas" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} name="Saídas" />
          <Line type="monotone" dataKey="saldo" stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Saldo" />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Gastos por categoria */}
      <div className="rounded-lg bg-muted/30 p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Gastos por Categoria</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={gastosCategoria} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
              {gastosCategoria.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} formatter={(value: number) => [`R$ ${value.toLocaleString()}`, ""]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Transações recentes */}
      <div className="rounded-lg bg-muted/30 p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Transações Recentes</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Descrição</TableHead>
              <TableHead className="text-xs text-right">Valor</TableHead>
              <TableHead className="text-xs text-right">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transacoesRecentes.map((t, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs py-2">{t.desc}</TableCell>
                <TableCell className={`text-xs py-2 text-right font-medium ${t.tipo === "entrada" ? "text-primary" : "text-destructive"}`}>
                  {t.tipo === "entrada" ? "+" : "-"}R$ {t.valor.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs py-2 text-right text-muted-foreground">{t.data}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
);

const DefaultSubContent = ({ sub }: { sub: string }) => (
  <>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {["Meta", "Realizado", "Variação", "Status"].map((label) => (
        <div key={label} className="rounded-lg bg-muted/50 p-4">
          <p className="text-xl font-bold text-card-foreground">—</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      ))}
    </div>
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
  </>
);

const Departments = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const currentDir = DIRECTORIES[activeTab];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Diretorias</h1>
          <p className="text-muted-foreground mt-1">Análise detalhada de performance por setor</p>
        </div>
      </div>

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

      <Accordion type="multiple" defaultValue={currentDir.subSections} className="space-y-3">
        {currentDir.subSections.map((sub) => (
          <AccordionItem key={sub} value={sub} className="rounded-xl bg-muted border-none overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted-foreground/10 transition-colors">
              <span className="text-base font-semibold text-card-foreground">{sub}</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-5">
              {isFinanceiro(sub) ? <FinanceiroContent /> : <DefaultSubContent sub={sub} />}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Departments;
