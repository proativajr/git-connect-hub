import { useState, useEffect, useRef } from "react";
import { User, Lock, Sun, Moon, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${profile.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const { error: updateError } = await (supabase as any)
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      await refreshProfile();
      toast({ title: "Foto de perfil atualizada!" });
    } catch (err: any) {
      toast({ title: "Erro ao enviar foto", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async () => {
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", profile?.id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    await refreshProfile();
    toast({ title: "Perfil atualizado!" });
  };

  const handlePasswordChange = async () => {
    if (!newPw || !confirmPw) { toast({ title: "Preencha todos os campos.", variant: "destructive" }); return; }
    if (newPw !== confirmPw) { toast({ title: "As senhas não coincidem.", variant: "destructive" }); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Senha alterada com sucesso!" });
    setNewPw(""); setConfirmPw("");
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie seu perfil e preferências</p>
      </div>

      {/* Profile */}
      <div className="rounded-xl bg-card p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-card-foreground">Perfil</h2>
        </div>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold overflow-hidden group cursor-pointer shrink-0"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              name.split(" ").map(n => n[0]).join("")
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <Camera className="h-5 w-5 text-white" />
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <div className="flex-1 space-y-3">
            <div><Label>Nome Completo</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          </div>
        </div>
        <button onClick={handleSaveProfile} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">Salvar Perfil</button>
      </div>

      {/* Security */}
      <div className="rounded-xl bg-card p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-card-foreground">Segurança</h2>
        </div>
        <div><Label>Nova Senha</Label><Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} /></div>
        <div><Label>Confirmar Nova Senha</Label><Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} /></div>
        <button onClick={handlePasswordChange} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">Alterar Senha</button>
      </div>

      {/* Preferences */}
      <div className="rounded-xl bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sun className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-card-foreground">Preferências</h2>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
            <div>
              <p className="text-sm font-medium text-card-foreground">Modo Escuro</p>
              <p className="text-xs text-muted-foreground">Alternar entre tema claro e escuro</p>
            </div>
          </div>
          <Switch checked={isDark} onCheckedChange={setIsDark} />
        </div>
      </div>
    </div>
  );
};

export default Settings;
