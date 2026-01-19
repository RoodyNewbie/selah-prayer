-- Create storage bucket for custom audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-audio', 'custom-audio', false)
ON CONFLICT (id) DO NOTHING;

-- Create custom_audio_tracks table
CREATE TABLE public.custom_audio_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_audio_tracks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_audio_tracks
CREATE POLICY "Users can view their own audio tracks"
ON public.custom_audio_tracks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audio tracks"
ON public.custom_audio_tracks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audio tracks"
ON public.custom_audio_tracks
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio tracks"
ON public.custom_audio_tracks
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_custom_audio_tracks_updated_at
BEFORE UPDATE ON public.custom_audio_tracks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for custom-audio bucket
-- Users can view their own audio files
CREATE POLICY "Users can view their own audio files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'custom-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can upload their own audio files
CREATE POLICY "Users can upload their own audio files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'custom-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own audio files
CREATE POLICY "Users can delete their own audio files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'custom-audio' AND auth.uid()::text = (storage.foldername(name))[1]);