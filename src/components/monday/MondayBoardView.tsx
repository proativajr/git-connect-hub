import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table2, Kanban, Calendar, BarChart3 } from "lucide-react";

interface Board {
  id: string;
  name: string;
}

const VIEW_TABS = [
  { value: "table", label: "Table", icon: Table2 },
  { value: "kanban", label: "Kanban", icon: Kanban },
  { value: "calendar", label: "Calendar", icon: Calendar },
  { value: "chart", label: "Chart", icon: BarChart3 },
];

interface Props {
  boardId: string | null;
}

export function MondayBoardView({ boardId }: Props) {
  const [board, setBoard] = useState<Board | null>(null);
  const [activeTab, setActiveTab] = useState("table");

  useEffect(() => {
    if (!boardId) { setBoard(null); return; }
    const stored = localStorage.getItem(`monday_tab_${boardId}`);
    if (stored) setActiveTab(stored);
    else setActiveTab("table");

    const sb = supabase as any;
    sb.from("boards").select("id, name").eq("id", boardId).single()
      .then(({ data }: any) => { if (data) setBoard(data as Board); });
  }, [boardId]);

  useEffect(() => {
    if (boardId) localStorage.setItem(`monday_tab_${boardId}`, activeTab);
  }, [activeTab, boardId]);

  if (!boardId || !board) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="text-center space-y-3">
          <Kanban className="h-16 w-16 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground text-lg">
            Selecione um board na sidebar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-4">{board.name}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {VIEW_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {VIEW_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              <tab.icon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">{tab.label} View</p>
              <p className="text-sm mt-1">Em desenvolvimento — Prompt 2+</p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
