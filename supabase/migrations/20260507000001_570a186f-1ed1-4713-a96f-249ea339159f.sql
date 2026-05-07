
-- Donor check helper
CREATE OR REPLACE FUNCTION public.is_donor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND is_donor = true
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_donor(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_donor(uuid) TO authenticated;

-- color_palettes: donor-only INSERT
DROP POLICY IF EXISTS "Users can insert their own palettes" ON public.color_palettes;
CREATE POLICY "Donors can insert their own palettes"
ON public.color_palettes
FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_donor(auth.uid()));

-- custom_audio_tracks: donor-only INSERT
DROP POLICY IF EXISTS "Users can insert their own audio tracks" ON public.custom_audio_tracks;
CREATE POLICY "Donors can insert their own audio tracks"
ON public.custom_audio_tracks
FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_donor(auth.uid()));

-- prayer_formats: donor-only custom format INSERT
DROP POLICY IF EXISTS "Users can insert their own formats" ON public.prayer_formats;
CREATE POLICY "Donors can insert their own formats"
ON public.prayer_formats
FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_system = false AND public.is_donor(auth.uid()));

-- Storage: donor-only INSERT on custom-audio bucket
DROP POLICY IF EXISTS "Users can upload their own audio files" ON storage.objects;
CREATE POLICY "Donors can upload their own audio files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'custom-audio'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND public.is_donor(auth.uid())
);

-- Storage: add missing UPDATE policy scoped to user folder + donor
CREATE POLICY "Donors can update their own audio files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'custom-audio'
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'custom-audio'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND public.is_donor(auth.uid())
);

-- Lock down SECURITY DEFINER trigger functions from being called as RPCs
REVOKE EXECUTE ON FUNCTION public.check_admin_donor_status() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sanitize_profile_on_insert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- update_user_profile is intended for signed-in users only
REVOKE EXECUTE ON FUNCTION public.update_user_profile(text, boolean, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_user_profile(text, boolean, integer) TO authenticated;
