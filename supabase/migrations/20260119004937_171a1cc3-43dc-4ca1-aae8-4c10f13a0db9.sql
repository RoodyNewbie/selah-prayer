-- Add meditation timer preferences to profiles table
ALTER TABLE public.profiles
ADD COLUMN meditation_timer_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN meditation_timer_duration integer NOT NULL DEFAULT 5;