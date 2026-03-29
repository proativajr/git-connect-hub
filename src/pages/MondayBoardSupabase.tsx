import { useState, useEffect, useCallback } from "react";
import { Plus, X, Clipboard, CalendarDays, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface BoardItem {
  id: string;
  title: string;
  column_id: string;
  status: string;
  priority: string;
  assignee_id: string | null;
  due_date: string | null;
  start_date: string | null;
  description: string | null;
  tags: string[];
  position: number;
}

interface BoardColumn {
  id: string;
  title: string;
  position: number;
  color: string | null;
}

const DEFAULT_COLUMNS = ["Backlog", "Em Andamento", "Revisão", "Concluído"];

const priorityStyles: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive",
  media: "bg-accent/15 text-accent",
  baixa: "bg-success/10 text-success",
};

const SkeletonBoard = () => (
  <div className="space-y-4 transition-page">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="flex gap-4">
      {[1, 2, 3, 4].map(col => (
        <div key={col} className="min-w-[260px] flex-shrink-0 rounded-xl bg-muted/50 p-3 space-y-2">
          <Skeleton className="h-5 w-24 mb-3" />
          {[1, 2, 3].map(card => (
            <Skeleton key={card} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const MondayBoardSupabase = ({ boardId, title }: { boardId: string; title: string }) => {
  const { user } = useAuth();
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [items, setItems] = useState<BoardItem[]>([]);
  const [view, setView] = useState<"board" | "table" | "timeline">("board");
  const [loading, setLoading] = useState(true);
  const [showNewPanel, setShowNewPanel] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", status: "backlog", priority: "media", due_date: "", description: "", tags: "" });
  const [dbBoardId, setDbBoardId] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<string | null>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let mounted = true;

    const ensureBoard = async (): Promise<string | null> => {
      const { data: existing } = await supabase.from("monday_boards").select("id").eq("board_id", boardId).maybeSingle();
      if (existing) return existing.id;
      const { data: created } = await supabase.from("monday_boards").insert({ board_id: boardId, title, diretoria: boardId }).select("id").single();
      if (created) {
        for (let i = 0; i < DEFAULT_COLUMNS.length; i++) {
          await supabase.from("monday_columns").insert({ board_id: created.id, title: DEFAULT_COLUMNS[i], position: i });
        }
        return created.id;
      }
      return null;
    };

    const loadBoard = async () => {
      try {
        const bid = await ensureBoard();
        if (!mounted || !bid) { if (mounted) setLoading(false); return; }
        setDbBoardId(bid);

        const { data: cols } = await supabase.from("monday_columns").select("*").eq("board_id", bid).order("position");
        const colList = (cols || []) as BoardColumn[];
        if (mounted) setColumns(colList);

        const colIds = colList.map(c => c.id);
        if (colIds.length > 0) {
          const { data: itms } = await supabase.from("monday_items").select("*").in("column_id", colIds).order("position");
          if (mounted) setItems((itms || []).map(i => ({ ...i, tags: i.tags || [] })) as BoardItem[]);
        }
      } catch (err) {
        console.error("Board load error:", err);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Timeout fallback: 5s
    timeout = setTimeout(() => { if (mounted && loading) setLoading(false); }, 5000);
    loadBoard();

    return () => { mounted = false; clearTimeout(timeout); };
  }, [boardId, title]);

  const handleAddItem = async () => {
    if (!newItem.title.trim() || !dbBoardId) return;
    const targetCol = columns.find(c => c.title === "Backlog") || columns[0];
    if (!targetCol) return;
    const maxPos = items.filter(i => i.column_id === targetCol.id).reduce((m, i) => Math.max(m, i.position), -1);
    const { data, error } = await supabase.from("monday_items").insert({
      column_id: targetCol.id, title: newItem.title, status: newItem.status, priority: newItem.priority,
      due_date: newItem.due_date || null, description: newItem.description || null,
      tags: newItem.tags ? newItem.tags.split(",").map(t => t.trim()) : [],
      position: maxPos + 1, created_by: user?.id,
    }).select().single();
    if (error) { toast({ title: "Erro ao criar item", variant: "destructive" }); return; }
    if (data) setItems(prev => [...prev, { ...data, tags: data.tags || [] } as BoardItem]);
    setNewItem({ title: "", status: "backlog", priority: "media", due_date: "", description: "", tags: "" });
    setShowNewPanel(false);
    toast({ title: "Item criado", duration: 2000 });
  };

  const handleDeleteItem = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await supabase.from("monday_items").delete().eq("id", id);
    toast({ title: "Item removido", duration: 2000 });
  };

  const handleDragStart = (id: string) => setDragItem(id);
  const handleDrop = async (columnId: string) => {
    if (!dragItem) return;
    setItems(prev => prev.map(i => i.id === dragItem ? { ...i, column_id: columnId } : i));
    await supabase.from("monday_items").update({ column_id: columnId }).eq("id", dragItem);
    setDragItem(null);
  };

  const handleInlineEdit = async (id: string, field: string, value: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    await supabase.from("monday_items").update({ [field]: value }).eq("id", id);
  };

  if (loading) return <SkeletonBoard />;

  return (
    <div className="space-y-5 transition-page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-page-title font-display text-foreground">{title}</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["board", "table", "timeline"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${view === v ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>
                {v === "board" ? "Board" : v === "table" ? "Tabela" : "Timeline"}
              </button>
            ))}
          </div>
          <button onClick={() => setShowNewPanel(true)}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">
            <Plus className="h-4 w-4" /> Novo Item
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <div className="rounded-xl bg-card border border-border p-16 text-center">
          <Clipboard className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">Nenhum item ainda</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Crie seu primeiro item para começar a organizar sua diretoria</p>
          <button onClick={() => setShowNewPanel(true)}
            className="rounded-lg bg-foreground text-background px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-all">
            <Plus className="h-4 w-4 inline mr-1" /> Criar Primeiro Item
          </button>
        </div>
      )}

      {view === "board" && items.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(col => {
            const colItems = items.filter(i => i.column_id === col.id).sort((a, b) => a.position - b.position);
            return (
              <div key={col.id} className="min-w-[260px] flex-shrink-0 rounded-xl bg-muted/50 p-3 space-y-2"
                onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(col.id)}>
                <div className="flex items-center justify-between px-1 mb-2">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{col.title}</span>
                  <span className="text-xs bg-border text-muted-foreground px-2 py-0.5 rounded-full">{colItems.length}</span>
                </div>
                {colItems.map(item => (
                  <div key={item.id} draggable onDragStart={() => handleDragStart(item.id)}
                    className={`rounded-lg bg-card border border-border p-3 cursor-grab hover:-translate-y-px hover:shadow-md transition-all duration-150 relative group ${dragItem === item.id ? "opacity-60 border-accent border-2" : ""}`}>
                    <p className="text-sm font-medium text-foreground mb-2">{item.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.priority && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${priorityStyles[item.priority] || ""}`}>
                          {item.priority === "alta" ? "Alta" : item.priority === "media" ? "Média" : "Baixa"}
                        </span>
                      )}
                      {item.due_date && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />{new Date(item.due_date).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                    <button onClick={() => handleDeleteItem(item.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity hover-only-actions">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button onClick={() => setShowNewPanel(true)} className="w-full text-xs text-muted-foreground hover:text-foreground py-2 transition-colors">+ Adicionar Item</button>
              </div>
            );
          })}
        </div>
      )}

      {view === "table" && items.length > 0 && (
        <div className="rounded-xl bg-card border border-border overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b-2 border-border">
                {["Item", "Status", "Prioridade", "Data", ""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-foreground uppercase tracking-wider px-4 py-3 sticky top-0 bg-card">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} className={`border-b border-border/50 hover:bg-muted/30 ${i % 2 ? "bg-background-secondary" : ""}`}>
                  <td className="px-4 py-3"><input value={item.title} onChange={e => handleInlineEdit(item.id, "title", e.target.value)} className="bg-transparent text-sm text-foreground w-full outline-none" /></td>
                  <td className="px-4 py-3">
                    <select value={columns.find(c => c.id === item.column_id)?.title || ""} onChange={e => {
                      const col = columns.find(c => c.title === e.target.value);
                      if (col) { setDragItem(item.id); handleDrop(col.id); }
                    }} className="text-xs bg-transparent text-foreground outline-none">
                      {columns.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select value={item.priority} onChange={e => handleInlineEdit(item.id, "priority", e.target.value)}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full outline-none ${priorityStyles[item.priority] || ""}`}>
                      <option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option>
                    </select>
                  </td>
                  <td className="px-4 py-3"><input type="date" value={item.due_date || ""} onChange={e => handleInlineEdit(item.id, "due_date", e.target.value)} className="bg-transparent text-xs text-muted-foreground outline-none" /></td>
                  <td className="px-4 py-3"><button onClick={() => handleDeleteItem(item.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "timeline" && items.length > 0 && <TimelineView items={items} />}

      {showNewPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowNewPanel(false)} />
          <div className="relative w-[420px] max-w-full h-full bg-card border-l border-border p-6 space-y-5 overflow-y-auto shadow-xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-foreground">Novo Item</h3>
              <button onClick={() => setShowNewPanel(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <input value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} placeholder="Título do item"
                className="w-full text-lg bg-transparent border-b-2 border-accent pb-2 text-foreground outline-none placeholder:text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Prioridade</label>
                <select value={newItem.priority} onChange={e => setNewItem({ ...newItem, priority: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground">
                  <option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Data de entrega</label>
                <input type="date" value={newItem.due_date} onChange={e => setNewItem({ ...newItem, due_date: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Descrição</label>
                <textarea value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground min-h-[80px]" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">Tags (separadas por vírgula)</label>
                <input value={newItem.tags} onChange={e => setNewItem({ ...newItem, tags: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground" />
              </div>
              <button onClick={handleAddItem}
                className="w-full rounded-lg bg-foreground text-background py-3 text-sm font-semibold hover:opacity-90 transition-all h-[44px]">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TimelineView = ({ items }: { items: BoardItem[] }) => {
  const itemsWithDates = items.filter(i => i.due_date || i.start_date);
  if (itemsWithDates.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Nenhum item com datas definidas para exibir no timeline.</p>;
  }
  const allDates = itemsWithDates.flatMap(i => [i.start_date, i.due_date].filter(Boolean)) as string[];
  const minDate = new Date(Math.min(...allDates.map(d => new Date(d).getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => new Date(d).getTime())));
  const totalDays = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="rounded-xl bg-card border border-border overflow-x-auto">
      <div className="min-w-[600px]">
        {itemsWithDates.map(item => {
          const start = item.start_date ? new Date(item.start_date) : new Date(item.due_date!);
          const end = item.due_date ? new Date(item.due_date) : start;
          const leftPct = ((start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100;
          const widthPct = Math.max(3, ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100);
          return (
            <div key={item.id} className="flex items-center border-b border-border/50 py-2 px-4">
              <span className="text-xs text-foreground w-[180px] shrink-0 truncate">{item.title}</span>
              <div className="flex-1 relative h-7">
                <div className="absolute h-full rounded bg-accent/10 border-2 border-accent" style={{ left: `${leftPct}%`, width: `${widthPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MondayBoardSupabase;
