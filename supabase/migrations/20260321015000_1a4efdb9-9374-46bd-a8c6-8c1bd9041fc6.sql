-- Drop the blanket UPDATE policy that allows users to set is_donor, subscription_status, etc.
-- All legitimate profile updates must go through the update_user_profile() SECURITY DEFINER RPC,
-- which only allows modifying display_name, meditation_timer_enabled, and meditation_timer_duration.
DROP POLICY IF EXISTS "Users can update own profile safely" ON public.profiles;