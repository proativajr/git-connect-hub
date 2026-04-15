INSERT INTO public.access_codes (section_key, code_hash)
SELECT 'diretoria_presidencia', code_hash
FROM public.access_codes
WHERE section_key = 'pres_financeiro'
ON CONFLICT DO NOTHING;