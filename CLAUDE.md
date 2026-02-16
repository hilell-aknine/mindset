# MindSet - Gamified Book Learning Platform

## 1. Identity
MindSet transforms non-fiction books into interactive gamified micro-lessons (Duolingo-style).
Users "play" a book in 15 minutes instead of reading it.

## 2. Tech Stack
- **Frontend:** React + Vite + Tailwind CSS + Lucide React
- **Backend:** Supabase (Auth + PostgreSQL)
- **AI Coach:** Claude API via Vercel serverless proxy
- **Deploy:** Vercel

## 3. Design System
- **Colors:** deep-petrol (#003B46), muted-teal (#00606B), dusty-aqua (#2F8592), gold (#D4AF37), bg-base (#0a0a12)
- **Fonts:** Frank Ruhl Libre (display) + Heebo (body)
- **Theme:** Dark, glass-morphism, RTL Hebrew

## 4. Supabase
- **Project:** vrjrnnmbaankcococoeu.supabase.co
- **Tables:** mindset_users, mindset_books, mindset_chapters, mindset_lessons, mindset_questions, mindset_user_progress, mindset_review_queue, mindset_ai_chats
- **Auth:** Google OAuth + Email/Password + Guest mode

## 5. Business Model
- Free: First chapter + 3 daily AI tokens
- Book (37 NIS): Full book + 50 AI tokens
- Bundle (97 NIS): All books + unlimited AI + workbooks

## 6. Game Engine
7 exercise types: multiple-choice, fill-blank, order, compare, match, improve, identify

## 7. Content
Books are stored as static JSON in `src/data/books/`. Each book has chapters > lessons > exercises.

## 8. Copyright Rules
- No direct quotes from source books
- Rephrase all principles in original words
- Use scenario-based questions only
- Legal footer: "מדריך לא רשמי. אינו קשור למחברים המקוריים."

## 9. Key Commands
```
npm run dev     # Dev server on localhost:5173
npm run build   # Production build
```
