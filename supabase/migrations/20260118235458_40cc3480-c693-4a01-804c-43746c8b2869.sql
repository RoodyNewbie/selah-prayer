-- Create color_palettes table for storing user's custom color palettes
CREATE TABLE public.color_palettes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  primary_color text NOT NULL,
  accent_color text NOT NULL,
  background_tint text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster user queries
CREATE INDEX idx_color_palettes_user_id ON public.color_palettes(user_id);

-- Enable Row Level Security
ALTER TABLE public.color_palettes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own palettes"
  ON public.color_palettes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own palettes"
  ON public.color_palettes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own palettes"
  ON public.color_palettes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own palettes"
  ON public.color_palettes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updating updated_at
CREATE TRIGGER update_color_palettes_updated_at
  BEFORE UPDATE ON public.color_palettes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();