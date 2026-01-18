-- Add is_donor column to existing profiles table
ALTER TABLE public.profiles
ADD COLUMN is_donor boolean NOT NULL DEFAULT false;