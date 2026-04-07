# Hindsight — MindSet
> Lessons learned the hard way. Read this BEFORE starting any task.

## Format
Each entry follows:
```
### [Short Title]
- **Date:** YYYY-MM-DD
- **Problem:** What went wrong
- **Root Cause:** Why it happened
- **Fix:** How it was resolved
- **Rule:** The rule to prevent recurrence
```

## Entries

### Supabase tables don't exist yet
- **Date:** 2026-04-06
- **Problem:** Admin dashboard showed 0 users, query failed with "relation mindset_users does not exist"
- **Root Cause:** Schema SQL was written but never executed on the remote Supabase DB. App was running entirely on localStorage (guest mode).
- **Fix:** Ran `npx supabase db query -f sql/mindset-schema.sql --linked`
- **Rule:** After writing schema SQL, always verify tables exist on remote before assuming they work.

### RLS blocks admin from reading all users
- **Date:** 2026-04-06
- **Problem:** Admin can't see users list — RLS policy only allows users to read their own data
- **Root Cause:** Default RLS policy `auth.uid() = user_id` blocks admin from listing all users
- **Fix:** Added policy `auth.jwt() ->> 'email' = 'hillelaknine@gmail.com'` for SELECT on mindset_users
- **Rule:** When adding admin features that query all rows, always add an admin RLS policy. MindSet uses email whitelist (not profiles table).

### React Router doesn't scroll to top on navigation
- **Date:** 2026-04-07
- **Problem:** Navigating between pages keeps scroll position from previous page — user lands mid-page
- **Root Cause:** React Router v7 doesn't auto-reset scroll position on route change
- **Fix:** Added `ScrollToTop` component that calls `window.scrollTo(0, 0)` on pathname change
- **Rule:** Always add ScrollToTop to React Router apps. It's not built-in.

### BottomNav visible during onboarding
- **Date:** 2026-04-07
- **Problem:** BottomNav overlapped the onboarding "המשך" button and allowed navigating away mid-onboarding
- **Root Cause:** BottomNav only hid for `/` and `/lesson` — didn't check `player.onboardingComplete`
- **Fix:** Added `!player.onboardingComplete` to BottomNav's shouldHide condition
- **Rule:** BottomNav should always check auth + onboarding state, not just pathname.

### Dead state setter crashes on lesson navigation
- **Date:** 2026-04-07
- **Problem:** `setShowPurchase(false)` in LessonPage reset effect — function doesn't exist after pricing removal
- **Root Cause:** Leftover from the pricing/premium removal sweep (2026-04-06) that missed this line
- **Fix:** Removed the dead `setShowPurchase(false)` call
- **Rule:** After bulk feature removal, grep for ALL state setters of removed state, not just the `useState` declarations.

### Vercel CLI broken with Hebrew team name
- **Date:** 2026-03-22
- **Problem:** Vercel CLI throws "not a legal HTTP header value" error
- **Root Cause:** Hebrew team name breaks HTTP headers
- **Fix:** Use Vercel dashboard or git push instead of CLI
- **Rule:** Never use Vercel CLI for this project. Deploy via git push to master.
