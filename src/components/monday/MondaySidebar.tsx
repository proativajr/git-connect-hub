import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronDown, ChevronRight, Plus, LayoutGrid, Briefcase,
  Building2, Crown, FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Workspace {
  id: string;
  name: string;
}

interface Folder {
  id: string;
  workspace_id: string;
  name: string;
  position: number;
}

interface Board {
  id: string;
  folder_id: string | null;
  workspace_id: string;
  name: string;
  department: string | null;
  position: number;
}

const DEPT_ICONS: Record<string, typeof LayoutGrid> = {
  projetos: LayoutGrid,
  comercial: Briefcase,
  "vice-presidência": Building2,
  presidência: Crown,
};

interface Props {
  selectedBoardId: string | null;
  onSelectBoard: (id: string) => void;
}

export function MondaySidebar({ selectedBoardId, onSelectBoard }: Props) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("monday_folder_collapse") || "{}");
    } catch { return {}; }
  });
  const [newBoardDialog, setNewBoardDialog] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardFolderId, setNewBoardFolderId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("monday_folder_collapse", JSON.stringify(collapsed));
  }, [collapsed]);

  const fetchData = async () => {
    const sb = supabase as any;
    const [wRes, fRes, bRes] = await Promise.all([
      sb.from("workspaces").select("*").limit(1).single(),
      sb.from("folders").select("*").order("position"),
      sb.from("boards").select("*").order("position"),
    ]);
    if (wRes.data) setWorkspace(wRes.data as Workspace);
    if (fRes.data) setFolders(fRes.data as Folder[]);
    if (bRes.data) setBoards(bRes.data as Board[]);
  };

  const toggleFolder = (folderId: string) => {
    setCollapsed((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim() || !workspace) return;
    const sb = supabase as any;
    const { data } = await sb.from("boards").insert({
      name: newBoardName.trim(),
      workspace_id: workspace.id,
      folder_id: newBoardFolderId,
      position: boards.length,
    }).select().single();
    if (data) {
      setBoards((prev) => [...prev, data as Board]);
      setNewBoardName("");
      setNewBoardDialog(false);
    }
  };

  const boardsForFolder = (folderId: string) =>
    boards.filter((b) => b.folder_id === folderId);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-60 flex flex-col border-r border-border"
      style={{ backgroundColor: "hsl(211 60% 15%)" }}>
      {/* Workspace header */}
      <div className="px-4 py-5 border-b border-white/10">
        <h2 className="text-sm font-bold text-white/90 tracking-wide uppercase">
          {workspace?.name || "Workspace"}
        </h2>
      </div>

      {/* Folders & boards */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {folders.map((folder) => {
          const isCollapsed = collapsed[folder.id];
          const fBoards = boardsForFolder(folder.id);
          const Icon = DEPT_ICONS[folder.name.toLowerCase()] || FolderOpen;

          return (
            <div key={folder.id}>
              <button
                onClick={() => toggleFolder(folder.id)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate font-medium">{folder.name}</span>
                <span className="ml-auto text-xs text-white/40">{fBoards.length}</span>
              </button>

              {!isCollapsed && (
                <div className="ml-6 space-y-0.5 transition-all duration-200">
                  {fBoards.map((board) => (
                    <button
                      key={board.id}
                      onClick={() => onSelectBoard(board.id)}
                      className={`flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded-md transition-colors ${
                        selectedBoardId === board.id
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-white/60 hover:bg-white/10 hover:text-white/90"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-sm bg-accent shrink-0" />
                      <span className="truncate">{board.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New board button */}
      <div className="px-3 pb-4">
        <Dialog open={newBoardDialog} onOpenChange={setNewBoardDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm"
              className="w-full justify-start text-white/50 hover:text-white hover:bg-white/10">
              <Plus className="h-4 w-4 mr-2" /> Novo Board
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Board</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input
                placeholder="Nome do board"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
              />
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={newBoardFolderId || ""}
                onChange={(e) => setNewBoardFolderId(e.target.value || null)}
              >
                <option value="">Sem pasta</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <Button onClick={handleCreateBoard} className="w-full">Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}
