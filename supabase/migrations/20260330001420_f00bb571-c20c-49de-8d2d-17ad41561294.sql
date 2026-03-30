CREATE TABLE IF NOT EXISTS public.pco_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#c9a84c',
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pco_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pco_folders_auth" ON public.pco_folders
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE public.gente_uploads 
  ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.pco_folders(id) ON DELETE SET NULL;

INSERT INTO storage.buckets (id, name, public) VALUES ('pco-documentos', 'pco-documentos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "pco_docs_auth_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pco-documentos');

CREATE POLICY "pco_docs_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'pco-documentos');

CREATE POLICY "pco_docs_auth_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'pco-documentos');