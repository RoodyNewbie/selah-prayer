-- Allow users to delete their own prayer sessions
CREATE POLICY "Users can delete their own prayer sessions"
ON public.prayer_sessions
FOR DELETE
USING (auth.uid() = user_id);