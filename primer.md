# Primer — MindSet
> Last updated: 2026-04-06 by Claude Code

## Current State
- **Status:** Active
- **Last task completed:** Removed all pricing/premium UI — everything is free and open
- **Next planned task:** Generate cover images for 4 new books
- **Blocking issues:** None

## Recent Changes
| Date | What Changed | Files Affected |
|------|-------------|----------------|
| 2026-04-06 | Removed all pricing/premium/locked UI (14 files) | BookPage, LessonPage, OutOfHeartsModal, OutOfTokensModal, AICoachButton, AIScenarioChat, AICoachChat, StreakFreeze, WorkbookPage, SettingsPage, LandingPage, Footer, SettingsTab, PlayerContext |
| 2026-04-06 | Registered 4 missing books in all 7 app files | HomePage, BookPage, LessonPage, PlayerContext, ReviewPage, LandingPage, achievements.js |
| 2026-04-06 | UX improvements via mindset-ux.at topology | OutOfHeartsModal, Header, LessonPage, FeedbackPanel, ExerciseRouter, Scenario, Match, Identify, HomePage |
| 2026-04-06 | Brain architecture installed | CLAUDE.md, primer.md, hindsight.md |
| 2026-04-06 | Supabase schema deployed (8 tables + RLS) | sql/mindset-schema.sql (run on remote DB) |
| 2026-04-06 | Admin RLS policy for reading all users | SQL policy added directly |
| 2026-03-22 | QA audit fixes + mobile UX | Multiple components |
| 2026-03-22 | Admin popup management system | AdminPage, PopupsTab |

## Active Branches
- `master` — production (auto-deploys to Vercel)

## Environment Notes
- Dev server: `npm run dev` → localhost:5173
- Supabase project: `vrjrnnmbaankcococoeu.supabase.co`
- Deploy: git push to master (Vercel auto CI/CD)
- Vercel CLI broken (Hebrew team name) — use dashboard for manual deploys
- `ANTHROPIC_API_KEY` is server-side only (Vercel env)

## Open Questions
- Missing cover images for 4 new books: `/books/grit.png`, `/books/power-of-now.png`, `/books/seven-habits.png`, `/books/thinking-fast-slow.png` (fallback to emoji icons works)
- Missing background images for 4 new books (BOOK_COVERS + bookImages maps not populated — emoji fallback active)
- Missing images: `/books/indistractable.png`, `/backgrounds/focus-shield.png`
