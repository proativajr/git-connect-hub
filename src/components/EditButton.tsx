import { Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface EditButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  variant?: "ghost" | "outline" | "solid";
}

const EditButton = ({ onClick, label, className = "", variant = "ghost" }: EditButtonProps) => {
  const { isAdmin } = useAuth();
  if (!isAdmin) return null;

  const base = "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 cursor-pointer";
  const variants = {
    ghost: "text-muted-foreground hover:text-foreground hover:bg-muted",
    outline: "border border-border text-muted-foreground hover:text-foreground hover:bg-muted",
    solid: "bg-primary text-primary-foreground hover:opacity-90",
  };

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      <Pencil className="h-3.5 w-3.5" />
      {label && <span>{label}</span>}
    </button>
  );
};

export default EditButton;
