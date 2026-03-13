import { useState } from "react";
import { BookOpen, ShieldCheck, Shield, FileText, Users, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const documents = [
  {
    title: "Código de Ética",
    description: "Princípios e condutas que norteiam a atuação da Proativa Jr.",
    icon: Shield,
    detail: "Diretrizes inegociáveis de conduta, transparência e responsabilidade corporativa.",
  },
  {
    title: "Manual de Operações",
    description: "Processos operacionais, fluxos de trabalho e padrões de qualidade.",
    icon: FileText,
    detail: "Mapeamento de processos, fluxogramas de atendimento e padrões de qualidade.",
  },
  {
    title: "Diretrizes de Liderança",
    description: "Framework de competências e desenvolvimento de gestores.",
    icon: Users,
    detail: "Expectativas de gestão, feedback contínuo e desenvolvimento de alta performance.",
  },
  {
    title: "Política de Compliance",
    description: "Normas de conformidade regulatória e governança corporativa.",
    icon: Shield,
    detail: "Estruturas de conformidade legal, auditoria interna e gestão de riscos operacionais.",
  },
  {
    title: "Manual de Identidade Visual",
    description: "Padrões de marca, tipografia, paleta de cores e aplicações.",
    icon: BookOpen,
    detail: "Regras de uso da marca, paleta oficial, tipografia corporativa e templates de apresentação.",
  },
  {
    title: "Playbook Comercial",
    description: "Estratégias de prospecção, negociação e fechamento.",
    icon: FileText,
    detail: "Funil de vendas, scripts de abordagem, técnicas de negociação e fluxo de proposta comercial.",
  },
];

const pillars = [
  {
    id: "cultural",
    name: "Cultural",
    subtitle: "Pilar da Cultura",
    characteristics: [
      "Valorização da identidade coletiva do cardume",
      "Preservação das tradições e rituais internos",
      "Fomento à criatividade e inovação cultural",
      "Integração e pertencimento entre os membros",
      "Celebração de conquistas e marcos históricos",
    ],
  },
  {
    id: "pessoal",
    name: "Pessoal",
    subtitle: "Pilar Pessoal",
    characteristics: [
      "Desenvolvimento de soft skills e inteligência emocional",
      "Autoconhecimento e gestão de carreira",
      "Equilíbrio entre vida pessoal e profissional",
      "Saúde mental e bem-estar dos membros",
      "Construção de networking e relacionamentos",
    ],
  },
  {
    id: "profissional",
    name: "Profissional",
    subtitle: "Pilar Profissional",
    characteristics: [
      "Capacitação técnica e formação continuada",
      "Gestão de projetos e entregas de excelência",
      "Mentalidade empreendedora e orientada a resultados",
      "Liderança situacional e tomada de decisão",
      "Preparação para o mercado de trabalho",
    ],
  },
];

const Culture = () => {
  const [selectedDoc, setSelectedDoc] = useState<typeof documents[0] | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<typeof pillars[0] | null>(null);

  if (selectedPillar) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <button
            onClick={() => setSelectedPillar(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos pilares
          </button>
          <h1 className="text-3xl font-bold text-foreground">{selectedPillar.subtitle}</h1>
          <p className="text-muted-foreground mt-1">Características e diretrizes do pilar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedPillar.characteristics.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                {i + 1}
              </div>
              <p className="text-sm text-card-foreground leading-relaxed pt-1">{item}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Identidade do Cardume e Governança</h1>
        <p className="text-muted-foreground mt-1">Nossa cultura, valores, identidade e governança</p>
      </div>

      <Tabs defaultValue="cultura" className="w-full">
        <TabsList className="w-full justify-start bg-muted rounded-lg p-1">
          <TabsTrigger value="cultura" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Cultura
          </TabsTrigger>
          <TabsTrigger value="governanca" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Governança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cultura" className="mt-6">
          <div className="flex flex-col items-center gap-10">
            {/* Roman-style entablature */}
            <div className="w-full max-w-3xl">
              <div className="rounded-t-lg bg-primary/10 border border-border border-b-0 px-6 py-3 text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                  Os Três Pilares
                </span>
              </div>
              <div className="h-2 bg-primary/20 border-x border-border" />
            </div>

            {/* Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl -mt-4">
              {pillars.map((pillar) => (
                <button
                  key={pillar.id}
                  onClick={() => setSelectedPillar(pillar)}
                  className="group flex flex-col items-center gap-0 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Capital */}
                  <div className="w-20 h-5 rounded-t-lg bg-primary/15 border border-border border-b-0 relative">
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 rounded-t-full bg-primary/20 border border-border border-b-0" />
                  </div>

                  {/* Column shaft with fluting effect */}
                  <div className="relative w-16 bg-gradient-to-b from-primary/10 via-primary/5 to-primary/10 border-x border-border min-h-[180px] flex items-center justify-center overflow-hidden">
                    {/* Fluting lines */}
                    <div className="absolute inset-0 flex justify-between px-1 opacity-30">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-px h-full bg-primary/30" />
                      ))}
                    </div>
                    {/* Name rotated */}
                    <span
                      className="text-sm font-bold uppercase tracking-[0.2em] text-primary group-hover:text-primary/80 transition-colors"
                      style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                    >
                      {pillar.name}
                    </span>
                  </div>

                  {/* Base */}
                  <div className="w-24 h-4 bg-primary/10 border border-border rounded-b-sm" />
                  <div className="w-28 h-3 bg-primary/5 border border-t-0 border-border rounded-b-md" />
                </button>
              ))}
            </div>

            {/* Base platform */}
            <div className="w-full max-w-3xl -mt-4">
              <div className="h-3 bg-primary/10 border border-border rounded-b-lg" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="governanca" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <button
                key={doc.title}
                onClick={() => setSelectedDoc(doc)}
                className="group text-left rounded-xl bg-card p-6 border border-border hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <doc.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-card-foreground mb-1">{doc.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{doc.description}</p>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedDoc && <selectedDoc.icon className="h-5 w-5 text-primary" />}
              {selectedDoc?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <p className="text-sm text-muted-foreground leading-relaxed">{selectedDoc?.detail}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Culture;
