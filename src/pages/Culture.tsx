import { useState } from "react";
import { ArrowLeft } from "lucide-react";

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

/* Doric SVG pillar — flat vector style inspired by reference */
const DoricPillar = () => (
  <svg viewBox="0 0 140 360" className="w-full h-full drop-shadow-md" fill="none">
    {/* === CAPITAL === */}
    {/* Abacus (top slab) */}
    <rect x="10" y="8" width="120" height="14" rx="2" className="fill-primary" />
    {/* Echinus (rounded cushion) */}
    <path
      d="M25 22 Q25 36 35 36 L105 36 Q115 36 115 22"
      className="fill-primary"
    />
    {/* Necking ring */}
    <rect x="32" y="36" width="76" height="6" rx="1" className="fill-primary/90" />

    {/* === SHAFT === */}
    <rect x="35" y="42" width="70" height="270" className="fill-primary/85" />
    {/* Subtle entasis highlight */}
    <rect x="35" y="42" width="12" height="270" className="fill-primary/95" rx="0" />
    <rect x="98" y="42" width="7" height="270" className="fill-primary/70" rx="0" />

    {/* === BASE === */}
    {/* Torus (rounded molding) */}
    <path
      d="M28 312 Q28 320 35 320 L105 320 Q112 320 112 312"
      className="fill-primary/90"
    />
    <rect x="28" y="312" width="84" height="4" className="fill-primary" />
    {/* Plinth (bottom slab) */}
    <rect x="15" y="316" width="110" height="10" rx="1" className="fill-primary" />
    <rect x="8" y="326" width="124" height="14" rx="2" className="fill-primary" />
  </svg>
);

const Culture = () => {
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
        <h1 className="text-3xl font-bold text-foreground">Identidade do Cardume</h1>
        <p className="text-muted-foreground mt-1">Os pilares que sustentam a nossa cultura</p>
      </div>

      <div className="flex flex-col items-center gap-4 py-8">
        {/* Entablature */}
        <div className="w-full max-w-2xl">
          <div className="h-4 bg-primary rounded-t-md" />
          <div className="h-2.5 bg-primary/70" />
          <div className="h-1.5 bg-primary/40" />
        </div>

        {/* Pillars row */}
        <div className="grid grid-cols-3 gap-10 w-full max-w-2xl -mt-1">
          {pillars.map((pillar, idx) => (
            <button
              key={pillar.id}
              onClick={() => handlePillarClick(pillar)}
              className={`group flex flex-col items-center gap-4 cursor-pointer transition-all ease-in-out ${
                animatingOut
                  ? "-translate-y-[140%] opacity-0 duration-[600ms]"
                  : "translate-y-0 opacity-100 duration-300"
              }`}
              style={{
                transitionDelay: animatingOut ? `${idx * 120}ms` : "0ms",
              }}
            >
              <div className="w-20 h-52 md:w-24 md:h-60 group-hover:-translate-y-3 group-hover:scale-105 transition-all duration-300">
                <DoricPillar />
              </div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary group-hover:text-primary/70 transition-colors">
                {pillar.name}
              </span>
            </button>
          ))}
        </div>

        {/* Stylobate */}
        <div
          className={`w-full max-w-2xl -mt-1 transition-all duration-500 ${
            animatingOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="h-1.5 bg-primary/40" />
          <div className="h-2.5 bg-primary/70" />
          <div className="h-5 bg-primary rounded-b-md" />
        </div>
      </div>
    </div>
  );
};

export default Culture;
