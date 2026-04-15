-- 1. Make pco-documentos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'pco-documentos';

-- 2. Drop overly permissive storage policies for pco-documentos
DROP POLICY IF EXISTS "pco_docs_public_read" ON storage.objects;
DROP POLICY IF EXISTS "pco_docs_select" ON storage.objects;
DROP POLICY IF EXISTS "pco_docs_auth_read" ON storage.objects;

-- 3. Create authenticated-only policies for pco-documentos
CREATE POLICY "pco_docs_auth_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'pco-documentos');

-- 4. Restrict profiles SELECT - remove the policy that exposes all profiles to all authenticated users
DROP POLICY IF EXISTS "profiles_auth_select" ON profiles;