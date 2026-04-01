import { useState, useEffect, useCallback } from "react";
import { ChevronDown, Plus, Trash2, Pencil, X, BarChart2, BarChart, PieChart as PieChartIcon, Upload, FileText, FileType, Download, GripVertical, FolderPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EmDesenvolvimento from "@/components/EmDesenvolvimento";
import { ChartRenderer, type ChartConfig, CHART_COLORS } from "@/components/pco/ChartRenderer";
import ChartBuilderModal from "@/components/pco/ChartBuilderModal";

interface PCOFolder {
  id: string;
  name: string;
  color: string;
  position: number;
}

interface PCODocument {
  id: string;
  nome_arquivo: string;
  storage_path: string;
  tamanho_bytes: number | null;
  folder_id: string | null;
  metadata: any;
}

const GenteGestaoPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"PCO" | "PDI">("PCO");
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [documents, setDocuments] = useState<PCODocument[]>([]);
  const [folders, setFolders] = useState<PCOFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingChart, setEditingChart] = useState<ChartConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [editingFolderName, setEditingFolderName] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const [chartsRes, docsRes, foldersRes] = await Promise.all([
      supabase.from("gente_uploads").select("*").eq("tipo", "chart").order("created_at"),
      supabase.from("gente_uploads").select("*").eq("tipo", "documento").order("created_at"),
      supabase.from("pco_folders").select("*").order("position"),
    ]);
    const parsed = (chartsRes.data || []).map((d: any) => ({
      id: d.id, folder_id: d.folder_id, ...(d.metadata as any),
    })) as (ChartConfig & { folder_id?: string })[];
    setCharts(parsed);
    setDocuments((docsRes.data || []) as PCODocument[]);
    setFolders((foldersRes.data || []) as PCOFolder[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Real-time sync
  useEffect(() => {
    const ch = supabase.channel("pco_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "gente_uploads" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "pco_folders" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchAll]);

  const handleSaveChart = async (config: Omit<ChartConfig, "id">) => {
    if (!config.title?.trim()) {
      toast({ title: "Adicione um título ao gráfico", variant: "destructive" });
      return;
    }
    const validData = config.data.filter(r => r.label.trim() !== "" && !isNaN(r.value));
    if (validData.length === 0) {
      toast({ title: "Adicione pelo menos uma linha com rótulo e valor", variant: "destructive" });
      return;
    }

    const metadata = { ...config, data: validData };

    if (editingChart) {
      const { error } = await supabase.from("gente_uploads").update({
        metadata: metadata as any, nome_arquivo: config.title.trim(),
        folder_id: selectedFolder || null,
      }).eq("id", editingChart.id);
      if (error) { toast({ title: "Erro ao atualizar gráfico", variant: "destructive" }); return; }
      toast({ title: "Gráfico atualizado", duration: 2000 });
    } else {
      const { error } = await supabase.from("gente_uploads").insert({
        nome_arquivo: config.title.trim(), tipo: "chart", storage_path: "chart",
        metadata: metadata as any, uploaded_by: user?.id,
        folder_id: selectedFolder || null,
        position: charts.length,
      });
      if (error) {
        console.error("Chart save error:", error);
        toast({ title: `Erro ao salvar gráfico: ${error.message}`, variant: "destructive" });
        return;
      }
      toast({ title: "Gráfico criado", duration: 2000 });
    }
    setEditingChart(null);
    setShowBuilder(false);
    fetchAll();
  };

  const handleDeleteChart = async (id: string) => {
    const { error } = await supabase.from("gente_uploads").delete().eq("id", id);
    if (error) { toast({ title: "Erro ao excluir gráfico", variant: "destructive" }); return; }
    setCharts(prev => prev.filter(c => c.id !== id));
    toast({ title: "Gráfico removido", duration: 2000 });
  };

  const handleUploadDocument = async (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Apenas PDF e DOCX são aceitos", variant: "destructive" });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande. Máximo 20MB", variant: "destructive" });
      return;
    }

    const ext = file.name.split(".").pop();
    const fileName = `${user?.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("pco-documentos").upload(fileName, file, { upsert: false, cacheControl: "3600" });
    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      toast({ title: `Erro no upload: ${uploadError.message}`, variant: "destructive" });
      return;
    }
    const { data: urlData } = supabase.storage.from("pco-documentos").getPublicUrl(fileName);
    const { error: dbError } = await supabase.from("gente_uploads").insert({
      uploaded_by: user?.id, tipo: "documento", nome_arquivo: file.name,
      storage_path: urlData.publicUrl, tamanho_bytes: file.size,
      folder_id: selectedFolder || null, position: documents.length,
      metadata: { file_type: file.type, extension: ext },
    });
    if (dbError) {
      console.error("DB insert error:", dbError);
      toast({ title: `Erro ao registrar arquivo: ${dbError.message}`, variant: "destructive" });
      return;
    }
    toast({ title: "Arquivo enviado com sucesso", duration: 2000 });
    fetchAll();
  };

  const handleDeleteDocument = async (id: string) => {
    await supabase.from("gente_uploads").delete().eq("id", id);
    toast({ title: "Documento removido", duration: 2000 });
    fetchAll();
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    await supabase.from("pco_folders").insert({
      name: newFolderName, position: folders.length, created_by: user?.id,
    });
    setNewFolderName("");
    setShowNewFolder(false);
    fetchAll();
  };

  const deleteFolder = async (id: string) => {
    // Move items to no folder
    await supabase.from("gente_uploads").update({ folder_id: null }).eq("folder_id", id);
    await supabase.from("pco_folders").delete().eq("id", id);
    if (selectedFolder === id) setSelectedFolder(null);
    fetchAll();
  };

  const renameFolder = async (id: string, name: string) => {
    await supabase.from("pco_folders").update({ name }).eq("id", id);
    setEditingFolderName(null);
    fetchAll();
  };

  const filteredCharts = selectedFolder ? charts.filter((c: any) => c.folder_id === selectedFolder) : charts;
  const filteredDocs = selectedFolder ? documents.filter(d => d.folder_id === selectedFolder) : documents;

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 transition-page">
      <div>
        <h1 className="text-page-title font-display text-foreground">Gente e Gestão</h1>
        <p className="text-sm text-muted-foreground">PCO e PDI</p>
      </div>

      <div className="flex gap-2">
        {(["PCO", "PDI"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium border transition-all ${
              activeTab === tab ? "bg-accent text-accent-foreground border-accent" : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}>
            {tab} <ChevronDown className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>

      {activeTab === "PDI" && <EmDesenvolvimento title="PDI" />}

      {activeTab === "PCO" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-display font-semibold text-foreground">Gráficos PCO</h2>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 rounded-lg bg-card border border-border px-4 py-2 text-sm font-medium text-foreground cursor-pointer hover:bg-muted transition-all">
                <Upload className="h-4 w-4" /> Upload Documento
                <input type="file" className="hidden" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={e => { if (e.target.files?.[0]) handleUploadDocument(e.target.files[0]); e.target.value = ""; }} />
              </label>
              <button onClick={() => { setEditingChart(null); setShowBuilder(true); }}
                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">
                <Plus className="h-4 w-4" /> Criar Gráfico
              </button>
            </div>
          </div>

          {/* Folder tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setSelectedFolder(null)}
              className={`px-5 py-2 rounded-full text-[13px] font-medium border transition-all ${
                !selectedFolder ? "bg-accent text-accent-foreground border-accent" : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}>
              Todos
            </button>
            {folders.map(f => (
              <div key={f.id} className="relative group">
                {editingFolderName === f.id ? (
                  <input autoFocus defaultValue={f.name} className="px-4 py-1.5 rounded-full text-[13px] border border-accent bg-card text-foreground outline-none"
                    onBlur={e => renameFolder(f.id, e.target.value)} onKeyDown={e => { if (e.key === "Enter") renameFolder(f.id, (e.target as HTMLInputElement).value); }} />
                ) : (
                  <button onClick={() => setSelectedFolder(f.id)} onDoubleClick={() => setEditingFolderName(f.id)}
                    className={`px-5 py-2 rounded-full text-[13px] font-medium border transition-all pr-8 ${
                      selectedFolder === f.id ? "bg-accent text-accent-foreground border-accent" : "bg-card text-muted-foreground border-border hover:bg-muted"
                    }`}>
                    {f.name}
                  </button>
                )}
                <button onClick={() => deleteFolder(f.id)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {showNewFolder ? (
              <div className="flex items-center gap-1">
                <input autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setShowNewFolder(false); }}
                  className="px-3 py-1.5 rounded-full text-[13px] border border-accent bg-card text-foreground outline-none w-32"
                  placeholder="Nome da pasta" />
                <button onClick={createFolder} className="text-accent text-xs font-semibold">OK</button>
              </div>
            ) : (
              <button onClick={() => setShowNewFolder(true)}
                className="px-4 py-2 rounded-full text-[13px] font-medium border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-accent transition-all flex items-center gap-1">
                <FolderPlus className="h-3.5 w-3.5" /> Nova Pasta
              </button>
            )}
          </div>

          {filteredCharts.length === 0 && filteredDocs.length === 0 && !loading && (
            <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
              <BarChart2 className="h-10 w-10 text-accent/40 mx-auto mb-3" />
              <p className="text-lg font-semibold text-muted-foreground">Nenhum gráfico criado</p>
              <p className="text-sm text-muted-foreground mt-1">Crie seu primeiro gráfico PCO para visualizar indicadores</p>
            </div>
          )}

          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            {filteredCharts.map(chart => (
              <div key={chart.id} className="rounded-xl bg-card border border-border p-4 group relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                    <p className="text-sm font-semibold text-foreground">{chart.title}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity hover-only-actions">
                    <button onClick={() => { setEditingChart(chart); setShowBuilder(true); }} className="text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDeleteChart(chart.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <ChartRenderer config={chart} height={220} />
              </div>
            ))}
            {filteredDocs.map(doc => (
              <div key={doc.id} className="rounded-xl bg-card border border-border p-4 group relative flex items-center gap-4">
                {doc.metadata?.file_type?.includes("pdf") ? (
                  <FileText className="h-8 w-8 text-accent shrink-0" />
                ) : (
                  <FileType className="h-8 w-8 text-accent shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">{doc.nome_arquivo}</p>
                  <p className="text-[12px] text-muted-foreground">{formatSize(doc.tamanho_bytes)}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity hover-only-actions">
                  <a href={doc.storage_path} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <Download className="h-4 w-4" />
                  </a>
                  <button onClick={() => handleDeleteDocument(doc.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showBuilder && (
        <ChartBuilderModal
          initial={editingChart}
          onSave={handleSaveChart}
          onClose={() => { setShowBuilder(false); setEditingChart(null); }}
        />
      )}
    </div>
  );
};

export default GenteGestaoPage;
