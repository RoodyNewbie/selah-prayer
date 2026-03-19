# CLAUDE.md — Selah Prayer App

## What This Is

Selah is a guided prayer journal app. React + TypeScript frontend (Vite, Tailwind, shadcn/ui), Supabase backend (Postgres, Auth, Storage, Edge Functions), Stripe subscriptions. Built on Lovable.dev, now maintained via Claude Code.

Production URL: `https://selah-prayer.lovable.app`
Supabase project: `tuvsuimucjyunwnxpeap`

---

## Critical Security Rules — Never Violate These

1. **NEVER put `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, or `STRIPE_WEBHOOK_SECRET` in client-side code.** Only `VITE_`-prefixed keys are allowed in the frontend. Service keys live exclusively in Supabase Edge Function environment variables.

2. **NEVER allow client-side code to modify `is_donor`, `subscription_status`, `stripe_customer_id`, or any subscription field on `profiles`.** These are server-side only (Edge Functions + database triggers). The UPDATE policy on `profiles` exists but the actual safe update path is the `update_user_profile()` SECURITY DEFINER function, which explicitly excludes donor/subscription fields.

3. **NEVER disable or weaken RLS policies.** Every table has RLS enabled with `auth.uid() = user_id` isolation. If you add a new table, it MUST have RLS enabled with user-scoped policies before any data touches it.

4. **NEVER trust client-side donor status for access control on the server.** Edge functions must independently verify `is_donor` from the `profiles` table using the service role client. The client-side `useDonor()` hook is for UI gating only.

5. **NEVER return internal error messages to the client from Edge Functions.** Use generic user-facing messages. Log details server-side with `console.error`.

6. **All Supabase Edge Functions that accept user requests MUST verify the Authorization header and call `supabase.auth.getUser()` before doing anything.** The `generate-prayer`, `create-checkout`, and `manage-subscription` functions already do this correctly — maintain this pattern.

7. **Stripe webhooks MUST verify the signature** using `stripe.webhooks.constructEventAsync()` with `createSubtleCryptoProvider()` (Deno compatibility). Never process unverified webhook payloads.

---

## Stripe Configuration (Live)

The app is in **live mode**. All keys, products, and prices below are production values.

- **Publishable key** (`pk_live_...`): Client-side only. Referenced in `src/lib/stripe.ts`.
- **Secret key** (`sk_live_...`): Stored in Supabase Edge Function secrets as `STRIPE_SECRET_KEY`. Managed by Lovable — update via Lovable's "Add API Key" form, never directly in Supabase.
- **Webhook signing secret** (`whsec_...`): Stored in Supabase Edge Function secrets as `STRIPE_WEBHOOK_SECRET`.
- **Webhook endpoint**: `https://tuvsuimucjyunwnxpeap.supabase.co/functions/v1/stripe-webhook`
- **Subscribed events**: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`

### Live Product & Prices

| Item          | ID                             | Details               |
| ------------- | ------------------------------ | --------------------- |
| Product       | prod_UATslZlwil4gVx            | Selah Supporter       |
| Monthly Price | price_1TC8v2BAwfR8W0DxStp8uNy8 | $5.00/month recurring |
| Yearly Price  | price_1TC8v1BAwfR8W0Dxskg5vUDZ | $40.00/year recurring |

### Key Locations for Stripe Code

| What                                 | Where                                             |
| ------------------------------------ | ------------------------------------------------- |
| Publishable key + grace period logic | `src/lib/stripe.ts`                               |
| Checkout session creation            | `supabase/functions/create-checkout/index.ts`     |
| Subscription management portal       | `supabase/functions/manage-subscription/index.ts` |
| Webhook handler                      | `supabase/functions/stripe-webhook/index.ts`      |
| Donor context (UI gating only)       | `src/contexts/DonorContext.tsx`                   |
| Donor gate component                 | `src/components/subscription/DonorGate.tsx`       |

---

## Architecture Overview

### Frontend Structure

```
src/
├── pages/           # Route-level components (Landing, Auth, Pray, Index, etc.)
├── components/
│   ├── ui/          # shadcn/ui primitives — do NOT modify these directly
│   ├── prayer/      # Prayer session components (PhaseCard, PhaseProgress, etc.)
│   ├── journal/     # Dream/word journal components
│   ├── navigation/  # BottomNav, BottomNavItem
│   ├── settings/    # Settings sub-components (PaletteEditor, AudioUploader, etc.)
│   ├── subscription/ # Donor/upgrade UI components
│   └── landing/     # Landing page components
├── contexts/        # React contexts (Audio, ColorPalette, DonorContext, MeditationTimer)
├── hooks/           # Custom hooks (useAuth, usePrayerRequests, useDonor, etc.)
├── lib/             # Utilities, data models, Supabase client, Stripe config
└── integrations/    # Auto-generated Supabase types — do NOT hand-edit types.ts
```

### Routing

All authenticated routes go through `<ProtectedRoute>` which checks `useAuth()`. Unauthenticated users are redirected to `/auth`. Routes:

- Public: `/`, `/auth`, `/privacy`, `/terms`, `/contact`, `/donate`
- Protected: `/home`, `/pray`, `/pray/meditate`, `/requests`, `/journal`, `/answered`, `/history`, `/settings`

### State Management

- **Server state**: TanStack React Query with 5-minute stale time. All data flows through `src/lib/db.ts` which wraps Supabase calls.
- **Auth state**: Supabase `onAuthStateChange` listener in `useAuth` context. Session persisted in localStorage by Supabase client.
- **Audio state**: Global `AudioContext` provider — persists track/volume/enabled in localStorage, manages HTML5 Audio element lifecycle.
- **Donor state**: `DonorContext` fetches from `profiles` table on auth change. Used throughout app for feature gating.
- **Local-only**: Dark mode preference (localStorage), meditation timer (in-memory during session).

---

## Database Schema — Key Tables

### profiles

- `user_id` (FK → auth.users, UNIQUE) — the primary identifier
- `is_donor` (boolean) — **SERVER-SIDE ONLY modification**. Set by Stripe webhook, admin trigger, or Edge Function.
- `subscription_status` — one of: `active`, `trialing`, `past_due`, `grace_period`, `canceled`, `none`
- `stripe_customer_id`, `subscription_id`, `subscription_price_id`, `subscription_current_period_end`, `subscription_cancel_at_period_end`
- `meditation_timer_enabled`, `meditation_timer_duration`
- Admin bypass: `check_admin_donor_status()` trigger auto-sets `is_donor=true` for hardcoded admin emails on profile creation. Admin emails are defined **only** in the database trigger (server-side) — never in client code.

### prayer_sessions

- `phases` (JSONB) — keys are phase IDs (`praise`, `will`, `needs`, `forgiveness`, `protection`, `worship`), values are user text
- `generated_prayer` (text) — AI-generated prayer from Edge Function
- `personal_prayer` (text) — user's freeform prayer
- `format_id` (FK → prayer_formats, nullable) — which prayer format was used
- `meditation_seconds_used` (integer)

### prayer_requests

- Standard CRUD with `is_answered`, `answer_type`, `testimony`, `gratitude_note`
- `is_favorite` for Stones of Remembrance starring
- `tag` — one of: `family`, `work`, `health`, `finances`, `spiritual`, `others`

### prayer_topics

- Session memory system. Phases: `needs`, `forgiveness`, `protection` only.
- `status`: `active`, `answered`, `released`
- Deduplication: `useSaveSessionTopics` checks first 50 chars similarity before creating new topics

### prayer_generations

- Rate limiting table. One row per AI generation request.
- Free users: 5/day. Donors: 10/day.
- `cleanup-old-records` Edge Function deletes entries older than 7 days.

### color_palettes

- Max 5 per user (enforced client-side in `ColorPaletteContext`)
- Colors stored as hex strings, validated with regex before DOM application
- Applied via CSS custom properties (`--custom-primary`, etc.)

### custom_audio_tracks

- Max 3 per user (enforced client-side + storage bucket policies)
- Files stored in `custom-audio` Supabase Storage bucket
- Storage policies enforce `user_id` folder structure: `{user_id}/{unique_id}-{filename}`

### prayer_formats

- `is_system` formats are read-only. Built-in formats (Lord's Prayer, ACTS, Examen) are now defined in code (`src/lib/builtInFormats.ts`), not in the database.
- User-created formats have `is_system = false`. RLS prevents users from creating system formats.

---

## Edge Functions

### generate-prayer

- Authenticates user, checks `is_donor` from profiles, enforces daily generation limits
- Input validation: only accepts known phase keys, max 1000 chars per phase, 5000 total
- Uses Lovable AI gateway (`ai.gateway.lovable.dev`) with `google/gemini-2.5-flash`
- Records each generation in `prayer_generations` table
- Returns `remaining` and `limit` counts to client for UI display

### create-checkout

- Creates Stripe Checkout Session for subscription
- Finds or creates Stripe customer, links to Supabase profile
- Return URLs use the same origin that initiated the request (prevents cross-domain auth loss)

### manage-subscription

- Creates Stripe Billing Portal session for subscription management
- Requires existing `stripe_customer_id` on profile

### stripe-webhook

- Handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`
- On deletion: sets `grace_period` status (3-day grace period, calculated client-side in `src/lib/stripe.ts`)
- Uses `constructEventAsync` with `SubtleCryptoProvider` for Deno compatibility

