-- Bucket para fotos de instructoras
-- Ejecuta esto en el SQL Editor de Supabase

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'instructor-photos',
  'instructor-photos',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: solo staff puede subir
CREATE POLICY "staff_upload_instructor_photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'instructor-photos'
  AND auth.uid() IS NOT NULL
);

-- Policy: cualquiera puede ver las fotos (bucket es público)
CREATE POLICY "public_read_instructor_photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'instructor-photos');

-- Policy: staff puede actualizar/reemplazar
CREATE POLICY "staff_update_instructor_photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'instructor-photos'
  AND auth.uid() IS NOT NULL
);
