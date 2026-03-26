import { Grid3X3 } from "lucide-react";

const MondayBasePage = ({ title }: { title: string }) => {
  return (
    <div className="space-y-6 transition-page">
      <div>
        <h1 className="text-page-title font-display text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">Área reservada para integração com Monday.com</p>
      </div>

      <div className="rounded-xl bg-card border border-border p-16 flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-display font-semibold text-muted-foreground">Monday Base</p>
          <p className="text-sm text-muted-foreground mt-2">Iframe placeholder — integração futura</p>
        </div>
      </div>
    </div>
  );
};

export default MondayBasePage;