### cleanup-old-records

- Server-to-server only (requires service role key or CLEANUP_SECRET)
- Deletes: prayer_generations older than 7 days, prayer_sessions older than 30 days for free users, stale prayer_topics for free users

---

## Patterns You Must Follow

### Adding a New Database Table

1. Create migration in `supabase/migrations/` with descriptive name
2. **Enable RLS**: `ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;`
3. Add all four CRUD policies with `auth.uid() = user_id`
4. Add `updated_at` trigger using existing `update_updated_at_column()` function
5. Add types to `src/integrations/supabase/types.ts` (or let Supabase regenerate)
6. Create hook in `src/hooks/` following existing pattern (useQuery + useMutation)
7. Create data access functions in `src/lib/db.ts` with proper error handling using `DatabaseError` class

### Adding a New Premium Feature

1. Gate the UI using `useDonor()` from `DonorContext` — show lock icon + upgrade prompt for free users
2. Use `<DonorGate>` component for consistent upgrade prompts
3. If the feature involves server-side logic, verify `is_donor` in the Edge Function independently
4. Never rely solely on client-side checks

### Adding a New Edge Function

1. Create in `supabase/functions/{name}/index.ts`
2. Add to `supabase/config.toml` with `verify_jwt = false` (we handle auth manually)
3. Include CORS headers using the `ALLOWED_ORIGINS` pattern from existing functions
4. Authenticate: extract Bearer token → `supabase.auth.getUser()` → reject if no user
5. Use `supabaseAdmin` (service role) for privileged operations
6. Never return internal error details to client

