import { useState } from "react";
import { Target, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import EditButton from "@/components/EditButton";

const Strategy = () => {
  const queryClient = useQueryClient();

  const { data: timeline = [], isLoading: tlLoading } = useQuery({
    queryKey: ["growth_journey"],
    queryFn: async () => {
      const { data, error } = await supabase.from("growth_journey").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: projects = [], isLoading: pjLoading } = useQuery({
    queryKey: ["impact_projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("impact_projects").select("*");
      if (error) throw error;
      return data;
    },
  });

  const updateTimeline = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("growth_journey").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["growth_journey"] }); toast({ title: "Salvo!" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("impact_projects").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["impact_projects"] }); toast({ title: "Salvo!" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const [editTimelineIdx, setEditTimelineIdx] = useState<number | null>(null);
  const [editProjectIdx, setEditProjectIdx] = useState<number | null>(null);
  const [tmpTimeline, setTmpTimeline] = useState({ year: "", label: "", value_text: "" });
  const [tmpProject, setTmpProject] = useState({ title: "", progress: 0, owner: "" });

  if (tlLoading || pjLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Planejamento Estratégico</h1>
        <p className="text-muted-foreground mt-1">Jornada de crescimento e projetos de impacto</p>
      </div>

      {/* Growth Journey */}
      <div className="rounded-xl bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-card-foreground">Jornada de Crescimento</h2>
        </div>
        <div className="flex items-center justify-between gap-2">
          {timeline.map((t: any, i: number) => (
            <div key={t.id} className="flex items-center gap-2 flex-1">
              <div className={`flex-1 rounded-xl p-5 text-center transition-all duration-300 relative group ${
                t.status === "current" ? "bg-primary text-primary-foreground ring-2 ring-accent shadow-lg"
                : t.status === "past" ? "bg-muted text-muted-foreground"
                : "bg-muted/50 text-muted-foreground border border-border"
              }`}>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <EditButton onClick={() => { setTmpTimeline({ year: t.year, label: t.label, value_text: t.value_text }); setEditTimelineIdx(i); }}
                    className={t.status === "current" ? "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10" : ""}
                  />
                </div>
                <p className="text-xs font-medium opacity-70">{t.label}</p>
                <p className="text-2xl font-bold mt-1">{t.value_text}</p>
                <p className="text-sm font-semibold mt-1">{t.year}</p>
              </div>
              {i < timeline.length - 1 && <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Impact Projects */}
      <div className="rounded-xl bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Target className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-card-foreground">Projetos de Impacto</h2>
        </div>
        <div className="space-y-5">
          {projects.map((project: any, i: number) => (
            <div key={project.id} className="group">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{project.title}</p>
                  <p className="text-xs text-muted-foreground">Responsável: {project.owner}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-accent">{project.progress}%</span>
                  <EditButton onClick={() => { setTmpProject({ title: project.title, progress: project.progress, owner: project.owner }); setEditProjectIdx(i); }} className="opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Timeline Dialog */}
      <Dialog open={editTimelineIdx !== null} onOpenChange={() => setEditTimelineIdx(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Marco</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Ano</Label><Input value={tmpTimeline.year} onChange={e => setTmpTimeline({ ...tmpTimeline, year: e.target.value })} /></div>
            <div><Label>Label</Label><Input value={tmpTimeline.label} onChange={e => setTmpTimeline({ ...tmpTimeline, label: e.target.value })} /></div>
            <div><Label>Valor</Label><Input value={tmpTimeline.value_text} onChange={e => setTmpTimeline({ ...tmpTimeline, value_text: e.target.value })} /></div>
            <button onClick={() => {
              if (editTimelineIdx !== null) {
                const item = timeline[editTimelineIdx] as any;
                updateTimeline.mutate({ id: item.id, updates: tmpTimeline });
                setEditTimelineIdx(null);
              }
            }} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">Salvar</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={editProjectIdx !== null} onOpenChange={() => setEditProjectIdx(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Projeto</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Nome</Label><Input value={tmpProject.title} onChange={e => setTmpProject({ ...tmpProject, title: e.target.value })} /></div>
            <div><Label>Responsável</Label><Input value={tmpProject.owner} onChange={e => setTmpProject({ ...tmpProject, owner: e.target.value })} /></div>
            <div><Label>Progresso (%)</Label><Input type="number" min={0} max={100} value={tmpProject.progress} onChange={e => setTmpProject({ ...tmpProject, progress: Number(e.target.value) })} /></div>
            <button onClick={() => {
              if (editProjectIdx !== null) {
                const item = projects[editProjectIdx] as any;
                updateProject.mutate({ id: item.id, updates: tmpProject });
                setEditProjectIdx(null);
              }
            }} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">Salvar</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Strategy;
