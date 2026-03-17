const SHEETDB_URL = "https://sheetdb.io/api/v1/r5p56ziig2wbc";
const SHEETDB_TOKEN = "hqm570apxqc443sv4jsd2ud5pqr9b9aw6q6c3p3l";

export interface OKR {
  id: string;
  titulo: string;
  krs: KR[];
  avaliacao: number;
}

export interface KR {
  id: string;
  label: string;
  desejado: string;
  realizado: string;
  progresso: number;
}

export interface OKRInfo {
  dataInicio: string;
  prazo: string;
  faturamento: string;
  diasPassados: number;
  diasRestantes: number;
  numProjetos: number;
  tempoGestao: number;
  avaliacaoGeral: number;
}

export const defaultInfo: OKRInfo = {
  dataInicio: "01/01/2026",
  prazo: "28/08/2026",
  faturamento: "R$ 50.000,00",
  diasPassados: 74,
  diasRestantes: 165,
  numProjetos: 9,
  tempoGestao: 31,
  avaliacaoGeral: 6,
};

export const defaultOkrs: OKR[] = [
  {
    id: "obj1",
    titulo: "Aumentar Faturamento",
    avaliacao: 16,
    krs: [
      { id: "kr1-1", label: "Faturamento por membro", desejado: "R$ 13.000,00", realizado: "R$ 3.125,00", progresso: 24 },
      { id: "kr1-2", label: "Briefings marcados por membro", desejado: "12,00", realizado: "1,00", progresso: 8 },
      { id: "kr1-3", label: "Reuniões realizadas", desejado: "36,00", realizado: "3,00", progresso: 8 },
      { id: "kr1-4", label: "Renda de Leads Passivos", desejado: "40%", realizado: "100,00%", progresso: 250 },
    ],
  },
  {
    id: "obj2",
    titulo: "Aumentar Qualidade dos Projetos",
    avaliacao: 0,
    krs: [
      { id: "kr2-1", label: "Notas de CSAT", desejado: "4,5", realizado: "0", progresso: 0 },
      { id: "kr2-2", label: "Relatórios de Projetos Finalizados", desejado: "100%", realizado: "0%", progresso: 0 },
      { id: "kr2-3", label: "Treinamentos realizados por parceiros de baixo investimento", desejado: "6", realizado: "0", progresso: 0 },
      { id: "kr2-4", label: "Reuniões de acompanhamento mensais", desejado: "18", realizado: "0", progresso: 0 },
      { id: "kr2-5", label: "Inovações desenvolvidas", desejado: "3", realizado: "0,00", progresso: 0 },
    ],
  },
  {
    id: "obj3",
    titulo: "Gestão Inteligente do Caixa",
    avaliacao: 0,
    krs: [
      { id: "kr3-1", label: "SUPERÁVIT de 15% da margem de dois meses de \"manutenção\" da empresa", desejado: "15%", realizado: "0%", progresso: 0 },
      { id: "kr3-2", label: "Diminuição do teto de custos fixos com dívidas", desejado: "15%", realizado: "0%", progresso: 0 },
    ],
  },
  {
    id: "obj4",
    titulo: "Implementar a Jornada do Membro Dentro da EJ",
    avaliacao: 0,
    krs: [
      { id: "kr4-1", label: "Número de processos implementados para mapeamento da jornada do membro", desejado: "4,0", realizado: "0,00", progresso: 0 },
      { id: "kr4-2", label: "Percentual de eficácia da jornada em membros", desejado: "80%", realizado: "0,00", progresso: 0 },
      { id: "kr4-3", label: "Percentual de participação de membros em eventos da rede", desejado: "75%", realizado: "0,00", progresso: 0 },
    ],
  },
  {
    id: "obj5",
    titulo: "Visualização da Visão Executiva",
    avaliacao: 13,
    krs: [
      { id: "kr5-1", label: "Eventos institucionais", desejado: "4", realizado: "0", progresso: 0 },
      { id: "kr5-2", label: "Participações em eventos do MEJ", desejado: "5", realizado: "2", progresso: 40 },
      { id: "kr5-3", label: "Média de satisfação das parcerias", desejado: "90", realizado: "0", progresso: 0 },
      { id: "kr5-4", label: "Parcerias rodando", desejado: "3", realizado: "2", progresso: 67 },
    ],
  },
];

function parsePercent(val: string): number {
  if (!val) return 0;
  return parseFloat(val.replace("%", "").replace(",", ".")) || 0;
}

interface SheetRow {
  objetivo: string;
  kr: string;
  descricao: string;
  desejado: string;
  realizado: string;
  progresso: string;
  "avaliação": string;
}

export async function fetchOKRsFromSheetDB(): Promise<{ info: OKRInfo; okrs: OKR[] } | null> {
  try {
    const res = await fetch(
      `${SHEETDB_URL}?sheet=Planilha%20Automatizada(Lovable)&limit=30`,
      { headers: { Authorization: `Bearer ${SHEETDB_TOKEN}` } }
    );
    if (!res.ok) return null;
    const data: SheetRow[] = await res.json();
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    // Split rows into KR rows and info rows
    const krRows = data.filter(r => r.objetivo && r.kr && r.kr.startsWith("KR"));
    const infoRows = data.filter(r => r.objetivo && !r.kr?.startsWith("KR") && r.kr && r.objetivo !== "metrica");

    // Parse info from key-value rows
    const infoMap = new Map<string, string>();
    for (const row of data) {
      if (row.objetivo && row.kr && !row.kr.startsWith("KR") && row.objetivo !== "metrica" && row.objetivo !== "") {
        infoMap.set(row.objetivo, row.kr);
      }
    }

    const info: OKRInfo = {
      dataInicio: infoMap.get("data_inicio") || defaultInfo.dataInicio,
      prazo: infoMap.get("prazo") || defaultInfo.prazo,
      faturamento: infoMap.get("faturamento") || defaultInfo.faturamento,
      diasPassados: parseInt(infoMap.get("dias_passados") || "") || defaultInfo.diasPassados,
      diasRestantes: parseInt(infoMap.get("dias_restantes") || "") || defaultInfo.diasRestantes,
      numProjetos: parseInt(infoMap.get("projetos") || "") || defaultInfo.numProjetos,
      tempoGestao: parsePercent(infoMap.get("tempo_gestao") || ""),
      avaliacaoGeral: parsePercent(infoMap.get("avaliacao_geral") || ""),
    };

    // Group KR rows by objetivo
    const objMap = new Map<string, { krs: KR[]; avaliacao: number }>();
    let objIdx = 0;
    for (const row of krRows) {
      const objName = row.objetivo;
      if (!objMap.has(objName)) {
        objIdx++;
        objMap.set(objName, { krs: [], avaliacao: parsePercent(row["avaliação"]) });
      }
      const entry = objMap.get(objName)!;
      // If avaliação is set on this row, update (first KR of each obj has it)
      if (row["avaliação"]) {
        entry.avaliacao = parsePercent(row["avaliação"]);
      }
      entry.krs.push({
        id: `kr${objIdx}-${entry.krs.length + 1}`,
        label: row.descricao,
        desejado: row.desejado,
        realizado: row.realizado,
        progresso: parsePercent(row.progresso),
      });
    }

    const okrs: OKR[] = [];
    let i = 0;
    for (const [titulo, val] of objMap) {
      i++;
      okrs.push({ id: `obj${i}`, titulo, krs: val.krs, avaliacao: val.avaliacao });
    }

    return { info, okrs };
  } catch {
    return null;
  }
}