### Error Handling Pattern

```typescript
// In hooks/db layer — throw DatabaseError with user-friendly message
throw new DatabaseError(
  "Failed to save your prayer request. Please try again.",
  originalError,
);

// In components — catch and display via toast
try {
  await mutation.mutateAsync(data);
} catch (err) {
  toast.error(err instanceof Error ? err.message : "Something went wrong");
}
```

### Component Naming & Structure

- Pages: `src/pages/PageName.tsx` — default export
- Feature components: `src/components/{feature}/ComponentName.tsx` — named export
- UI primitives: `src/components/ui/` — these are shadcn/ui, don't modify directly
- All components use `cn()` utility from `src/lib/utils.ts` for conditional classes

---

## Scalability Constraints & Gotchas

### Query Limits

All list queries use `.limit(500)`. As user data grows, implement pagination (cursor-based preferred) instead of increasing limits. The `prayer_sessions` table will be the first to hit this — users who pray daily will reach 500 sessions in ~1.5 years.

### Free User Data Cleanup

The `cleanup-old-records` function deletes prayer_sessions older than 30 days for free users. This is both a feature gate AND a cost control measure. If you change the retention period, update both the Edge Function AND `src/lib/db.ts` (`getSessions` method) AND the UI messaging in `History.tsx`.

### Rate Limiting

Prayer generation uses a database-backed rate limit (prayer_generations table). The Edge Function checks count in last 24 hours. This is per-user, not per-IP. If you add other AI features, follow the same pattern — database-backed, server-verified, with client-side remaining count for UX.

### Supabase Anon Key Exposure

