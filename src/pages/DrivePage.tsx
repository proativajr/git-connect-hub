import { useEffect, useState } from "react";
import {
  FolderOpen,
  Folder,
  FileText,
  RefreshCw,
  ExternalLink,
  Settings,
  Upload,
  ChevronRight,
  Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGoogleToken } from "@/hooks/useGoogleToken";
import GoogleConnectButton from "@/components/google/GoogleConnectButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface Props {
  diretoria: "presidencia" | "vp" | "projetos" | "comercial" | "consultores";
  title: string;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  modifiedTime?: string;
}

interface DriveConfig {
  diretoria: string;
  folder_id: string | null;
  folder_name: string | null;
}

const FOLDER_MIME = "application/vnd.google-apps.folder";

const DIRETORIA_LABELS: Record<Props["diretoria"], string> = {
  presidencia: "Presidência",
  vp: "Vice-Presidência",
  projetos: "Projetos",
  comercial: "Comercial",
  consultores: "Consultores",
};

const CONSULTOR_FOLDER_NAMES = ["Drive Consultores", "Consultores"];

const escapeDriveQueryValue = (value: string) => value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

const AccessNotice = ({ diretoria }: { diretoria: Props["diretoria"] }) => (
  <div className="flex items-start gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 mb-6">
    <Lock className="h-4 w-4 text-accent shrink-0 mt-0.5" />
    <p className="text-sm text-foreground">
      Acesso restrito: apenas o e-mail oficial da diretoria de{" "}
      <strong>{DIRETORIA_LABELS[diretoria]}</strong> consegue visualizar e abrir
      os arquivos desta pasta.
    </p>
  </div>
);

const extractFolderId = (input: string): string => {
  const trimmed = input.trim();
  // Match /folders/<id> or id=<id>
  const m1 = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (m1) return m1[1];
  const m2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return m2[1];
  return trimmed;
};

