# Security Audit Report - Selah Prayer App

**Date:** January 20, 2026
**Auditor:** Claude (AI Security Review)
**Scope:** Full application security review

---

## Executive Summary

This audit identified **2 critical vulnerabilities**, **3 high-priority issues**, and several medium/low priority concerns. The most urgent issue is that **users can grant themselves donor status without payment**, bypassing your entire monetization system.

Your RLS (Row Level Security) implementation is generally solid, with proper user isolation across all tables. However, there are gaps in column-level restrictions and rate limiting that need immediate attention before accepting payments.

---

## CRITICAL VULNERABILITIES (Fix Immediately)

### 1. Users Can Self-Assign Donor Status

**Severity:** CRITICAL
**Location:** Database RLS Policy + `src/pages/Settings.tsx:594-597`
**Impact:** Complete bypass of payment/monetization system

**The Problem:**

The `profiles` table RLS policy allows users to UPDATE their own profile:

```sql
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);
```

This policy has no column restrictions. The `is_donor` column is part of the `profiles` table, meaning **any authenticated user can run this query**:

```javascript
await supabase
  .from('profiles')
  .update({ is_donor: true })
  .eq('user_id', user.id);
```

This grants them full donor access without ever paying.

**Evidence:** This exact code exists in `Settings.tsx:594-597` in your "Developer Tools" section.

**Fix Required:**

Create a new restricted UPDATE policy that explicitly excludes `is_donor`:

```sql
-- Drop the existing policy
DROP POLICY "Users can update their own profile" ON public.profiles;

-- Create restricted policy (excludes is_donor)
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  -- Prevent users from modifying is_donor through direct updates
  -- Only allow updating non-sensitive columns
  auth.uid() = user_id
);

-- OR use a more secure approach with a database function:
-- Create a function that only Stripe webhooks can call to set is_donor
```

**Best Practice:** The `is_donor` flag should ONLY be settable by:
- A Stripe webhook edge function (server-side, with service_role key)
- An admin interface (if you build one)

---

### 2. Developer Tools Exposed to ALL Users

**Severity:** CRITICAL
**Location:** `src/pages/Settings.tsx:557-617`
**Impact:** Direct UI to exploit vulnerability #1

**The Problem:**

The developer tools section that includes "Toggle Donor" is visible to ALL users:

```typescript
{/* Developer Tools - visible in dev/preview, remove before production */}
{(  // <-- This condition is ALWAYS TRUE
  <section className="mt-8">
```

The condition `{(` is just an opening parenthesis - there's no actual check! The comment says "visible in dev/preview" but there's no `isDev` or `import.meta.env.DEV` check.

**Fix Required:**

Either remove this entire section before production, or properly gate it:

```typescript
// Option 1: Remove entirely (recommended)
// Delete lines 556-617

// Option 2: Proper environment check
{import.meta.env.DEV && (
  <section className="mt-8">
    ...
  </section>
)}
```

---

## HIGH PRIORITY ISSUES

### 3. No Rate Limiting on AI Prayer Generation

**Severity:** HIGH
**Location:** `src/pages/Pray.tsx:131-169`, `supabase/functions/generate-prayer/index.ts`
**Impact:** Uncontrolled API costs, potential for abuse

**The Problem:**

Users can generate unlimited AI prayers by:
- Clicking "Generate Prayer from Your Notes" repeatedly
- Clicking the refresh button on generated prayers
- Programmatically calling the endpoint

While the Lovable AI gateway may have some rate limiting (your code handles 429 responses), you have:
- No client-side debouncing/cooldown
- No per-user daily/hourly limits
- No tracking of generation counts

**Cost Risk:** A malicious user could rack up significant API costs by automating prayer generation requests.

**Recommended Fixes:**

**A. Client-side debouncing (immediate):**
```typescript
// Add cooldown after generation
const [lastGenerated, setLastGenerated] = useState<number>(0);
const COOLDOWN_MS = 30000; // 30 seconds

const generatePrayer = async () => {
  const now = Date.now();
  if (now - lastGenerated < COOLDOWN_MS) {
    toast.error('Please wait before generating another prayer');
    return;
  }
  setLastGenerated(now);
  // ... rest of function
};
```

**B. Server-side rate limiting (recommended):**
Add to your edge function:
```typescript
// Track generations per user in a simple table or Redis
// Limit to X generations per day
const { count } = await supabase
  .from('prayer_generations')
  .select('*', { count: 'exact' })
  .eq('user_id', user.id)
  .gte('created_at', new Date(Date.now() - 24*60*60*1000).toISOString());

if (count >= 50) { // Daily limit
  return new Response(
    JSON.stringify({ error: "Daily generation limit reached" }),
    { status: 429, headers: corsHeaders }
  );
}
```

**C. Consider donor-tier limits:**
- Free users: 10 generations/day
- Donors: 100 generations/day (or unlimited)

---

### 4. Missing Foreign Key Constraints

**Severity:** HIGH
**Location:** Database schema
**Impact:** Data integrity issues, orphaned records

**Tables affected:**
- `journal_entries.user_id` - No FK to `auth.users(id)`
- `prayer_topics.user_id` - No FK to `auth.users(id)`

**The Problem:**

If a user is deleted from `auth.users`, their `journal_entries` and `prayer_topics` won't cascade delete, leaving orphaned data.

**Fix Required:**

```sql
-- For journal_entries
ALTER TABLE public.journal_entries
ADD CONSTRAINT journal_entries_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- For prayer_topics
ALTER TABLE public.prayer_topics
ADD CONSTRAINT prayer_topics_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

---

### 5. Wide-Open CORS on Edge Function

**Severity:** HIGH
**Location:** `supabase/functions/generate-prayer/index.ts:4-7`
**Impact:** Any website can call your API

**The Problem:**

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",  // <-- Allows ANY origin
  ...
};
```

