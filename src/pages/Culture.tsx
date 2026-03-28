import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Shield, FileText, Users, BookOpen } from "lucide-react";
import { useLocation } from "react-router-dom";
import OceanPillarsBackground from "@/components/OceanPillarsBackground";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const pillars = [
  {
    id: "cultural",
    name: "Cultural",
    subtitle: "Pilar Cultural",
    characteristics: [
      "Valorização da identidade coletiva do cardume",
      "Preservação das tradições e rituais internos",
      "Fomento à criatividade e inovação cultural",
      "Integração e pertencimento entre os membros",
      "Celebração de conquistas e marcos históricos",
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
];

const governanceDocuments = [
  { title: "Código de Ética", description: "Princípios e condutas que norteiam a atuação da Proativa Jr.", icon: Shield, detail: "Diretrizes inegociáveis de conduta, transparência e responsabilidade corporativa." },
  { title: "Manual de Operações", description: "Processos operacionais, fluxos de trabalho e padrões de qualidade.", icon: FileText, detail: "Mapeamento de processos, fluxogramas de atendimento e padrões de qualidade." },
  { title: "Diretrizes de Liderança", description: "Framework de competências e desenvolvimento de gestores.", icon: Users, detail: "Expectativas de gestão, feedback contínuo e desenvolvimento de alta performance." },
  { title: "Política de Compliance", description: "Normas de conformidade regulatória e governança corporativa.", icon: Shield, detail: "Estruturas de conformidade legal, auditoria interna e gestão de riscos operacionais." },
  { title: "Manual de Identidade Visual", description: "Padrões de marca, tipografia, paleta de cores e aplicações.", icon: BookOpen, detail: "Regras de uso da marca, paleta oficial, tipografia corporativa e templates de apresentação." },
  { title: "Playbook Comercial", description: "Estratégias de prospecção, negociação e fechamento.", icon: FileText, detail: "Funil de vendas, scripts de abordagem, técnicas de negociação e fluxo de proposta comercial." },
];

const DoricPillar = ({ glowing = false }: { glowing?: boolean }) => (
  <svg viewBox="0 0 120 340" className="w-full h-full" fill="none">
    <defs>
      <filter id="pillar-glow">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <g filter={glowing ? "url(#pillar-glow)" : undefined}>
      <rect x="6" y="6" width="108" height="12" rx="1" fill="white" opacity="0.95" />
      <path d="M18 18 Q18 30 28 30 L92 30 Q102 30 102 18" fill="white" opacity="0.9" />
      <rect x="25" y="30" width="70" height="3" rx="0.5" fill="white" opacity="0.85" />
      <rect x="27" y="33" width="66" height="2" rx="0.5" fill="white" opacity="0.75" />
      <rect x="28" y="35" width="64" height="260" fill="white" opacity="0.85" />
      {[0,1,2,3,4,5,6,7].map(i => (
        <rect key={i} x={31 + i * 7.5} y="35" width="4" height="260" fill="white" opacity={i % 2 === 0 ? 0.6 : 0.75} rx="2" />
      ))}
      <rect x="28" y="35" width="2" height="260" fill="white" opacity="0.95" />
      <rect x="90" y="35" width="2" height="260" fill="rgba(255,255,255,0.5)" />
      <rect x="22" y="295" width="76" height="4" rx="0.5" fill="white" opacity="0.85" />
      <path d="M18 299 Q18 308 26 308 L94 308 Q102 308 102 299" fill="white" opacity="0.9" />
      <rect x="12" y="308" width="96" height="8" rx="1" fill="white" opacity="0.9" />
      <rect x="6" y="316" width="108" height="14" rx="1.5" fill="white" opacity="0.95" />
    </g>
  </svg>
);

const Culture = () => {
  const [selectedPillar, setSelectedPillar] = useState<typeof pillars[0] | null>(null);
  const [animPhase, setAnimPhase] = useState<"idle" | "rising" | "detail">("idle");
  const [risingIndex, setRisingIndex] = useState<number | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<typeof governanceDocuments[0] | null>(null);
  const governanceRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#governanca" && governanceRef.current) {
      setTimeout(() => governanceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    }
  }, [location.hash]);

  const handlePillarClick = (pillar: typeof pillars[0], index: number) => {
    if (animPhase !== "idle") return;
    setRisingIndex(index);
    setAnimPhase("rising");
    setTimeout(() => { setSelectedPillar(pillar); setAnimPhase("detail"); }, 800);
  };

  const handleBack = () => { setAnimPhase("idle"); setSelectedPillar(null); setRisingIndex(null); };

  return (
    <div className="relative -m-4 sm:-m-8 ocean-scroll" style={{ overflow: "auto", minHeight: "calc(100vh - 4rem)" }}>
      <div className="fixed inset-0" style={{ zIndex: 0 }}>
        <OceanPillarsBackground selectedPillarIndex={risingIndex} />
      </div>

      <div className="relative z-10 pt-8">
        {animPhase === "detail" && selectedPillar && (
          <div className="animate-fade-in p-8 pt-12 min-h-screen">
            <button onClick={handleBack} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" /> Voltar aos pilares
            </button>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">{selectedPillar.subtitle}</h1>
            <p className="text-white/50 text-lg mb-10">Cada dimensão fortalece o coletivo.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
              {selectedPillar.characteristics.map((item, i) => (
                <div key={i} className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 animate-fade-in"
                  style={{ animationDelay: `${i * 120}ms`, animationFillMode: "both" }}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white font-bold text-sm">{i + 1}</div>
                  <p className="text-sm text-white leading-relaxed pt-1">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {animPhase !== "detail" && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-8">
            <div className={`text-center mb-12 transition-all duration-500 ${animPhase === "rising" ? "opacity-0 -translate-y-8" : "opacity-100"}`}>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">Identidade do Cardume</h1>
              <p className="text-white/40 text-lg">Os pilares sustentam o Cardume. Escolha um pilar para explorar.</p>
            </div>
            <div className={`w-full max-w-3xl transition-all duration-700 ${animPhase === "rising" ? "opacity-0 -translate-y-16" : "opacity-100"}`}>
              <div className="h-3 bg-white/90 rounded-t-sm" /><div className="h-2 bg-white/60" /><div className="h-1 bg-white/30" />
            </div>
            <div className="grid grid-cols-3 gap-8 md:gap-16 w-full max-w-3xl -mt-px">
              {pillars.map((pillar, idx) => {
                const isRising = risingIndex === idx;
                const isOther = risingIndex !== null && risingIndex !== idx;
                return (
                  <button key={pillar.id} onClick={() => handlePillarClick(pillar, idx)} disabled={animPhase !== "idle"}
                    className={`group flex flex-col items-center gap-3 transition-all ease-in-out ${isRising ? "-translate-y-[200%] opacity-0 duration-[800ms]" : isOther ? "opacity-20 blur-[2px] scale-95 duration-500" : "translate-y-0 opacity-100 duration-300"}`}
                    style={{ transitionDelay: isRising ? "0ms" : isOther ? `${Math.abs(idx - (risingIndex ?? 0)) * 80}ms` : "0ms" }}>
                    <div className="w-16 h-44 md:w-20 md:h-56 group-hover:-translate-y-3 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300">
                      <DoricPillar />
                    </div>
                    <span className="text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-white/80 group-hover:text-white transition-colors">{pillar.name}</span>
                  </button>
                );
              })}
            </div>
            <div className={`w-full max-w-3xl -mt-px transition-all duration-700 ${animPhase === "rising" ? "opacity-0 translate-y-8" : "opacity-100"}`}>
              <div className="h-1 bg-white/30" /><div className="h-2 bg-white/60" /><div className="h-4 bg-white/90 rounded-b-sm" />
            </div>
            <div ref={governanceRef} id="governanca"
              className={`w-full max-w-5xl mt-24 pb-16 transition-all duration-500 ${animPhase === "rising" ? "opacity-0" : "opacity-100"}`}>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Governança</h2>
                <p className="text-white/40">Documentos e diretrizes que sustentam a nossa estrutura</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {governanceDocuments.map(doc => (
                  <button key={doc.title} onClick={() => setSelectedDoc(doc)}
                    className="group text-left rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 hover:-translate-y-1 hover:bg-white/10 transition-all duration-300">
                    <div className="rounded-lg bg-white/10 p-2.5 mb-3 w-fit"><doc.icon className="h-5 w-5 text-white/70" /></div>
                    <h3 className="text-sm font-semibold text-white mb-1">{doc.title}</h3>
                    <p className="text-xs text-white/50 leading-relaxed">{doc.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="bg-[#0a2540] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              {selectedDoc && <selectedDoc.icon className="h-5 w-5 text-white/70" />}
              {selectedDoc?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2"><p className="text-sm text-white/60 leading-relaxed">{selectedDoc?.detail}</p></div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Culture;