const DrivePage = ({ diretoria, title }: Props) => {
  const { isAdmin } = useAuth();
  const { token, loading: tokenLoading } = useGoogleToken();
  const [config, setConfig] = useState<DriveConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [stack, setStack] = useState<{ id: string; name: string }[]>([]);
  const [configOpen, setConfigOpen] = useState(false);
  const [folderInput, setFolderInput] = useState("");
  const [folderName, setFolderName] = useState("");
  const [saving, setSaving] = useState(false);
  const [resolvingFolder, setResolvingFolder] = useState(false);
  const [autoResolveAttempted, setAutoResolveAttempted] = useState(false);

  const currentFolder = stack[stack.length - 1];

  const fetchConfig = async () => {
    setLoadingConfig(true);
    setAutoResolveAttempted(false);
    const { data } = await (supabase as any)
      .from("diretoria_drive_config")
      .select("*")
      .eq("diretoria", diretoria)
      .maybeSingle();
    setConfig(data);
    if (data?.folder_id) {
      setStack([{ id: data.folder_id, name: data.folder_name || title }]);
    } else {
      setStack([]);
    }
    setFolderInput(data?.folder_id || "");
    setFolderName(data?.folder_name || title);
    setLoadingConfig(false);
  };

  const fetchFiles = async () => {
    if (!token || !currentFolder) {
      setFiles([]);
      return;
    }
    setBusy(true);
    try {
      const url = new URL("https://www.googleapis.com/drive/v3/files");
      url.searchParams.set("q", `'${currentFolder.id}' in parents and trashed = false`);
      url.searchParams.set(
        "fields",
        "files(id,name,mimeType,webViewLink,iconLink,modifiedTime)"
      );
      url.searchParams.set("pageSize", "100");
      url.searchParams.set("orderBy", "folder,name");
      url.searchParams.set("supportsAllDrives", "true");
      url.searchParams.set("includeItemsFromAllDrives", "true");
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || "Falha ao listar arquivos");
      }
      const data = await res.json();
      setFiles(data.files ?? []);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diretoria]);

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentFolder?.id]);

  useEffect(() => {
    if (
      diretoria !== "consultores" ||
      !token ||
      loadingConfig ||
      config?.folder_id ||
      currentFolder ||
      autoResolveAttempted
    ) {
      return;
    }

    let cancelled = false;
    const resolveSharedConsultoresFolder = async () => {
      setAutoResolveAttempted(true);
      setResolvingFolder(true);

      try {
        const nameQuery = [
          ...CONSULTOR_FOLDER_NAMES.map((name) => `name = '${escapeDriveQueryValue(name)}'`),
          "name contains 'Consultores'",
          "name contains 'consultores'",
        ].join(" or ");
        const url = new URL("https://www.googleapis.com/drive/v3/files");
        url.searchParams.set(
          "q",
          `mimeType = '${FOLDER_MIME}' and trashed = false and (${nameQuery})`
        );
        url.searchParams.set("fields", "files(id,name)");
        url.searchParams.set("pageSize", "10");
        url.searchParams.set("supportsAllDrives", "true");
        url.searchParams.set("includeItemsFromAllDrives", "true");

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        const folder = data.files?.[0];
        if (!cancelled && folder?.id) {
          setConfig({ diretoria, folder_id: folder.id, folder_name: folder.name });
          setStack([{ id: folder.id, name: folder.name }]);
          setFolderInput(folder.id);
          setFolderName(folder.name);
        }
      } finally {
        if (!cancelled) setResolvingFolder(false);
      }
    };

    resolveSharedConsultoresFolder();

    return () => {
      cancelled = true;
    };
  }, [autoResolveAttempted, config?.folder_id, currentFolder, diretoria, loadingConfig, token]);

  const saveConfig = async () => {
    setSaving(true);
    try {
      const folderId = extractFolderId(folderInput);
      const { error } = await (supabase as any)
        .from("diretoria_drive_config")
        .upsert(
          {
            diretoria,
            folder_id: folderId || null,
            folder_name: folderName || title,
          },
          { onConflict: "diretoria" }
        );
      if (error) throw error;
      toast({ title: "Pasta configurada" });
      setConfigOpen(false);
      await fetchConfig();
    } catch (e: any) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openFile = (f: DriveFile) => {
    if (f.mimeType === FOLDER_MIME) {
      setStack((prev) => [...prev, { id: f.id, name: f.name }]);
    } else if (f.webViewLink) {
      window.open(f.webViewLink, "_blank", "noopener");
    }
  };

  const goBack = (idx: number) => {
    setStack((prev) => prev.slice(0, idx + 1));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token || !currentFolder) return;
    setBusy(true);
    try {
      const metadata = {
        name: file.name,
        parents: [currentFolder.id],
      };
      const form = new FormData();
      form.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
      );
      form.append("file", file);
      const res = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );
      if (!res.ok) throw new Error("Falha ao enviar arquivo");
      toast({ title: "Arquivo enviado" });
      e.target.value = "";
      fetchFiles();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (tokenLoading || loadingConfig) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-b-2 border-accent rounded-full" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-10 sm:py-16">
        <div className="flex items-center gap-3 mb-6">
          <FolderOpen className="h-7 w-7 text-accent" />
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>
        <AccessNotice diretoria={diretoria} />
        <GoogleConnectButton
          label="Conectar Google Drive"
          description={
            diretoria === "consultores"
              ? "Mesmo entrando com e-mail e senha, conecte o Google com o e-mail dos consultores para liberar a pasta compartilhada."
              : "Conecte sua conta Google para visualizar os arquivos da pasta desta diretoria."
          }
        />
      </div>
    );
  }

  if (!currentFolder) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <FolderOpen className="h-7 w-7 text-accent" />
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>
        <AccessNotice diretoria={diretoria} />
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center max-w-xl mx-auto">
          <Folder className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            {resolvingFolder
              ? "Procurando uma pasta compartilhada chamada Drive Consultores para este Google."
              : isAdmin
              ? "Nenhuma pasta do Google Drive foi configurada para esta diretoria."
              : "Aguarde — um administrador ainda não configurou a pasta do Drive desta diretoria."}
          </p>
          {isAdmin && (
            <Button onClick={() => setConfigOpen(true)}>
              <Settings className="h-4 w-4" />
              Configurar pasta
            </Button>
          )}
        </div>

        {isAdmin && (
          <ConfigDialog
            open={configOpen}
            onOpenChange={setConfigOpen}
            folderInput={folderInput}
            setFolderInput={setFolderInput}
            folderName={folderName}
            setFolderName={setFolderName}
            saving={saving}
            onSave={saveConfig}
          />
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <FolderOpen className="h-7 w-7 text-accent shrink-0" />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
              {stack.map((s, i) => (
                <span key={s.id} className="flex items-center gap-1">
                  <button
                    onClick={() => goBack(i)}
                    className="hover:text-accent truncate max-w-[200px]"
                  >
                    {s.name}
                  </button>
                  {i < stack.length - 1 && <ChevronRight className="h-3 w-3" />}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchFiles} disabled={busy}>
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <label>
            <input type="file" className="hidden" onChange={handleUpload} />
            <Button size="sm" variant="outline" asChild>
              <span className="cursor-pointer">
                <Upload className="h-4 w-4" />
                Enviar
              </span>
            </Button>
          </label>
          {isAdmin && (
            <Button size="sm" variant="ghost" onClick={() => setConfigOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <AccessNotice diretoria={diretoria} />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {files.length === 0 && !busy && (
          <p className="text-sm text-muted-foreground py-12 text-center">
            Esta pasta está vazia.
          </p>
        )}
        <ul className="divide-y divide-border">
          {files.map((f) => {
            const isFolder = f.mimeType === FOLDER_MIME;
            return (
              <li key={f.id}>
                <button
                  onClick={() => openFile(f)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors text-left"
                >
                  {isFolder ? (
                    <Folder className="h-5 w-5 text-accent shrink-0" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                  <span className="flex-1 text-sm text-foreground truncate">{f.name}</span>
                  {f.modifiedTime && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {new Date(f.modifiedTime).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  {!isFolder && f.webViewLink && (
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {isAdmin && (
        <ConfigDialog
          open={configOpen}
          onOpenChange={setConfigOpen}
          folderInput={folderInput}
          setFolderInput={setFolderInput}
          folderName={folderName}
          setFolderName={setFolderName}
          saving={saving}
          onSave={saveConfig}
        />
      )}
    </div>
  );
};

interface ConfigDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  folderInput: string;
  setFolderInput: (v: string) => void;
  folderName: string;
  setFolderName: (v: string) => void;
  saving: boolean;
  onSave: () => void;
}

const ConfigDialog = ({
  open,
  onOpenChange,
  folderInput,
  setFolderInput,
  folderName,
  setFolderName,
  saving,
  onSave,
}: ConfigDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Configurar pasta do Drive</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label>Nome de exibição</Label>
          <Input value={folderName} onChange={(e) => setFolderName(e.target.value)} />
        </div>
        <div>
          <Label>ID ou URL da pasta</Label>
          <Input
            placeholder="https://drive.google.com/drive/folders/XXXXX"
            value={folderInput}
            onChange={(e) => setFolderInput(e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Cole a URL da pasta no Google Drive ou apenas o ID.
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default DrivePage;
