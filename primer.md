# Primer — MindSet
> Last updated: 2026-04-09 by Claude Code

## Current State
- **Status:** Active
- **Last task completed:** Comprehensive UX overhaul — 9-phase sweep covering runtime bugs, accessibility, dead ends, touch targets, copy, RTL, performance
- **Next planned task:** Generate cover images for 9 books without covers, verify mobile on real device
- **Blocking issues:** ElevenLabs API key not configured (blocks TTS/music generation)

## UX Overhaul (2026-04-09) — 9 Phases
| Phase | Summary |
|-------|---------|
| 1 | Critical runtime bugs: `showPurchase` crash, speed bonus wiring, stale closures in exercise keyboard handlers, SortOrder passive touch listener, PlayerContext load race, Match double-fire guard, heart-modal useEffect instead of setTimeout-in-updater |
| 2 | Document structure: skip link `#main-content` target, `<h1>` hierarchy on all 7 pages, NotFoundPage RTL arrow + link fix, dead-end not-found screens with back/home buttons in LessonPage/BookPage/WorkbookPage, ErrorBoundary around ExerciseRouter |
| 3 | Modal focus traps: OutOfTokensModal, PopupModal (+close btn 44px), LandingPage auth modal, HomePage streak milestone popup — all with `role="dialog"`, `aria-modal`, `useFocusTrap`, Escape handler |
| 4 | ARIA semantics: BottomNav `<ul>/<li>` + spacedReviewQueue count in badge, SettingsPage `role="switch" aria-checked` on 3 toggles, LeaderboardPage `<ol>/<li>`, HomePage progress bars, StatsPage ProgressRing `<title>`, FeedbackPanel `aria-live="polite"`, FAQItem `aria-controls`, ReactConfetti `aria-hidden` |
| 5 | Touch targets (≥44px) + exercise a11y: HintButton, ExerciseHelp (+role dialog), SortOrder chevrons, AICoachChat input, MultipleChoice `aria-disabled`, SortOrder move announcements, Match color-blind numbered dots, Scenario keyboard shortcuts |
| 6 | UX state bugs: ReviewPage new-user empty state + counter `Math.min`, SettingsPage reset 5s auto-cancel, LessonComplete overflow-y, Leaderboard 0-XP user no demotion, removed duplicate SpacedReview banner, Reading scroll fade, Compare VS divider, StatsPage & WorkbookPage now import all 15 books |
| 7 | Copy & RTL: Hebrew auth error map in AuthContext, "100% חינם" → "פרק ראשון חינם", removed fake live-users counter (static "אלפי"), AICoachChat book-specific greeting + user-friendly error, AICoachButton+Chat moved bottom-left → bottom-right for RTL, bronze `#cd7f32` → `#e59866` for WCAG AA |
| 8 | Animations: `exerciseEnter/Exit` flipped to RTL reading direction, font scaling switched from `em` (compounds) to `rem` to avoid nested scaling, light-mode `glass-card` `backdrop-filter: none` (GPU win), FeedbackPanel auto-advance now announced to screen readers |
| 9 | Performance: `vercel.json` cache headers for `/backgrounds|books|avatars|steps|audio/`, LandingPage now `React.lazy` (main bundle 1389→1344 kB), react-confetti `React.lazy`, HomePage stagger cap at `Math.min(idx, 6) * 0.05s` |

Build clean after every phase. Total ~40 files touched.

## Recent Changes
| Date | What Changed | Files Affected |
|------|-------------|----------------|
| 2026-04-07 | Marketing videos: 2 Remotion loop-model reels (MindSetLoop, MindSetLoop2) | motion-design/src/compositions/ |
| 2026-04-07 | Multiple scroll/touch fixes for Android (8 commits, reverted to stable 1d3c3a0 then forward) | index.css, LessonPage, BottomNav, HomePage, FeatureSpotlight |
| 2026-04-07 | Comprehensive UX bug fixes — scroll, contrast, disabled states, alt text | index.css, 5 exercise components, modals, Header, AICoachChat |
| 2026-04-07 | Feedback panel dark bg fix for light mode | FeedbackPanel.jsx |
| 2026-04-07 | Leaderboard added to bottom nav | BottomNav.jsx |
| 2026-04-07 | Lesson scroll fix — touch-action: pan-y on scroll-momentum children | index.css, LessonPage.jsx |
| 2026-04-07 | Book descriptions + audience tags added to all 15 books | All 15 JSON files, BookPage, HomePage |
| 2026-04-07 | 5 new books: psychology-of-money, millionaire-next-door, think-and-grow-rich, blue-ocean-strategy, three-second-rule | 5 JSON files + 7 app files |
| 2026-04-07 | UX audit report (13 issues) | C:\Users\saraa\ux-audit\UX-AUDIT-REPORT.md |
| 2026-04-06 | Removed all pricing/premium/locked UI (14 files) | BookPage, LessonPage, modals, AI components, StreakFreeze, Settings, Landing, Footer, PlayerContext |
| 2026-04-06 | Registered 4 missing books (grit, power-of-now, seven-habits, thinking-fast-slow) | 7 app files |

## Library Status
- **Total books:** 15 (all registered in 7 app files)
- **With cover images:** 6 (strengths-finder, atomic-habits, happy-chemicals, next-five-moves, mindset-book, indistractable)
- **Without covers (emoji fallback):** 9 (grit, power-of-now, seven-habits, thinking-fast-slow, psychology-of-money, millionaire-next-door, think-and-grow-rich, blue-ocean-strategy, three-second-rule)
- **All books have:** description + audience fields

## Active Branches
- `master` — production (auto-deploys to Vercel)

## Environment Notes
- Dev server: `npm run dev` → localhost:5173
- Supabase project: `vrjrnnmbaankcococoeu.supabase.co`
- Deploy: git push to master (Vercel auto CI/CD)
- Vercel CLI broken (Hebrew team name) — use dashboard for manual deploys
- `ANTHROPIC_API_KEY` is server-side only (Vercel env)
- Marketing videos: `C:\Users\saraa\motion-design\` (Remotion 4.0.252)

## Marketing Videos
- **MindSetLoop** — "אתה לא צריך לקרוא ספר" (53s, AI B-roll hook)
- **MindSetLoop2** — "5 דקות ביום שמשנות הכל" (50s, counter animation)
- **Music:** "Driving Ambition" from Mixkit (royalty-free)
- **Style:** Loop model: Hook→CTA→Why→CTA→Who→CTA

## Open Questions
- Missing cover images for 9 books (emoji fallback works)
- ElevenLabs API key needed for TTS/music generation
- Mobile scroll still has edge cases on some Android devices
