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

### Vercel CLI broken with Hebrew team name
- **Date:** 2026-03-22
- **Problem:** Vercel CLI throws "not a legal HTTP header value" error
- **Root Cause:** Hebrew team name breaks HTTP headers
- **Fix:** Use Vercel dashboard or git push instead of CLI
- **Rule:** Never use Vercel CLI for this project. Deploy via git push to master.
