-- Add columns for personal prayer and meditation tracking
ALTER TABLE public.prayer_sessions
ADD COLUMN IF NOT EXISTS personal_prayer text,
ADD COLUMN IF NOT EXISTS meditation_seconds_used integer;