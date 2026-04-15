export type UploadTipo = 'pdi' | 'pco' | 'grafico';

export type ChartTipo = 'barras' | 'barras_h' | 'linhas' | 'area' | 'pizza' | 'rosca';

export interface GraficoMetadata {
  chart_type: ChartTipo;
  titulo: string;
  cor: string;
  mostrar_legenda: boolean;
  mostrar_rotulos: boolean;
  dados: Array<{ rotulo: string; valor: number }>;
}
