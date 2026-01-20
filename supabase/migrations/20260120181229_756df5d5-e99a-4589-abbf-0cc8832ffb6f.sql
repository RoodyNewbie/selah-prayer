-- Create table to track prayer generations for rate limiting
CREATE TABLE public.prayer_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.prayer_generations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own generation records
CREATE POLICY "Users can view own generations"
ON public.prayer_generations FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own generation records (edge function uses service role)
CREATE POLICY "Users can insert own generations"
ON public.prayer_generations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups by user and date
CREATE INDEX idx_prayer_generations_user_date 
ON public.prayer_generations(user_id, created_at DESC);