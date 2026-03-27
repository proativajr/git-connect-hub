import { useState } from "react";
import { Target, Loader2, Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { defaultOkrs, defaultInfo, fetchOKRsFromSheetDB } from "@/lib/sheetdb";
import type { OKR, OKRInfo } from "@/lib/sheetdb";

const getProgressColor = (value: number) => {
  if (value >= 70) return "bg-success";
  if (value >= 30) return "bg-accent";
  return "bg-destructive";
};

const getTextColor = (value: number) => {
  if (value >= 70) return "text-success";
  if (value >= 30) return "text-accent";
  return "text-destructive";
};

const Strategy = () => {
  const { data: okrData, isLoading } = useQuery({
    queryKey: ["sheetdb_okrs"],
    queryFn: fetchOKRsFromSheetDB,
    staleTime: 5 * 60 * 1000,
  });

  const okrsData: OKR[] = okrData?.okrs ?? defaultOkrs;
  const info: OKRInfo = okrData?.info ?? defaultInfo;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-8 transition-page">
      <div>
        <h1 className="text-page-title font-display text-foreground">Planejamento Estratégico</h1>
        <p className="text-muted-foreground mt-1">OKRs e Key Results</p>
      </div>

      {/* Info grid */}
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-display font-semibold text-foreground">OKRs e KRs</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Tempo de Gestão</p>
              <p className="text-xl font-display font-bold text-accent">{info.tempoGestao}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Avaliação Geral</p>
              <p className={`text-xl font-display font-bold ${getTextColor(info.avaliacaoGeral)}`}>{info.avaliacaoGeral}%</p>
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
      </div>

      {/* OKR Cards — flat, no accordion */}
      <div className="space-y-4">
        {okrsData.map((obj) => (
          <div key={obj.id} className="rounded-xl bg-card border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-semibold text-foreground">{obj.titulo}</h3>
              <span className={`text-lg font-bold ${getTextColor(obj.avaliacao)}`}>{obj.avaliacao}%</span>
            </div>
            {/* Overall progress */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${getProgressColor(obj.avaliacao)}`} style={{ width: `${Math.min(obj.avaliacao, 100)}%` }} />
            </div>
            {/* KRs */}
            <div className="space-y-3 mt-2">
              {obj.krs.map((kr, idx) => (
                <div key={kr.id} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-accent w-8 shrink-0">KR{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{kr.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getProgressColor(kr.progresso)}`} style={{ width: `${Math.min(kr.progresso, 100)}%` }} />
                      </div>
                      <span className={`text-xs font-bold ${getTextColor(kr.progresso)}`}>{kr.progresso}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-right w-20 shrink-0">
                    {kr.realizado} / {kr.desejado}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Strategy;
