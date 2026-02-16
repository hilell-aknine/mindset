-- ═══════════════════════════════════════════════════
-- MindSet Platform - Supabase Schema
-- Run in Supabase Dashboard → SQL Editor
-- Project: vrjrnnmbaankcococoeu.supabase.co
-- ═══════════════════════════════════════════════════

-- 1. USERS
CREATE TABLE IF NOT EXISTS mindset_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    hearts INTEGER DEFAULT 5,
    max_hearts INTEGER DEFAULT 5,
    tokens INTEGER DEFAULT 3,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_login_date TEXT,
    last_heart_lost TIMESTAMPTZ,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_books JSONB DEFAULT '[]'::jsonb,
    total_correct INTEGER DEFAULT 0,
    total_wrong INTEGER DEFAULT 0,
    achievements JSONB DEFAULT '[]'::jsonb,
    daily_challenge_completed TEXT,
    onboarding_complete BOOLEAN DEFAULT FALSE,
    completed_lessons JSONB DEFAULT '{}'::jsonb,
    review_queue JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BOOKS
CREATE TABLE IF NOT EXISTS mindset_books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    author TEXT,
    cover_image_url TEXT,
    icon TEXT DEFAULT '📚',
    system_prompt TEXT,
    price_nis INTEGER DEFAULT 37,
    is_published BOOLEAN DEFAULT TRUE,
    total_chapters INTEGER DEFAULT 0,
    total_exercises INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CHAPTERS
CREATE TABLE IF NOT EXISTS mindset_chapters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES mindset_books(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📖',
    is_free BOOLEAN DEFAULT FALSE,
    total_lessons INTEGER DEFAULT 0,
    total_exercises INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(book_id, order_index)
);

-- 4. LESSONS
CREATE TABLE IF NOT EXISTS mindset_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chapter_id UUID REFERENCES mindset_chapters(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    total_exercises INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chapter_id, order_index)
);

-- 5. QUESTIONS
CREATE TABLE IF NOT EXISTS mindset_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID REFERENCES mindset_lessons(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'multiple-choice', 'fill-blank', 'order',
        'compare', 'match', 'improve', 'identify'
    )),
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(lesson_id, order_index)
);

-- 6. USER PROGRESS
CREATE TABLE IF NOT EXISTS mindset_user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    book_id UUID REFERENCES mindset_books(id) ON DELETE CASCADE NOT NULL,
    chapter_id UUID REFERENCES mindset_chapters(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES mindset_lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    score INTEGER DEFAULT 0,
    mistakes INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- 7. REVIEW QUEUE
CREATE TABLE IF NOT EXISTS mindset_review_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES mindset_questions(id) ON DELETE CASCADE NOT NULL,
    book_id UUID REFERENCES mindset_books(id) ON DELETE CASCADE NOT NULL,
    next_review_at TIMESTAMPTZ DEFAULT NOW(),
    interval_days INTEGER DEFAULT 1,
    ease_factor FLOAT DEFAULT 2.5,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- 8. AI CHAT HISTORY
CREATE TABLE IF NOT EXISTS mindset_ai_chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    book_id UUID REFERENCES mindset_books(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_mindset_users_uid ON mindset_users(user_id);
CREATE INDEX IF NOT EXISTS idx_mindset_chapters_book ON mindset_chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_mindset_lessons_chapter ON mindset_lessons(chapter_id);
CREATE INDEX IF NOT EXISTS idx_mindset_questions_lesson ON mindset_questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_mindset_progress_user ON mindset_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_mindset_progress_book ON mindset_user_progress(book_id);
CREATE INDEX IF NOT EXISTS idx_mindset_review_user ON mindset_review_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_mindset_chats_user ON mindset_ai_chats(user_id);

-- ═══════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════
ALTER TABLE mindset_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindset_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindset_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindset_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindset_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindset_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindset_review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindset_ai_chats ENABLE ROW LEVEL SECURITY;

-- Public read for content
CREATE POLICY "Anyone can read books" ON mindset_books FOR SELECT USING (true);
CREATE POLICY "Anyone can read chapters" ON mindset_chapters FOR SELECT USING (true);
CREATE POLICY "Anyone can read lessons" ON mindset_lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can read questions" ON mindset_questions FOR SELECT USING (true);

-- User data: own data only
CREATE POLICY "Users read own data" ON mindset_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own data" ON mindset_users FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own data" ON mindset_users FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own progress" ON mindset_user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON mindset_user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON mindset_user_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own reviews" ON mindset_review_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reviews" ON mindset_review_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON mindset_review_queue FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own reviews" ON mindset_review_queue FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own chats" ON mindset_ai_chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own chats" ON mindset_ai_chats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════
-- AUTO-UPDATE TRIGGER
-- ═══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_mindset_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mindset_users_updated
    BEFORE UPDATE ON mindset_users
    FOR EACH ROW EXECUTE FUNCTION update_mindset_updated_at();

-- ═══════════════════════════════════════════════════
-- SEED: First book
-- ═══════════════════════════════════════════════════
INSERT INTO mindset_books (slug, title, author, icon, system_prompt, price_nis, total_chapters, total_exercises)
VALUES (
    'strengths-finder',
    'גלה את החוזקות שלך',
    'גישת החוזקות',
    '💪',
    'אתה מאמן אישי שמתמחה בגישת החוזקות. עזור ללומד להבין את החוזקות שלו וכיצד ליישם אותן בחיי היומיום. ענה בקצרה, בעברית, בטון חם ומעודד. השתמש בדוגמאות מעשיות. הימנע מציטוטים ישירים.',
    37,
    5,
    90
) ON CONFLICT (slug) DO NOTHING;
