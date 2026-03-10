-- Hub étudiant: colonnes profil (photo, pseudo, thème, préférences, classement)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS pseudo text,
  ADD COLUMN IF NOT EXISTS theme text DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS accent_color text,
  ADD COLUMN IF NOT EXISTS dashboard_preference text DEFAULT 'grades',
  ADD COLUMN IF NOT EXISTS blur_grades boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ranking_visible boolean DEFAULT true;

COMMENT ON COLUMN public.profiles.avatar_url IS 'URL Supabase Storage pour la photo de profil';
COMMENT ON COLUMN public.profiles.pseudo IS 'Pseudo affiché dans les classements';
COMMENT ON COLUMN public.profiles.ranking_visible IS 'Si false, l''utilisateur ne figure pas dans le classement public';
