-- Create prayer_topics table for session memory
CREATE TABLE public.prayer_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.prayer_sessions(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('needs', 'forgiveness', 'protection')),
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_prayed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'answered', 'released')),
  answered_note TEXT,
  answered_date TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.prayer_topics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user isolation
CREATE POLICY "Users can view their own prayer topics"
ON public.prayer_topics
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prayer topics"
ON public.prayer_topics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prayer topics"
ON public.prayer_topics
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prayer topics"
ON public.prayer_topics
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_prayer_topics_user_phase_status 
ON public.prayer_topics(user_id, phase, status, last_prayed_at DESC);