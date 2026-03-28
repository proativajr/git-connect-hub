import { useState } from "react";
import { Upload, Plus, Trash2, Download, FileText, GripVertical } from "lucide-react";
import { useGente } from "@/contexts/GenteContext";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const statusColors: Record<string, string> = {
  "Em andamento": "bg-accent/20 text-accent",
  "Concluído": "bg-success/20 text-success",
  "Atrasado": "bg-destructive/20 text-destructive",
};

// PCO chart mock data
const pcoStatusData = [
  { name: "Concluído", value: 42 },
  { name: "Em andamento", value: 35 },
  { name: "Atrasado", value: 23 },
];
const pcoStatusColors = ["#16a34a", "#f5c400", "#dc2626"];

const pcoDiretoriaData = [
  { name: "Projetos", value: 38 },
  { name: "Comercial", value: 28 },
  { name: "VP", value: 20 },
  { name: "Presidência", value: 14 },
];
const pcoDiretoriaColors = ["#021f3f", "#2b3f65", "#f5c400", "#c9a84c"];

const pcoMonthlyData = [
  { month: "Out", count: 12 },
  { month: "Nov", count: 18 },
  { month: "Dez", count: 15 },
  { month: "Jan", count: 22 },
  { month: "Fev", count: 28 },
  { month: "Mar", count: 35 },
];

const GenteGestaoPage = () => {
  const { uploads, metas, addUpload, removeUpload, addMeta, updateMeta, removeMeta } = useGente();
  const [activeTab, setActiveTab] = useState<"PDI" | "PCO">("PDI");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(f => {
      addUpload({ nome: f.name, tipo: activeTab, data: new Date().toISOString().split("T")[0] });
    });
    e.target.value = "";
  };

  const filteredUploads = uploads.filter(u => u.tipo === activeTab);

  return (
    <div className="space-y-6 transition-page">
      <div>
        <h1 className="text-page-title font-display text-foreground">Gente e Gestão</h1>
        <p className="text-sm text-muted-foreground">PDI, PCO e metas de desenvolvimento</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["PDI", "PCO"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground border border-border hover:bg-muted"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Upload area */}
      <label className="block cursor-pointer">
        <div className="rounded-xl border-2 border-dashed border-accent/25 bg-card/50 p-8 text-center hover:border-accent/50 transition-colors">
          <Upload className="h-7 w-7 text-accent/60 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Arraste PDIs e PCOs aqui ou clique para selecionar</p>
          <p className="text-xs text-muted-foreground mt-1">Aceita apenas PDF</p>
        </div>
        <input type="file" accept=".pdf" multiple className="hidden" onChange={handleFileUpload} />
      </label>

      {/* File list */}
      {filteredUploads.length > 0 && (
        <div className="space-y-2">
          {filteredUploads.map(u => (
            <div key={u.id} className="flex items-center gap-3 rounded-lg bg-card border border-border p-3">
              <FileText className="h-5 w-5 text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{u.nome}</p>
                <p className="text-xs text-muted-foreground">{u.data}</p>
              </div>
              <button className="text-muted-foreground hover:text-foreground"><Download className="h-4 w-4" /></button>
              <button onClick={() => removeUpload(u.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      {/* Goals */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold text-foreground">Metas de Gente e Gestão</h2>
        <button onClick={addMeta} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent-hover active:scale-[0.98] transition-all">
          <Plus className="h-4 w-4" /> Adicionar Meta
        </button>
      </div>

      <div className="space-y-3">
        {metas.map(m => (
          <div key={m.id} className={`rounded-xl bg-card border border-border p-4 flex items-center gap-4 ${m.status === "Atrasado" ? "border-l-2 border-l-destructive" : m.status === "Concluído" ? "border-l-2 border-l-success" : ""}`}>
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <input value={m.meta} onChange={e => updateMeta(m.id, { meta: e.target.value })}
                className="bg-transparent text-sm text-foreground w-full outline-none" placeholder="Descreva a meta..." />
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${m.status === "Concluído" ? "bg-success" : m.status === "Atrasado" ? "bg-destructive" : "bg-accent"}`}
                    style={{ width: `${m.progresso}%` }} />
                </div>
                <input type="range" min="0" max="100" value={m.progresso} onChange={e => updateMeta(m.id, { progresso: Number(e.target.value) })}
                  className="w-20 accent-accent" />
                <span className="text-xs text-muted-foreground w-8">{m.progresso}%</span>
              </div>
            </div>
            <select value={m.status} onChange={e => updateMeta(m.id, { status: e.target.value as any })}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${statusColors[m.status]}`}>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Atrasado">Atrasado</option>
            </select>
            <button onClick={() => removeMeta(m.id)} className="text-muted-foreground hover:text-destructive transition-colors hover-only-actions">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* PCO Charts */}
      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Gráficos de PCO</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl bg-card border border-border p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Distribuição por Status</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pcoStatusData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {pcoStatusData.map((_, i) => <Cell key={i} fill={pcoStatusColors[i]} />)}
                </Pie>
                <Legend fontSize={11} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl bg-card border border-border p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Distribuição por Diretoria</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pcoDiretoriaData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {pcoDiretoriaData.map((_, i) => <Cell key={i} fill={pcoDiretoriaColors[i]} />)}
                </Pie>
                <Legend fontSize={11} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl bg-card border border-border p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Evolução Mensal</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={pcoMonthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#f5c400" fill="#f5c400" fillOpacity={0.4} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenteGestaoPage;
