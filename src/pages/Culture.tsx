import { useState } from "react";
import { BookOpen, Shield, Users, FileText } from "lucide-react";
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

const Culture = () => {
  const [selectedDoc, setSelectedDoc] = useState<typeof documents[0] | null>(null);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cultura & Governança</h1>
        <p className="text-muted-foreground mt-1">Documentos e diretrizes corporativas</p>
      </div>

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
