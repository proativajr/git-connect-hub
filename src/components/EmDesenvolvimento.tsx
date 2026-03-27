import { Construction } from "lucide-react";

interface Props {
  title?: string;
}

const EmDesenvolvimento = ({ title }: Props) => (
  <div className="flex items-center justify-center min-h-[60vh] transition-page">
    <div className="border-2 border-dashed border-accent/25 rounded-xl p-12 max-w-[480px] w-full text-center space-y-4">
      <Construction className="h-10 w-10 text-accent/60 mx-auto" />
      <h2 className="text-lg font-display font-semibold text-foreground">
        {title || "Em desenvolvimento"}
      </h2>
      <p className="text-sm text-muted-foreground">
        Esta seção será disponibilizada em breve
      </p>
    </div>
  </div>
);

export default EmDesenvolvimento;
