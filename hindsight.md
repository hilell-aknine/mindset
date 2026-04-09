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

### Side effects inside state updater callbacks
- **Date:** 2026-04-09
- **Problem:** `setTimeout(() => setShowOutOfHearts(true), 600)` was called *inside* a `setPlayer(prev => ...)` updater. React 18 Strict Mode runs updaters twice (double-fire); also causes "state update on unmounted component" warnings if the user navigates away within 600ms.
- **Fix:** Moved the check to a `useEffect` watching `player.hearts`, with a cleanup `clearTimeout` return so unmount is safe.
- **Rule:** State updater callbacks (`setX(prev => ...)`) must be pure — no timers, no other setState, no DOM access, no side effects. Put side effects in `useEffect` or in the event handler above the setState call.

### React synthetic events are passive by default — can't call preventDefault()
- **Date:** 2026-04-09
- **Problem:** SortOrder's `onTouchMove={handleTouchMove}` called `e.preventDefault()` but it was silently ignored — page still scrolled while dragging on mobile. React attaches synthetic touch listeners as passive.
- **Fix:** Use `useEffect` + `el.addEventListener('touchmove', handler, { passive: false })` on a ref. Remove the React `onTouchMove` prop entirely.
- **Rule:** Any touch/wheel handler that needs `preventDefault()` must be attached imperatively with `{ passive: false }` — React's synthetic event system can't do this.

### Stale closures in exercise keyboard handlers
- **Date:** 2026-04-09
- **Problem:** `useEffect` registered `window.addEventListener('keydown', ...)` calling a plain `handleCheck()` function. Because `handleCheck` was not in the effect's deps (and not `useCallback`-wrapped), the listener captured the first-render closure and used stale state on rapid key presses.
- **Fix:** Wrap `handleCheck` (and `handleSelect`, etc.) in `useCallback` with real dependency lists, then include `handleCheck` in the effect's dep array.
- **Rule:** When a keydown/wheel listener inside `useEffect` calls a function that reads state, either inline the state access from the dep array OR wrap the function in `useCallback` and add it as a dep. Never trust that a plain function defined in the component body will "see" current state.

### Load order matters for interdependent state chains
- **Date:** 2026-04-09
- **Problem:** PlayerContext.loadPlayerData ran `updateStreak → recoverHearts → resetDailyTokens → resetWeeklyXP` **before** awaiting the Supabase fetch. When Supabase resolved, `setPlayer(mapped)` overwrote the recovery. Also, `resetDailyTokens` checked `lastLoginDate === today`, but `updateStreak` had already overwritten `lastLoginDate` to today — so token reset silently skipped.
- **Fix:** Moved the recovery chain inside the `if (data)` block AFTER `setPlayer(mapped)`, and reordered as `resetDailyTokens → resetWeeklyXP → recoverHearts → updateStreak` so token/weekly reset happens before `lastLoginDate` is overwritten.
- **Rule:** When multiple `setPlayer(prev => ...)` calls each read a field that a later one writes, the call order determines correctness. Document the ordering constraint in a comment. Also: don't run "recovery" logic during the loading window while async fetches are still in flight.

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

### Vercel CLI broken with Hebrew team name
- **Date:** 2026-03-22
- **Problem:** Vercel CLI throws "not a legal HTTP header value" error
- **Root Cause:** Hebrew team name breaks HTTP headers
- **Fix:** Use Vercel dashboard or git push instead of CLI
- **Rule:** Never use Vercel CLI for this project. Deploy via git push to master.

### Heebo font doesn't render Hebrew in ffmpeg
- **Date:** 2026-04-07
- **Problem:** Hebrew text shows as rectangles (□□□) when using Heebo-Bold.ttf with ffmpeg drawtext
- **Root Cause:** The Heebo-Bold.ttf in ~/.fonts/ doesn't contain Hebrew glyphs, or ffmpeg can't read them without fontconfig
- **Fix:** Use `C:/Windows/Fonts/arialbd.ttf` instead — always works with Hebrew
- **Rule:** For ffmpeg drawtext with Hebrew, always use Arial Bold from Windows Fonts. For Remotion, use fonts.heebo from FreeToolkit (works via CSS).

### Puppeteer screenshots appear blank/dark
- **Date:** 2026-04-07
- **Problem:** Screenshots of MindSet app in dark mode appear as solid black — content invisible in video
- **Root Cause:** Dark mode background (#0a0a12) is nearly black, and screenshots at small resolution lose all detail
- **Fix:** Use light mode for marketing screenshots. Set `localStorage.setItem('mindset_theme', 'light')` and use `evaluateOnNewDocument` to set it before page load. Use `waitForSelector('h2')` + 2000ms delay to ensure React renders.
- **Rule:** Always take app screenshots in light mode for marketing materials. Dark mode only works when viewed at full screen resolution.

### overflow-x: clip breaks scrollTo() API
- **Date:** 2026-04-07
- **Problem:** `document.documentElement.scrollTo()` returns 0 — programmatic scroll broken
- **Root Cause:** `overflow-x: clip` on body and #root prevents scrollTo from working (CSS spec behavior)
- **Fix:** Changed to `overflow-x: hidden` on body, removed from #root entirely
- **Rule:** Never use `overflow-x: clip` on body or root. Use `overflow-x: hidden` instead.

### touch-action: manipulation blocks scroll in nested containers
- **Date:** 2026-04-07
- **Problem:** Lesson page can't scroll on mobile — buttons/radios inside scroll area eat touch events
- **Root Cause:** Global CSS `touch-action: manipulation` on buttons/radios prevents vertical pan in scroll containers
- **Fix:** Added `.scroll-momentum button, [role="radio"] { touch-action: pan-y !important; }` and later removed `touch-action: manipulation` entirely from global CSS, replaced with just `-webkit-tap-highlight-color: transparent`
- **Rule:** Never set `touch-action: manipulation` globally. Use only `-webkit-tap-highlight-color: transparent` for tap highlight removal. Let scroll containers control touch-action.

### ASS subtitles render Hebrew text reversed
- **Date:** 2026-04-07
- **Problem:** Hebrew text in ASS subtitle file appears mirrored/reversed in ffmpeg output
- **Root Cause:** ffmpeg's ASS renderer doesn't handle RTL text correctly without proper HarfBuzz/FriBidi support
- **Fix:** Use `drawtext` filter instead of ASS subtitles for Hebrew text
- **Rule:** For Hebrew video subtitles via ffmpeg, always use drawtext filter with arialbd.ttf. For Remotion, use HebrewTitle or fonts.heebo — they handle RTL natively.
