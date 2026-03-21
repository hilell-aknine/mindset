-- Add listened_audio_summaries column to mindset_users
-- Run this in Supabase SQL Editor
ALTER TABLE mindset_users
ADD COLUMN IF NOT EXISTS listened_audio_summaries jsonb DEFAULT '{}'::jsonb;
