# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Identity
MindSet transforms non-fiction books into interactive gamified micro-lessons (Duolingo-style).
Users "play" a book in 15 minutes instead of reading it. Hebrew RTL-first.

## Commands
```bash
npm run dev      # Vite dev server on localhost:5173
npm run build    # Production build → dist/
npm run preview  # Preview production build
npm run lint     # ESLint
```
Deploy: git push to Vercel (auto CI/CD). No Vercel CLI (Hebrew team name breaks it).

## Tech Stack
- **Frontend:** React 19 + Vite 7 + Tailwind CSS 4 + Lucide React + React Router 7
- **Backend:** Supabase (Auth + PostgreSQL) — project `vrjrnnmbaankcococoeu.supabase.co`
- **AI Coach:** Claude API (Haiku) via Vercel serverless proxy (`api/ai-coach.js`)
- **Deploy:** Vercel (SPA rewrites in `vercel.json`)

## Architecture

### Provider Stack (main.jsx)
`BrowserRouter > ToastProvider > AuthProvider > PlayerProvider > App`

### Contexts (3 global contexts)
- **AuthContext** — Supabase Auth (Google OAuth, email/password, guest mode via localStorage `mindset_guest`)
- **PlayerContext** — All game state (XP, level, hearts, tokens, streaks, achievements, progress). Dual-write: localStorage (instant) + Supabase (debounced 1s). `mapToDB()`/`mapFromDB()` for serialization.
- **ToastContext** — Notification toasts (success/error/info, auto-dismiss)

### Routing (App.jsx)
All pages lazy-loaded except LandingPage. Auth-protected routes redirect to `/` if not logged in.
```
/                                → LandingPage (public marketing)
/home                            → HomePage (library + dashboard)
/book/:slug                      → BookPage (chapters grid)
/lesson/:bookSlug/:ch/:lesson    → LessonPage (exercise player)
/review                          → ReviewPage (spaced repetition)
/stats                           → StatsPage
/leaderboard                     → LeaderboardPage
/settings                        → SettingsPage
/workbook/:slug                  → WorkbookPage
/admin                           → AdminPage (AdminGuard checks profiles.role === 'admin')
```

### Game Engine (`src/lib/gameEngine.js`)
8 exercise types with answer validation: `multiple-choice`, `fill-blank`, `order`, `compare`, `match`, `improve`, `identify`, `reading`. ExerciseRouter dispatches to the correct component. The `reading` type is always correct (awards XP for reading a passage).

### Game Constants (`src/config/constants.js`)
All tunable values: XP amounts, heart recovery (20min), token limits, level thresholds (0→8000 XP across 8 levels), streak tiers, spaced repetition intervals, combo system, pricing.

### Book Data
Static JSON files in `src/data/books/` (6 books, ~9K lines total). Structure: `{ slug, title, author, icon, systemPrompt, chapters: [{ lessons: [{ exercises: [...] }] }] }`. First chapter of each book is free (`isFree: true`).

Books: `atomic-habits`, `happy-chemicals`, `mindset-book`, `next-five-moves`, `strengths-finder`, `indistractable`

### Adding a New Book
When adding a book, update ALL 7 files (missing any causes silent failures):
1. `src/data/books/<slug>.json` — the book data file
2. `src/pages/BookPage.jsx` — import + add to `BOOKS` dict + `BOOK_COVERS` map
3. `src/pages/HomePage.jsx` — import + add to `BOOKS` array + `BOOK_COVERS` map
4. `src/pages/LandingPage.jsx` — import + add to `BOOKS` array + `bookImages` map
5. `src/contexts/PlayerContext.jsx` — import + add to `ALL_BOOKS` dict
6. `src/pages/LessonPage.jsx` — import + add to `BOOKS` dict (CRITICAL: without this, lessons 404)
7. `src/pages/ReviewPage.jsx` — import + add to `BOOKS` dict + `BOOKS_LIST` array

### Reading Passages
Each chapter's first lesson starts with a `type: "reading"` exercise — an original Hebrew passage summarizing the chapter's key ideas + 3 key points. Always included when adding new chapters. Structure: `{ type: "reading", passage, question, keyPoints: [...], explanation }`. Copyright-safe: all content must be rephrased, never quoted.

### Key Patterns
- **BOOK_COVERS mapping** — `BookPage.jsx` and `HomePage.jsx` both have a `BOOK_COVERS` dict mapping book slugs → image paths in `/backgrounds/`. Keep both in sync.
- **Streak images** — Tiered: `<30d → golden-chain.png`, `30-99d → streak-30.png`, `100+d → lion-flame.png`
- **LessonComplete** — Shows `perfect-lesson.png` for 0 mistakes, `golden-key-video.mp4` (desktop) / `golden-key.png` (mobile) otherwise
- **Video backgrounds** — Desktop: `<video>` with mp4. Mobile: static `<img>` fallback. Pattern: `hidden sm:block` / `sm:hidden`
- **Code splitting** — Vite manual chunks: `vendor` (React), `supabase`, `data` (book JSONs)
- **Mobile-first sizing** — Use `text-xs sm:text-sm`, `p-3 sm:p-5` pattern. Touch targets ≥44px. Long content needs `max-h-[Xvh] overflow-y-auto` so buttons stay visible.

### Supabase
8 tables (all prefixed `mindset_`): `users`, `books`, `chapters`, `lessons`, `questions`, `user_progress`, `review_queue`, `ai_chats`. RLS enabled. Public read for content tables, auth-only for user data.

### AI Coach
`POST /api/ai-coach` — Vercel serverless function. Sends `{ message, systemPrompt, history }`, returns `{ reply }`. Uses `ANTHROPIC_API_KEY` env var (server-side only). Each book has its own `systemPrompt` in the JSON.

## Design System
- **Colors:** deep-petrol `#003B46`, muted-teal `#00606B`, dusty-aqua `#2F8592`, gold `#D4AF37`, bg-base `#0a0a12`, frost-white `#E8F1F2`
- **Fonts:** Frank Ruhl Libre (display/headlines) + Heebo (body/UI)
- **Theme:** Dark glass-morphism, RTL Hebrew, `glass-card` utility class for cards
- **Images:** All in `public/backgrounds/` and `public/books/`. Compress to ~800px width before adding.

## Copyright Rules
- No direct quotes from source books
- Rephrase all principles in original words
- Use scenario-based questions only
- Legal footer: "מדריך לא רשמי. אינו קשור למחברים המקוריים."

## Known Issues (from QA audit 2026-03-22)
- Missing images: `/books/indistractable.png`, `/backgrounds/focus-shield.png` — need generation

## Environment Variables
```
VITE_SUPABASE_URL=https://vrjrnnmbaankcococoeu.supabase.co
VITE_SUPABASE_ANON_KEY=<key>
ANTHROPIC_API_KEY=<server-side, Vercel env only>
```