The `VITE_SUPABASE_PUBLISHABLE_KEY` is the anon key — it's designed to be public. All security comes from RLS policies. If RLS has a gap, the anon key gives attackers direct database access. This is why RLS verification is non-negotiable.

### Audio System

The global `AudioContext` manages a single HTML5 Audio element. Custom audio tracks use signed URLs with 1-hour expiry (`getSignedAudioUrl`). If a user's session lasts longer than an hour with a custom track, the URL will expire and audio will stop. Consider refreshing the signed URL on a timer if this becomes a reported issue.

### Prayer Topics Deduplication

`useSaveSessionTopics` compares first 50 characters (case-insensitive, after stripping "Continuing to lift up:" prefix) to detect duplicates. This is intentionally simple. False negatives (creating duplicates) are acceptable — false positives (losing unique prayers) are not. Don't make the similarity check more aggressive.

### CSP Policy

The Content-Security-Policy in `index.html` must be updated if you add new external resources. Current `connect-src` allows `*.supabase.co`, `ai.gateway.lovable.dev`, and `api.stripe.com`. Adding a new API endpoint requires updating this header or requests will be silently blocked.

### TypeScript Strictness

Currently `strict: false`. Don't enable `strict: true` all at once — it will produce hundreds of errors. Instead, enable individual checks incrementally: start with `strictNullChecks`, then `noImplicitAny`.

---

## Things That Will Break If You're Not Careful

- **Changing phase IDs** (`praise`, `will`, `needs`, `forgiveness`, `protection`, `worship`) — these are stored in JSONB in prayer_sessions and referenced throughout the app. Changing them breaks historical data.
- **Modifying the `profiles` table UPDATE policy** — the current setup intentionally restricts what users can modify. The `update_user_profile()` function is the safe path.
- **Removing the `check_admin_donor_status` trigger** — admin accounts lose permanent donor status.
- **Changing the Stripe webhook URL** — must be reconfigured in Stripe Dashboard. The function name maps to the URL.
- **Adding `unsafe-eval` to CSP** — breaks security for no good reason. If a library requires it, find an alternative.
- **Deploying Edge Functions without testing webhook signature verification** — use Stripe CLI for local testing.

---

## File Locations Quick Reference

| What                                          | Where                                 |
| --------------------------------------------- | ------------------------------------- |
| Supabase client                               | `src/integrations/supabase/client.ts` |
| Database types                                | `src/integrations/supabase/types.ts`  |
| Data access layer                             | `src/lib/db.ts`                       |
| Auth hook/context                             | `src/hooks/useAuth.tsx`               |
| Donor status                                  | `src/contexts/DonorContext.tsx`       |
| Stripe config (publishable key, grace period) | `src/lib/stripe.ts`                   |
| Prayer phase definitions                      | `src/lib/prayerData.ts`               |
| Built-in prayer formats                       | `src/lib/builtInFormats.ts`           |
| Phase scriptures                              | `src/lib/phaseScriptures.ts`          |
| Topic dedup logic                             | `src/lib/topicUtils.ts`               |
| Edge Functions                                | `supabase/functions/`                 |
| DB migrations                                 | `supabase/migrations/`                |
| CSS variables/theme                           | `src/index.css`                       |
| Tailwind config                               | `tailwind.config.ts`                  |
| CSP header                                    | `index.html`                          |

---

## Deploy Checklist

Before any production deploy:

1. `grep -r "sk_test" src/` — zero results (no test secret keys)
2. `grep -r "pk_test" src/` — zero results (no test publishable keys)
3. `grep -r "price_test" src/` — zero results (no test price IDs)
4. `grep -r "service_role" src/` — zero results (no service keys in client code)
5. `grep -r "whsec_" src/` — zero results (no webhook secrets in client code)
6. Verify RLS is enforced on all tables in Supabase Dashboard
7. Confirm Edge Function env vars are set: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `LOVABLE_API_KEY`
8. `npm run build` — zero errors
9. Test auth flow: signup → login → protected route → signout
10. Test donor flow: checkout → webhook → donor status → premium features
11. Test Stripe webhook with Stripe CLI (`stripe listen --forward-to`)
12. Check CSP in `index.html` allows all required domains
13. Verify no `VITE_` prefixed env var contains a secret value
