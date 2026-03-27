import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

interface FinanceiroEntry {
  id: string;
  categoria: string;
  tipo: "Receita" | "Despesa";
  descricao: string;
  valor: number;
  data: string;
  status: "Confirmado" | "Pendente";
}

interface FinanceiroContextType {
  entries: FinanceiroEntry[];
  addEntry: (entry: Omit<FinanceiroEntry, "id">) => void;
  updateEntry: (id: string, updates: Partial<FinanceiroEntry>) => void;
  removeEntry: (id: string) => void;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

const STORAGE_KEY = "proativa_financeiro_v2";

const defaultEntries: FinanceiroEntry[] = [
  { id: "1", categoria: "Projetos", tipo: "Receita", descricao: "Projeto Alpha", valor: 5200, data: "2026-01-15", status: "Confirmado" },
  { id: "2", categoria: "Operacional", tipo: "Despesa", descricao: "Aluguel coworking", valor: 800, data: "2026-01-20", status: "Confirmado" },
  { id: "3", categoria: "Projetos", tipo: "Receita", descricao: "Projeto Beta", valor: 3500, data: "2026-02-10", status: "Confirmado" },
  { id: "4", categoria: "Infraestrutura", tipo: "Despesa", descricao: "Material escritório", valor: 350, data: "2026-02-15", status: "Pendente" },
  { id: "5", categoria: "Projetos", tipo: "Receita", descricao: "Consultoria Gamma", valor: 7200, data: "2026-03-05", status: "Confirmado" },
  { id: "6", categoria: "Marketing", tipo: "Despesa", descricao: "Marketing digital", valor: 1200, data: "2026-03-10", status: "Pendente" },
];

const getStored = (): FinanceiroEntry[] => {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : defaultEntries;
  } catch { return defaultEntries; }
};

const FinanceiroContext = createContext<FinanceiroContextType>({
  entries: [], addEntry: () => {}, updateEntry: () => {}, removeEntry: () => {},
  totalReceitas: 0, totalDespesas: 0, saldo: 0,
});

export const FinanceiroProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<FinanceiroEntry[]>(getStored);

  const persist = useCallback((next: FinanceiroEntry[]) => {
    setEntries(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    toast({ title: "Alterações salvas", duration: 2000 });
  }, []);

  const addEntry = useCallback((entry: Omit<FinanceiroEntry, "id">) => {
    persist([...getStored(), { ...entry, id: crypto.randomUUID() }]);
  }, [persist]);

  const updateEntry = useCallback((id: string, updates: Partial<FinanceiroEntry>) => {
    persist(getStored().map(e => e.id === id ? { ...e, ...updates } : e));
  }, [persist]);

  const removeEntry = useCallback((id: string) => {
    persist(getStored().filter(e => e.id !== id));
  }, [persist]);

  const totalReceitas = entries.filter(e => e.tipo === "Receita").reduce((s, e) => s + e.valor, 0);
  const totalDespesas = entries.filter(e => e.tipo === "Despesa").reduce((s, e) => s + e.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  return (
    <FinanceiroContext.Provider value={{ entries, addEntry, updateEntry, removeEntry, totalReceitas, totalDespesas, saldo }}>
      {children}
    </FinanceiroContext.Provider>
  );
};

export const useFinanceiro = () => useContext(FinanceiroContext);
