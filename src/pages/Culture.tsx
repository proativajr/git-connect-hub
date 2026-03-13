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

type PillarStyle = "doric" | "ionic" | "corinthian";

const pillars: {
  id: string;
  name: string;
  subtitle: string;
  style: PillarStyle;
  characteristics: string[];
}[] = [
  {
    id: "cultural",
    name: "Cultural",
    subtitle: "Pilar Cultural",
    style: "doric",
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
    style: "ionic",
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
    style: "corinthian",
    characteristics: [
      "Capacitação técnica e formação continuada",
      "Gestão de projetos e entregas de excelência",
      "Mentalidade empreendedora e orientada a resultados",
      "Liderança situacional e tomada de decisão",
      "Preparação para o mercado de trabalho",
    ],
  },
];

/* ── SVG Pillar Components ── */

const DoricPillar = () => (
  <svg viewBox="0 0 120 320" className="w-full h-full" fill="none">
    {/* Capital - simple slab */}
    <rect x="5" y="10" width="110" height="8" rx="1" className="fill-primary" />
    <rect x="10" y="18" width="100" height="6" className="fill-primary" />
    <rect x="15" y="24" width="90" height="4" className="fill-primary/80" />
    {/* Shaft - solid */}
    <rect x="22" y="28" width="76" height="260" className="fill-primary/90" />
    {/* Subtle entasis lines */}
    <line x1="38" y1="28" x2="38" y2="288" className="stroke-primary-foreground/10" strokeWidth="1" />
    <line x1="60" y1="28" x2="60" y2="288" className="stroke-primary-foreground/10" strokeWidth="1" />
    <line x1="82" y1="28" x2="82" y2="288" className="stroke-primary-foreground/10" strokeWidth="1" />
    {/* Base */}
    <rect x="15" y="288" width="90" height="5" className="fill-primary" />
    <rect x="10" y="293" width="100" height="7" rx="1" className="fill-primary" />
    <rect x="5" y="300" width="110" height="10" rx="2" className="fill-primary" />
  </svg>
);

const IonicPillar = () => (
  <svg viewBox="0 0 120 320" className="w-full h-full" fill="none">
    {/* Capital - with fluting details */}
    <rect x="8" y="16" width="104" height="6" rx="1" className="fill-primary" />
    <rect x="12" y="22" width="96" height="5" className="fill-primary/80" />
    {/* Shaft - fluted */}
    <rect x="22" y="27" width="76" height="262" className="fill-primary/20" />
    {/* Fluting grooves */}
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <rect key={i} x={26 + i * 10} y="27" width="5" height="262" rx="2" className="fill-primary/80" />
    ))}
    {/* Base */}
    <rect x="18" y="289" width="84" height="5" className="fill-primary/80" />
    <rect x="12" y="294" width="96" height="6" rx="1" className="fill-primary" />
    <ellipse cx="60" cy="306" rx="55" ry="6" className="fill-primary" />
    <rect x="5" y="306" width="110" height="8" rx="2" className="fill-primary" />
  </svg>
);

const CorinthianPillar = () => (
  <svg viewBox="0 0 120 320" className="w-full h-full" fill="none">
    {/* Capital - ornate with volutes */}
    {/* Volute left */}
    <circle cx="16" cy="12" r="8" className="stroke-primary fill-none" strokeWidth="2" />
    <circle cx="16" cy="12" r="4" className="fill-primary" />
    {/* Volute right */}
    <circle cx="104" cy="12" r="8" className="stroke-primary fill-none" strokeWidth="2" />
    <circle cx="104" cy="12" r="4" className="fill-primary" />
    {/* Capital platform */}
    <rect x="5" y="18" width="110" height="6" rx="1" className="fill-primary" />
    <rect x="10" y="24" width="100" height="5" className="fill-primary/90" />
    <rect x="15" y="29" width="90" height="4" className="fill-primary/80" />
    {/* Shaft - fluted */}
    <rect x="22" y="33" width="76" height="254" className="fill-primary/15" />
    {/* Fluting grooves */}
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <rect key={i} x={25 + i * 9} y="33" width="4" height="254" rx="2" className="fill-primary/80" />
    ))}
    {/* Base */}
    <rect x="15" y="287" width="90" height="4" className="fill-primary/80" />
    <rect x="10" y="291" width="100" height="5" rx="1" className="fill-primary/90" />
    <ellipse cx="60" cy="302" rx="52" ry="5" className="fill-primary" />
    <rect x="5" y="302" width="110" height="10" rx="2" className="fill-primary" />
  </svg>
);

const pillarComponents: Record<PillarStyle, React.FC> = {
  doric: DoricPillar,
  ionic: IonicPillar,
  corinthian: CorinthianPillar,
};

const Culture = () => {
  const [selectedDoc, setSelectedDoc] = useState<typeof documents[0] | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<typeof pillars[0] | null>(null);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [animatingIn, setAnimatingIn] = useState(false);

  const handlePillarClick = (pillar: typeof pillars[0]) => {
    setAnimatingOut(true);
    setTimeout(() => {
      setSelectedPillar(pillar);
      setAnimatingOut(false);
      setAnimatingIn(true);
      setTimeout(() => setAnimatingIn(false), 500);
    }, 600);
  };

  const handleBack = () => {
    setAnimatingIn(true);
    setTimeout(() => {
      setSelectedPillar(null);
      setAnimatingIn(false);
    }, 400);
  };

  if (selectedPillar) {
    return (
      <div
        className={`space-y-8 ${animatingIn ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"} transition-all duration-500 ease-out`}
      >
        <div>
          <button
            onClick={handleBack}
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
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-fade-in"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
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
          <div className="flex flex-col items-center gap-6 py-8">
            {/* Entablature */}
            <div className="w-full max-w-2xl">
              <div className="h-3 bg-primary rounded-t-md" />
              <div className="h-2 bg-primary/70" />
              <div className="h-1.5 bg-primary/40" />
            </div>

            {/* Pillars row */}
            <div className="grid grid-cols-3 gap-8 w-full max-w-2xl -mt-2">
              {pillars.map((pillar, idx) => {
                const PillarSvg = pillarComponents[pillar.style];
                return (
                  <button
                    key={pillar.id}
                    onClick={() => handlePillarClick(pillar)}
                    className={`group flex flex-col items-center gap-3 transition-all duration-600 ease-in-out cursor-pointer ${
                      animatingOut ? "-translate-y-[120%] opacity-0" : "translate-y-0 opacity-100"
                    }`}
                    style={{
                      transitionDelay: animatingOut ? `${idx * 100}ms` : "0ms",
                    }}
                  >
                    <div className="w-20 h-56 md:w-24 md:h-64 group-hover:-translate-y-3 group-hover:drop-shadow-lg transition-all duration-300">
                      <PillarSvg />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-[0.15em] text-primary group-hover:text-primary/80 transition-colors">
                      {pillar.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Stylobate / base platform */}
            <div
              className={`w-full max-w-2xl -mt-2 transition-all duration-500 ${
                animatingOut ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="h-1.5 bg-primary/40" />
              <div className="h-2 bg-primary/70" />
              <div className="h-4 bg-primary rounded-b-md" />
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
