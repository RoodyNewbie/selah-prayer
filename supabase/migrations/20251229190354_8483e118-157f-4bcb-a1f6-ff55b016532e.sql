-- Add testimony and answer tracking columns to prayer_requests
ALTER TABLE public.prayer_requests 
ADD COLUMN testimony TEXT,
ADD COLUMN answer_type TEXT CHECK (answer_type IN ('fully', 'differently', 'partially', 'peace')),
ADD COLUMN gratitude_note TEXT;