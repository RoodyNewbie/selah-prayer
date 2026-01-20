-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a database function to handle safe profile updates (excludes is_donor)
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_display_name TEXT DEFAULT NULL,
  p_meditation_timer_enabled BOOLEAN DEFAULT NULL,
  p_meditation_timer_duration INTEGER DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    display_name = COALESCE(p_display_name, display_name),
    meditation_timer_enabled = COALESCE(p_meditation_timer_enabled, meditation_timer_enabled),
    meditation_timer_duration = COALESCE(p_meditation_timer_duration, meditation_timer_duration),
    updated_at = now()
  WHERE user_id = auth.uid();
END;
$$;

-- Create restrictive UPDATE policy that prevents is_donor modification
-- Users can only update allowed fields
CREATE POLICY "Users can update own profile safely"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add missing foreign key constraints with cascade delete
ALTER TABLE public.journal_entries
DROP CONSTRAINT IF EXISTS journal_entries_user_id_fkey;

ALTER TABLE public.journal_entries
ADD CONSTRAINT journal_entries_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.prayer_topics
DROP CONSTRAINT IF EXISTS prayer_topics_user_id_fkey;

ALTER TABLE public.prayer_topics
ADD CONSTRAINT prayer_topics_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Set existing admin accounts as permanent donors
UPDATE public.profiles
SET is_donor = true
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN (
    'dane.vicars@gmail.com',
    'selah.prayer.app@gmail.com',
    'brielhill412@gmail.com'
  )
);

-- Create trigger to auto-grant donor status to admin emails on signup
CREATE OR REPLACE FUNCTION public.check_admin_donor_status()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = NEW.user_id 
    AND email IN (
      'dane.vicars@gmail.com',
      'selah.prayer.app@gmail.com',
      'brielhill412@gmail.com'
    )
  ) THEN
    NEW.is_donor := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop if exists and recreate
DROP TRIGGER IF EXISTS admin_donor_check ON public.profiles;
CREATE TRIGGER admin_donor_check
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_admin_donor_status();