import pipeloversLogo from "@/assets/partners/pipelovers.jpeg";
import pwrLogo from "@/assets/partners/pwr-gestao.jpeg";
import produtivaLogo from "@/assets/partners/produtiva-junior.jpeg";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const partners = [
  {
    name: "PipeLovers",
    logo: pipeloversLogo,
    description:
      "Comunidade focada em conexão e engajamento entre empresas juniores, promovendo networking e troca de experiências no ecossistema MEJ.",
  },
  {
    name: "PWR Gestão",
    logo: pwrLogo,
    description:
      "Empresa júnior de gestão que oferece soluções em consultoria empresarial, estratégia e processos para organizações de diversos portes.",
  },
  {
    name: "Produtiva Júnior",
    logo: produtivaLogo,
    description:
      "Empresa júnior voltada para soluções em engenharia de produção, otimização de processos e gestão da qualidade.",
  },
];

const CRM = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Parcerias</h1>
        <p className="text-muted-foreground mt-1">
          Nossos parceiros estratégicos
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-20 py-16">
        {partners.map((partner) => (
          <HoverCard key={partner.name} openDelay={100} closeDelay={200}>
            <HoverCardTrigger asChild>
              <button className="group flex flex-col items-center gap-4 outline-none">
                <div className="h-40 w-40 rounded-2xl bg-white shadow-md p-5 flex items-center justify-center transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {partner.name}
                </span>
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-72">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">
                  {partner.name}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {partner.description}
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  );
};

export default CRM;
