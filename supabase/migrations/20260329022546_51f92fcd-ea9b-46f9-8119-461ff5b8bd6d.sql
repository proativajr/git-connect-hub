-- Create parcerias-logos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('parcerias-logos', 'parcerias-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to parcerias-logos
CREATE POLICY "parcerias_logos_upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'parcerias-logos');

-- Allow public read access
CREATE POLICY "parcerias_logos_read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'parcerias-logos');

-- Allow authenticated users to update/delete their uploads
CREATE POLICY "parcerias_logos_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'parcerias-logos');

CREATE POLICY "parcerias_logos_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'parcerias-logos');

-- Add metadata column to gente_uploads for chart config
ALTER TABLE public.gente_uploads ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';