-- Add RLS policy for updating prayer sessions
CREATE POLICY "Users can update their own prayer sessions"
ON public.prayer_sessions
FOR UPDATE
USING (auth.uid() = user_id);