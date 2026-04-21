import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useGoogleToken } from "@/hooks/useGoogleToken";

interface Props {
  label?: string;
  description?: string;
}

const GoogleConnectButton = ({
  label = "Conectar com Google",
  description = "Conecte sua conta Google para ver e gerenciar seus dados.",
}: Props) => {
  const { connect } = useGoogleToken();

  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center text-center gap-3 max-w-md mx-auto">
      <div className="h-12 w-12 rounded-full bg-accent/15 flex items-center justify-center">
        <LogIn className="h-6 w-6 text-accent" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{label}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button onClick={connect} className="mt-2">
        <LogIn className="h-4 w-4" />
        Entrar com Google
      </Button>
    </div>
  );
};

export default GoogleConnectButton;
