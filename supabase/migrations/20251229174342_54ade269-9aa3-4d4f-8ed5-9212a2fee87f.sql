-- Create prayer_formats table for customizable prayer structures
CREATE TABLE public.prayer_formats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  phases JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add format_id to prayer_sessions to track which format was used
ALTER TABLE public.prayer_sessions 
ADD COLUMN format_id UUID REFERENCES public.prayer_formats(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.prayer_formats ENABLE ROW LEVEL SECURITY;

-- Users can view system formats (available to everyone)
CREATE POLICY "Anyone can view system formats"
ON public.prayer_formats
FOR SELECT
USING (is_system = true);

-- Users can view their own formats
CREATE POLICY "Users can view their own formats"
ON public.prayer_formats
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own formats
CREATE POLICY "Users can insert their own formats"
ON public.prayer_formats
FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_system = false);

-- Users can update their own formats (not system ones)
CREATE POLICY "Users can update their own formats"
ON public.prayer_formats
FOR UPDATE
USING (auth.uid() = user_id AND is_system = false);

-- Users can delete their own formats (not system ones)
CREATE POLICY "Users can delete their own formats"
ON public.prayer_formats
FOR DELETE
USING (auth.uid() = user_id AND is_system = false);

-- Trigger for updated_at
CREATE TRIGGER update_prayer_formats_updated_at
BEFORE UPDATE ON public.prayer_formats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();