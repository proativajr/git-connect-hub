import { PieChart, Pie, Cell, AreaChart, Area, BarChart as ReBarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export interface ChartConfig {
  id: string;
  title: string;
  type: "bar" | "barH" | "line" | "area" | "pie" | "donut" | "scatter" | "barras" | "barras_h" | "linhas" | "pizza" | "rosca";
  chartType?: "barras" | "barras_h" | "linhas" | "area" | "pizza" | "rosca";
  data: { label?: string; name?: string; value: number }[];
  color: string;
  showLegend: boolean;
  showLabels: boolean;
}

export const CHART_COLORS = ["#c9a84c", "#021f3f", "#2b3f65", "#16a34a", "#3b82f6", "#dc2626", "#9333ea", "#f59e0b", "#ec4899", "#06b6d4"];

const tooltipStyle = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "12px",
  },
};

export const ChartRenderer = ({ config, height = 220 }: { config: ChartConfig; height?: number }) => {
  // Normalize: support both old format (label) and new format (name)
  const data = (config.data || []).map(d => ({ name: d.name || d.label || "", value: d.value }));
  const colors = [config.color, ...CHART_COLORS.filter(c => c !== config.color)];

  // Normalize type: support both old and new naming
  const resolvedType = config.chartType || config.type;

  if (resolvedType === "pie" || resolvedType === "pizza" || resolvedType === "donut" || resolvedType === "rosca") {
    const innerRadius = (resolvedType === "donut" || resolvedType === "rosca") ? "40%" : 0;
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" innerRadius={innerRadius}
            isAnimationActive animationDuration={600}
            label={config.showLabels ? ({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%` : false} labelLine={false} fontSize={11}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          {config.showLegend && <Legend wrapperStyle={{ fontSize: '11px' }} />}
          <Tooltip {...tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (resolvedType === "line" || resolvedType === "linhas") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip {...tooltipStyle} />
          {config.showLegend && <Legend wrapperStyle={{ fontSize: '11px' }} />}
          <Line type="monotone" dataKey="value" stroke={config.color} strokeWidth={2} dot={{ fill: config.color, r: 4 }} isAnimationActive animationDuration={600} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (resolvedType === "area") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip {...tooltipStyle} />
          {config.showLegend && <Legend wrapperStyle={{ fontSize: '11px' }} />}
          <Area type="monotone" dataKey="value" stroke={config.color} fill={`${config.color}33`} strokeWidth={2} isAnimationActive animationDuration={600} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (resolvedType === "barH" || resolvedType === "barras_h") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
          <Tooltip {...tooltipStyle} />
          {config.showLegend && <Legend wrapperStyle={{ fontSize: '11px' }} />}
          <Bar dataKey="value" fill={config.color} radius={[0, 4, 4, 0]} isAnimationActive animationDuration={600} />
        </ReBarChart>
      </ResponsiveContainer>
    );
  }

  // Default: bar / barras
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip {...tooltipStyle} />
        {config.showLegend && <Legend wrapperStyle={{ fontSize: '11px' }} />}
        <Bar dataKey="value" fill={config.color} radius={[4, 4, 0, 0]} isAnimationActive animationDuration={600}
          label={config.showLabels ? { position: 'top', fontSize: 10 } : false} />
      </ReBarChart>
    </ResponsiveContainer>
  );
};
