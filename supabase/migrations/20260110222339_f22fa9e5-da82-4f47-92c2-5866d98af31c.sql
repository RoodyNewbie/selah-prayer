-- Add is_favorite column to prayer_requests table for Stones of Remembrance feature
ALTER TABLE public.prayer_requests 
ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT false;