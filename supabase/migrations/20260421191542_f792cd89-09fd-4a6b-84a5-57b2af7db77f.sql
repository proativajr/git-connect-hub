CREATE TABLE public.diretoria_drive_config (
  diretoria TEXT PRIMARY KEY,
  folder_id TEXT,
  folder_name TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.diretoria_drive_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drive_config_auth_select"
ON public.diretoria_drive_config
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "drive_config_admin_insert"
ON public.diretoria_drive_config
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "drive_config_admin_update"
ON public.diretoria_drive_config
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "drive_config_admin_delete"
ON public.diretoria_drive_config
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_drive_config_updated_at
BEFORE UPDATE ON public.diretoria_drive_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

INSERT INTO public.diretoria_drive_config (diretoria, folder_name) VALUES
  ('presidencia', 'Drive — Presidência'),
  ('vp', 'Drive — Vice-Presidência'),
  ('projetos', 'Drive — Projetos'),
  ('comercial', 'Drive — Comercial')
ON CONFLICT (diretoria) DO NOTHING;