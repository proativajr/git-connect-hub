import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

interface GenteUpload {
  id: string;
  nome: string;
  tipo: "PDI" | "PCO";
  data: string;
}

interface GenteMeta {
  id: string;
  meta: string;
  progresso: number;
  status: "Em andamento" | "Concluído" | "Atrasado";
}

interface GenteContextType {
  uploads: GenteUpload[];
  metas: GenteMeta[];
  addUpload: (u: Omit<GenteUpload, "id">) => void;
  removeUpload: (id: string) => void;
  addMeta: () => void;
  updateMeta: (id: string, updates: Partial<GenteMeta>) => void;
  removeMeta: (id: string) => void;
  pdiCount: number;
  pcoCount: number;
}

const UPLOADS_KEY = "proativa_gente_uploads";
const METAS_KEY = "proativa_gente_metas";

const getUploads = (): GenteUpload[] => { try { const d = localStorage.getItem(UPLOADS_KEY); return d ? JSON.parse(d) : []; } catch { return []; } };
const getMetas = (): GenteMeta[] => {
  try { const d = localStorage.getItem(METAS_KEY); return d ? JSON.parse(d) : defaultMetas; } catch { return defaultMetas; }
};

const defaultMetas: GenteMeta[] = [
  { id: "1", meta: "Implementar PDI para todos os membros", progresso: 50, status: "Em andamento" },
  { id: "2", meta: "Realizar pesquisa de clima organizacional", progresso: 100, status: "Concluído" },
  { id: "3", meta: "Organizar treinamento de liderança", progresso: 30, status: "Atrasado" },
];

const GenteContext = createContext<GenteContextType>({
  uploads: [], metas: [], addUpload: () => {}, removeUpload: () => {},
  addMeta: () => {}, updateMeta: () => {}, removeMeta: () => {},
  pdiCount: 0, pcoCount: 0,
});

export const GenteProvider = ({ children }: { children: ReactNode }) => {
  const [uploads, setUploads] = useState<GenteUpload[]>(getUploads);
  const [metas, setMetas] = useState<GenteMeta[]>(getMetas);

  const saveUploads = useCallback((next: GenteUpload[]) => {
    setUploads(next); localStorage.setItem(UPLOADS_KEY, JSON.stringify(next));
  }, []);

  const saveMetas = useCallback((next: GenteMeta[]) => {
    setMetas(next); localStorage.setItem(METAS_KEY, JSON.stringify(next));
    toast({ title: "Alterações salvas", duration: 2000 });
  }, []);

  const addUpload = useCallback((u: Omit<GenteUpload, "id">) => {
    saveUploads([...getUploads(), { ...u, id: crypto.randomUUID() }]);
  }, [saveUploads]);

  const removeUpload = useCallback((id: string) => {
    saveUploads(getUploads().filter(u => u.id !== id));
  }, [saveUploads]);

  const addMeta = useCallback(() => {
    saveMetas([...getMetas(), { id: crypto.randomUUID(), meta: "", progresso: 0, status: "Em andamento" }]);
  }, [saveMetas]);

  const updateMeta = useCallback((id: string, updates: Partial<GenteMeta>) => {
    saveMetas(getMetas().map(m => m.id === id ? { ...m, ...updates } : m));
  }, [saveMetas]);

  const removeMeta = useCallback((id: string) => {
    saveMetas(getMetas().filter(m => m.id !== id));
  }, [saveMetas]);

  const pdiCount = uploads.filter(u => u.tipo === "PDI").length;
  const pcoCount = uploads.filter(u => u.tipo === "PCO").length;

  return (
    <GenteContext.Provider value={{ uploads, metas, addUpload, removeUpload, addMeta, updateMeta, removeMeta, pdiCount, pcoCount }}>
      {children}
    </GenteContext.Provider>
  );
};

export const useGente = () => useContext(GenteContext);
