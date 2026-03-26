import { Construction } from "lucide-react";

const PlaceholderPage = ({ title, description }: { title: string; description?: string }) => {
  return (
    <div className="space-y-6 transition-page">
      <div>
        <h1 className="text-page-title font-display text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <div className="rounded-xl bg-card border border-border p-16 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Construction className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-lg font-display font-semibold text-foreground">Em desenvolvimento</p>
          <p className="text-sm text-muted-foreground mt-2">Esta seção será disponibilizada em breve</p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
