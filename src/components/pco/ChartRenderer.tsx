import { PieChart, Pie, Cell, AreaChart, Area, BarChart as ReBarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";

export interface ChartConfig {
  id: string;
  title: string;
  type: "bar" | "barH" | "line" | "area" | "pie" | "donut" | "scatter";
  data: { label: string; value: number }[];
  color: string;
  showLegend: boolean;
  showLabels: boolean;
}

export const CHART_COLORS = ["hsl(var(--accent))", "#16a34a", "#dc2626", "#2563eb", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

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
  const data = config.data.map(d => ({ name: d.label, value: d.value }));
  const colors = [config.color, ...CHART_COLORS.filter(c => c !== config.color)];

  if (config.type === "pie" || config.type === "donut") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={config.type === "donut" ? 40 : 0}
            isAnimationActive animationDuration={600}
            label={config.showLabels ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false} labelLine={false} fontSize={11}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          {config.showLegend && <Legend fontSize={11} />}
          <Tooltip {...tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (config.type === "line") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip {...tooltipStyle} />
          {config.showLegend && <Legend />}
          <Line type="monotone" dataKey="value" stroke={config.color} strokeWidth={2} dot={{ fill: config.color }} isAnimationActive animationDuration={600} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (config.type === "area") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip {...tooltipStyle} />
          {config.showLegend && <Legend />}
          <Area type="monotone" dataKey="value" stroke={config.color} fill={config.color} fillOpacity={0.4} strokeWidth={2} isAnimationActive animationDuration={600} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (config.type === "scatter") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis dataKey="value" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip {...tooltipStyle} />
          <Scatter data={data} fill={config.color} isAnimationActive animationDuration={600} />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  if (config.type === "barH") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart data={data} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
          <Tooltip {...tooltipStyle} />
          {config.showLegend && <Legend />}
          <Bar dataKey="value" fill={config.color} radius={[0, 4, 4, 0]} isAnimationActive animationDuration={600} />
        </ReBarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip {...tooltipStyle} />
        {config.showLegend && <Legend />}
        <Bar dataKey="value" fill={config.color} radius={[4, 4, 0, 0]} isAnimationActive animationDuration={600} />
      </ReBarChart>
    </ResponsiveContainer>
  );
};
