-- Popup management table for admin-controlled modal popups
-- Run in Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS mindset_popups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    image_url TEXT,
    cta_text TEXT,
    cta_url TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mindset_popups ENABLE ROW LEVEL SECURITY;

-- Public read for active popups (anon key can fetch)
CREATE POLICY "Public can read active popups"
    ON mindset_popups FOR SELECT
    USING (is_active = true);

-- Admin reads all popups (including inactive) when authenticated
CREATE POLICY "Authenticated can read all popups"
    ON mindset_popups FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated can insert popups"
    ON mindset_popups FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated can update popups"
    ON mindset_popups FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated can delete popups"
    ON mindset_popups FOR DELETE
    TO authenticated
    USING (true);
