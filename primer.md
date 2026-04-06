# Primer — MindSet
> Last updated: 2026-04-06 by Claude Code

## Current State
- **Status:** Active
- **Last task completed:** UX improvements via AgenTopology (10 changes across 9 files)
- **Next planned task:** Manual QA of all UX changes, then git push to deploy
- **Blocking issues:** None

## Recent Changes
| Date | What Changed | Files Affected |
|------|-------------|----------------|
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
- 10 books exist in JSON but only 6 registered in Supabase seed — need to seed remaining 4
- Missing images: `/books/indistractable.png`, `/backgrounds/focus-shield.png`
