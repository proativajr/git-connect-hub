import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface Parceria {
  id: string;
  parceiro: string;
  tipo: string | null;
  oferece: string | null;
  beneficios: string | null;
  contato: string | null;
  status: string | null;
  logo_url: string | null;
}

const ParceriasShowcasePage = () => {
  const [parcerias, setParcerias] = useState<Parceria[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParcerias = async () => {
    const { data } = await supabase.from("parcerias").select("*").eq("status", "ativa").order("position");
    setParcerias((data as Parceria[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchParcerias();
    const channel = supabase
      .channel("parcerias_showcase")
      .on("postgres_changes", { event: "*", schema: "public", table: "parcerias" }, () => fetchParcerias())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();

  const buildBullets = (p: Parceria) => {
    const bullets: string[] = [];
    if (p.oferece) p.oferece.split(/[,;.\n]/).map(s => s.trim()).filter(Boolean).forEach(b => bullets.push(b));
    if (p.beneficios) p.beneficios.split(/[,;.\n]/).map(s => s.trim()).filter(Boolean).forEach(b => bullets.push(b));
    return bullets;
  };

  if (loading) {
    return (
      <div className="space-y-6 transition-page">
        <h1 className="text-page-title font-display text-foreground">Parcerias</h1>
        <div className="flex flex-wrap justify-center gap-16 py-12">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-32 h-32 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 transition-page">
      <div>
        <h1 className="text-page-title font-display text-foreground">Parcerias</h1>
        <p className="text-sm text-muted-foreground">Parceiros estratégicos da Proativa</p>
      </div>

      {parcerias.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
          <p className="text-lg font-semibold text-muted-foreground">Nenhuma parceria ativa</p>
          <p className="text-sm text-muted-foreground mt-1">Parcerias serão exibidas aqui quando cadastradas</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-12 py-12">
          {parcerias.map(p => {
            const bullets = buildBullets(p);
            return (
              <HoverCard key={p.id} openDelay={100} closeDelay={200}>
                <HoverCardTrigger asChild>
                  <button className="group flex flex-col items-center gap-3 outline-none w-full">
                    {p.logo_url ? (
                      <div className="h-28 w-28 flex items-center justify-center rounded-xl bg-card p-3 transition-transform duration-300 group-hover:scale-105">
                        <img
                          src={p.logo_url}
                          alt={p.parceiro}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-28 w-28 rounded-full bg-accent/20 flex items-center justify-center text-accent text-2xl font-bold transition-transform duration-300 group-hover:scale-110">
                        {getInitials(p.parceiro)}
                      </div>
                    )}
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {p.parceiro}
                    </span>
                  </button>
                </HoverCardTrigger>
                {bullets.length > 0 && (
                  <HoverCardContent className="w-72">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground">{p.parceiro}</h4>
                      <ul className="space-y-1">
                        {bullets.map((b, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </HoverCardContent>
                )}
              </HoverCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParceriasShowcasePage;
