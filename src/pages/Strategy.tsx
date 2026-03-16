import { useState } from "react";
import { Target, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import EditButton from "@/components/EditButton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { defaultOkrs, defaultInfo, fetchOKRsFromSheetDB } from "@/lib/sheetdb";
import type { OKR, OKRInfo } from "@/lib/sheetdb";

const getProgressColor = (value: number) => {
  if (value >= 70) return "bg-green-500";
  if (value >= 30) return "bg-accent";
  return "bg-destructive";
};

const getAvaliacaoColor = (value: number) => {
  if (value >= 70) return "text-green-500";
  if (value >= 30) return "text-accent";
  return "text-destructive";
};

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

  const { data: okrData } = useQuery({
    queryKey: ["sheetdb_okrs"],
    queryFn: fetchOKRsFromSheetDB,
    staleTime: 5 * 60 * 1000,
  });

  const okrsData: OKR[] = okrData?.okrs ?? defaultOkrs;
  const info: OKRInfo = okrData?.info ?? defaultInfo;

  const updateTimeline = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("growth_journey").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["growth_journey"] }); toast({ title: "Salvo!" }); },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const [editTimelineIdx, setEditTimelineIdx] = useState<number | null>(null);
  const [tmpTimeline, setTmpTimeline] = useState({ year: "", label: "", value_text: "" });

  if (tlLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Planejamento Estratégico</h1>
        <p className="text-muted-foreground mt-1">Jornada de crescimento e OKRs</p>
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

      {/* OKRs e KRs */}
      <div className="rounded-xl bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-card-foreground">OKRs e KRs</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Tempo de Gestão</p>
              <p className="text-xl font-bold text-accent">{info.tempoGestao}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Avaliação Geral</p>
              <p className={`text-xl font-bold ${getAvaliacaoColor(info.avaliacaoGeral)}`}>{info.avaliacaoGeral}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 rounded-lg bg-muted/50 p-4 text-sm">
          <div><span className="text-muted-foreground">Data de início:</span> <span className="font-medium text-card-foreground">{info.dataInicio}</span></div>
          <div><span className="text-muted-foreground">Prazo:</span> <span className="font-medium text-card-foreground">{info.prazo}</span></div>
          <div><span className="text-muted-foreground">Faturamento:</span> <span className="font-medium text-card-foreground">{info.faturamento}</span></div>
          <div><span className="text-muted-foreground">Dias passados:</span> <span className="font-medium text-card-foreground">{info.diasPassados}</span></div>
          <div><span className="text-muted-foreground">Dias restantes:</span> <span className="font-medium text-card-foreground">{info.diasRestantes}</span></div>
          <div><span className="text-muted-foreground">N. de Projetos:</span> <span className="font-medium text-card-foreground">{info.numProjetos}</span></div>
        </div>

        <Accordion type="multiple" defaultValue={["obj1"]} className="space-y-3">
          {okrsData.map((obj) => (
            <AccordionItem key={obj.id} value={obj.id} className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-primary/10">
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="font-semibold text-card-foreground">{obj.titulo}</span>
                  <span className={`text-lg font-bold ${getAvaliacaoColor(obj.avaliacao)}`}>{obj.avaliacao}%</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground border-b border-border">
                  <div className="col-span-1">KR</div>
                  <div className="col-span-5">Descrição</div>
                  <div className="col-span-2 text-center">Desejado</div>
                  <div className="col-span-2 text-center">Realizado</div>
                  <div className="col-span-2 text-center">Progresso</div>
                </div>
                {obj.krs.map((kr, idx) => (
                  <div key={kr.id} className={`grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm ${idx % 2 === 0 ? "bg-card" : "bg-muted/20"}`}>
                    <div className="col-span-1 font-semibold text-accent">KR{idx + 1}</div>
                    <div className="col-span-5 text-card-foreground">{kr.label}</div>
                    <div className="col-span-2 text-center text-muted-foreground">{kr.desejado}</div>
                    <div className="col-span-2 text-center text-card-foreground">{kr.realizado}</div>
                    <div className="col-span-2 flex items-center gap-2 justify-center">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getProgressColor(kr.progresso)}`} style={{ width: `${Math.min(kr.progresso, 100)}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${getProgressColor(kr.progresso).replace("bg-", "text-")}`}>{kr.progresso}%</span>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
    </div>
  );
};

export default Strategy;
