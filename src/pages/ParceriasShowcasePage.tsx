import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  if (loading) {
    return (
      <div className="space-y-6 transition-page">
        <h1 className="text-page-title font-display text-foreground">Parcerias</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl bg-card border border-border p-6 animate-pulse h-48" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {parcerias.map(p => (
            <div key={p.id} className="rounded-xl bg-card border border-border p-6 text-center hover:-translate-y-0.5 transition-all duration-200 hover:shadow-lg cursor-default">
              {p.logo_url ? (
                <img src={p.logo_url} alt={p.parceiro} className="w-20 h-20 object-contain mx-auto mb-4 rounded-lg" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-bold mx-auto mb-4">
                  {getInitials(p.parceiro)}
                </div>
              )}
              <p className="text-base font-semibold text-foreground">{p.parceiro}</p>
              {p.oferece && <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{p.oferece}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParceriasShowcasePage;
