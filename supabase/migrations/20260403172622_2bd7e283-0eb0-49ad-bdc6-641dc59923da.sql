-- Unique constraint on board_id
ALTER TABLE public.monday_boards ADD CONSTRAINT monday_boards_board_id_unique UNIQUE (board_id);

-- Seed 4 boards
INSERT INTO public.monday_boards (board_id, diretoria, title)
VALUES
  ('board_presidencia', 'presidencia', 'Monday — Presidência'),
  ('board_vp',          'vp',          'Monday — Vice-Presidência'),
  ('board_projetos',    'projetos',    'Monday — Projetos'),
  ('board_comercial',   'comercial',   'Monday — Comercial')
ON CONFLICT (board_id) DO NOTHING;

-- Storage bucket for PCO documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('pco-documentos', 'pco-documentos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for pco-documentos
CREATE POLICY "pco_docs_select" ON storage.objects FOR SELECT USING (bucket_id = 'pco-documentos');
CREATE POLICY "pco_docs_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pco-documentos' AND auth.role() = 'authenticated');
CREATE POLICY "pco_docs_update" ON storage.objects FOR UPDATE USING (bucket_id = 'pco-documentos' AND auth.role() = 'authenticated');
CREATE POLICY "pco_docs_delete" ON storage.objects FOR DELETE USING (bucket_id = 'pco-documentos' AND auth.role() = 'authenticated');