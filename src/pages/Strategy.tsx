import { useState } from "react";
import { Target, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { defaultOkrs, defaultInfo, fetchOKRsFromSheetDB } from "@/lib/sheetdb";
import type { OKR, OKRInfo } from "@/lib/sheetdb";

const getProgressColor = (value: number) => {
  if (value >= 70) return "bg-success";
  if (value >= 30) return "bg-primary";
  return "bg-destructive";
};

const getAvaliacaoColor = (value: number) => {
  if (value >= 70) return "text-success";
  if (value >= 30) return "text-primary";
  return "text-destructive";
};

const Strategy = () => {
  const { data: okrData, isLoading: okrLoading } = useQuery({
    queryKey: ["sheetdb_okrs"],
    queryFn: fetchOKRsFromSheetDB,
    staleTime: 5 * 60 * 1000,
  });

  const okrsData: OKR[] = okrData?.okrs ?? defaultOkrs;
  const info: OKRInfo = okrData?.info ?? defaultInfo;

  if (okrLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-8 transition-page">
      <div>
        <h1 className="text-page-title font-display text-foreground">Planejamento Estratégico</h1>
        <p className="text-muted-foreground mt-1">OKRs e Key Results</p>
      </div>

      {/* OKRs */}
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-display font-semibold text-foreground">OKRs e KRs</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Tempo de Gestão</p>
              <p className="text-xl font-display font-bold text-primary">{info.tempoGestao}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Avaliação Geral</p>
              <p className={`text-xl font-display font-bold ${getAvaliacaoColor(info.avaliacaoGeral)}`}>{info.avaliacaoGeral}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 rounded-lg bg-muted p-4 text-sm">
          <div><span className="text-muted-foreground">Data de início:</span> <span className="font-medium text-foreground">{info.dataInicio}</span></div>
          <div><span className="text-muted-foreground">Prazo:</span> <span className="font-medium text-foreground">{info.prazo}</span></div>
          <div><span className="text-muted-foreground">Faturamento:</span> <span className="font-medium text-foreground">{info.faturamento}</span></div>
          <div><span className="text-muted-foreground">Dias passados:</span> <span className="font-medium text-foreground">{info.diasPassados}</span></div>
          <div><span className="text-muted-foreground">Dias restantes:</span> <span className="font-medium text-foreground">{info.diasRestantes}</span></div>
          <div><span className="text-muted-foreground">N. de Projetos:</span> <span className="font-medium text-foreground">{info.numProjetos}</span></div>
        </div>

        <Accordion type="multiple" defaultValue={["obj1"]} className="space-y-3">
          {okrsData.map((obj) => (
            <AccordionItem key={obj.id} value={obj.id} className="border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="font-semibold text-foreground">{obj.titulo}</span>
                  <span className={`text-lg font-bold ${getAvaliacaoColor(obj.avaliacao)}`}>{obj.avaliacao}%</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted text-xs font-semibold text-muted-foreground border-b border-border">
                  <div className="col-span-1">KR</div>
                  <div className="col-span-5">Descrição</div>
                  <div className="col-span-2 text-center">Desejado</div>
                  <div className="col-span-2 text-center">Realizado</div>
                  <div className="col-span-2 text-center">Progresso</div>
                </div>
                {obj.krs.map((kr, idx) => (
                  <div key={kr.id} className={`grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm ${idx % 2 === 0 ? "bg-card" : "bg-muted/20"}`}>
                    <div className="col-span-1 font-semibold text-primary">KR{idx + 1}</div>
                    <div className="col-span-5 text-foreground">{kr.label}</div>
                    <div className="col-span-2 text-center text-muted-foreground">{kr.desejado}</div>
                    <div className="col-span-2 text-center text-foreground">{kr.realizado}</div>
                    <div className="col-span-2 flex items-center gap-2 justify-center">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getProgressColor(kr.progresso)}`} style={{ width: `${Math.min(kr.progresso, 100)}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${getAvaliacaoColor(kr.progresso)}`}>{kr.progresso}%</span>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Strategy;
