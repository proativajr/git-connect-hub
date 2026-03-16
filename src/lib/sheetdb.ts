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

export async function fetchOKRsFromSheetDB(): Promise<{ info: OKRInfo; okrs: OKR[] } | null> {
  try {
    const res = await fetch(`${SHEETDB_URL}?sheet=OKRs%202026.1`, {
      headers: { Authorization: `Bearer ${SHEETDB_TOKEN}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    
    // SheetDB returns empty arrays when headers aren't set properly
    if (!data || !Array.isArray(data) || data.length === 0 || (Array.isArray(data[0]) && data[0].length === 0)) {
      return null;
    }
    
    // TODO: Parse real data when SheetDB headers are properly configured
    return null;
  } catch {
    return null;
  }
}
