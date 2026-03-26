import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface FinanceiroEntry {
  id: string;
  description: string;
  category: string;
  type: "Receita" | "Despesa";
  value: number;
  date: string;
  notes: string;
}

interface FinanceiroContextType {
  entries: FinanceiroEntry[];
  addEntry: (entry: Omit<FinanceiroEntry, "id">) => void;
  updateEntry: (id: string, entry: Partial<FinanceiroEntry>) => void;
  removeEntry: (id: string) => void;
  balance: number;
}

const STORAGE_KEY = "proativa_financeiro_data";

const getStored = (): FinanceiroEntry[] => {
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : defaultEntries;
  } catch { return defaultEntries; }
};

const defaultEntries: FinanceiroEntry[] = [
  { id: "1", description: "Projeto Alpha", category: "Projetos", type: "Receita", value: 5200, date: "2026-01-15", notes: "" },
  { id: "2", description: "Aluguel coworking", category: "Operacional", type: "Despesa", value: 800, date: "2026-01-20", notes: "" },
  { id: "3", description: "Projeto Beta", category: "Projetos", type: "Receita", value: 3500, date: "2026-02-10", notes: "" },
  { id: "4", description: "Material escritório", category: "Infraestrutura", type: "Despesa", value: 350, date: "2026-02-15", notes: "" },
  { id: "5", description: "Consultoria Gamma", category: "Projetos", type: "Receita", value: 7200, date: "2026-03-05", notes: "" },
  { id: "6", description: "Marketing digital", category: "Marketing", type: "Despesa", value: 1200, date: "2026-03-10", notes: "" },
];

const FinanceiroContext = createContext<FinanceiroContextType>({
  entries: [],
  addEntry: () => {},
  updateEntry: () => {},
  removeEntry: () => {},
  balance: 0,
});

export const FinanceiroProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<FinanceiroEntry[]>(getStored);

  const save = useCallback((next: FinanceiroEntry[]) => {
    setEntries(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    toast({ title: "Alterações salvas", duration: 2000 });
  }, []);

  const addEntry = useCallback((entry: Omit<FinanceiroEntry, "id">) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    save([...getStored(), newEntry]);
  }, [save]);

  const updateEntry = useCallback((id: string, updates: Partial<FinanceiroEntry>) => {
    save(getStored().map(e => e.id === id ? { ...e, ...updates } : e));
  }, [save]);

  const removeEntry = useCallback((id: string) => {
    save(getStored().filter(e => e.id !== id));
  }, [save]);

  const balance = entries.reduce((acc, e) => acc + (e.type === "Receita" ? e.value : -e.value), 0);

  return (
    <FinanceiroContext.Provider value={{ entries, addEntry, updateEntry, removeEntry, balance }}>
      {children}
    </FinanceiroContext.Provider>
  );
};

export const useFinanceiro = () => useContext(FinanceiroContext);
