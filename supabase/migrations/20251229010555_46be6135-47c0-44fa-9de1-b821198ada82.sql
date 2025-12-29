-- Add generated_prayer column to prayer_sessions
ALTER TABLE public.prayer_sessions
ADD COLUMN generated_prayer text;