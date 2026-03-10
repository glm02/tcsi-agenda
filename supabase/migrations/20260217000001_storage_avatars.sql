-- Bucket pour les photos de profil (hub étudiant)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique pour afficher les avatars
CREATE POLICY "Public read for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Upload limité à son propre fichier (nom = user_id.ext)
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND name LIKE (auth.uid()::text || '.%'));

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND name LIKE (auth.uid()::text || '.%'));