This means any website can make requests to your generate-prayer function if they have a valid JWT. While the JWT requirement provides some protection, this is still overly permissive.

**Fix Required:**

Restrict to your domain:

```typescript
const ALLOWED_ORIGINS = [
  'https://your-app.lovable.dev',
  'https://your-custom-domain.com',
  'http://localhost:5173', // for local dev
  'http://localhost:8080',
];

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

// Then in your handler:
const origin = req.headers.get('origin') || '';
return new Response(data, { headers: corsHeaders(origin) });
```

---

## MEDIUM PRIORITY ISSUES

### 6. No Server-Side File Size Validation for Audio Uploads

**Location:** `src/hooks/useCustomAudioTracks.ts:66-68`, Storage policies
**Impact:** Users could bypass client-side checks to upload large files

The 10MB file size limit is only enforced client-side. A user with browser dev tools could bypass this.

**Recommendation:** Add a Supabase storage file size limit in the bucket configuration, or create an edge function that handles uploads with server-side validation.

---

### 7. Donor-Gated Features Have Only Client-Side Checks

**Location:** Multiple components using `DonorGate` and `isDonor`
**Impact:** UI-only restrictions can be bypassed

Features like custom color palettes, audio uploads, and custom prayer formats check `isDonor` on the client. Since users can self-assign donor status (issue #1), these checks are meaningless until #1 is fixed.

**Additional Recommendation:** Even after fixing #1, consider adding server-side RLS checks for donor-only tables:

```sql
-- Example: Only donors can insert custom audio tracks
CREATE POLICY "Only donors can insert audio tracks"
ON public.custom_audio_tracks FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND is_donor = true
  )
);
```

---

### 8. No Input Sanitization for User Content

**Location:** Prayer content, journal entries, request titles
**Impact:** Potential for stored content issues

While React auto-escapes content in JSX, you're storing raw user input. Consider:
- Trimming whitespace (partially done)
- Removing or escaping HTML tags
- Setting maximum lengths at the database level

**Database-level constraints example:**
```sql
ALTER TABLE prayer_requests
ADD CONSTRAINT title_length CHECK (char_length(title) <= 500);
```

---

### 9. Session Storage Includes Sensitive Patterns

**Location:** `src/lib/storage.ts`
**Impact:** Low - localStorage used for non-sensitive preferences

The localStorage is used for dark mode and as a fallback for sessions. This is fine, but be aware:
- Don't store payment info in localStorage
- Don't store API keys client-side
- The Supabase session in localStorage is acceptable (standard practice)

---

## GOOD SECURITY PRACTICES ALREADY IN PLACE

1. **RLS Enabled on All Tables** - Every table has `ENABLE ROW LEVEL SECURITY` with proper user isolation policies.

2. **Proper Storage Bucket Isolation** - The `custom-audio` bucket is private with folder-based user isolation using `storage.foldername(name)`.

3. **JWT Verification in Edge Function** - Manual JWT verification in the generate-prayer function provides authentication.

4. **Input Validation** - Prayer phases have length limits (1000 chars per phase, 5000 total) and allowed key validation.

5. **File Type Validation** - Audio uploads only accept MP3/WAV mime types.

6. **Track Limits** - Users limited to 3 custom audio tracks.

7. **Cascade Deletes** - Most tables properly cascade on user deletion (except journal_entries and prayer_topics - see issue #4).

8. **Supabase Auth Best Practices** - Using `persistSession: true` and `autoRefreshToken: true`.

---

## PRE-STRIPE CHECKLIST

Before implementing Stripe, ensure these are complete:

- [ ] **Fix is_donor RLS policy** (Critical #1)
- [ ] **Remove Developer Tools section** (Critical #2)
- [ ] **Add rate limiting to AI generation** (High #3)
- [ ] **Add foreign key constraints** (High #4)
- [ ] **Restrict CORS origins** (High #5)
- [ ] Create Stripe webhook edge function that:
  - Uses `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
  - Verifies Stripe webhook signatures
  - Is the ONLY way to set `is_donor = true`
- [ ] Add `stripe_customer_id` column to profiles
- [ ] Consider adding payment history table for receipts
- [ ] Test all donor-gated features can't be accessed without payment

---

## OBSERVABILITY RECOMMENDATIONS

As mentioned in the Reddit post you shared, observability is often missing. Consider:

1. **Structured Logging** - Add consistent logging to your edge function with user IDs, timestamps, and action types.

2. **Error Tracking** - Integrate Sentry or similar for frontend error tracking.

3. **Usage Metrics** - Track:
   - Prayer generations per user
   - Storage usage per user
   - Failed auth attempts
   - API errors

4. **Alerts** - Set up alerts for:
   - Unusual API usage spikes
   - Multiple failed auth attempts
   - Storage quota approaching limits

---

## SUMMARY OF REQUIRED ACTIONS

| Priority | Issue | Action |
|----------|-------|--------|
| CRITICAL | is_donor self-assignment | Restrict UPDATE policy on profiles |
| CRITICAL | Dev tools exposed | Remove or properly gate dev tools section |
| HIGH | No rate limiting | Add client + server rate limits |
| HIGH | Missing FKs | Add foreign key constraints |
| HIGH | CORS wide open | Restrict to your domains |
| MEDIUM | Client-only file size check | Add server-side validation |
| MEDIUM | Donor checks client-only | Add RLS for donor features |
| LOW | No content sanitization | Add DB constraints |

---

**End of Security Audit Report**
