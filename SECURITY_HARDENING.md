# Selah Security Hardening Checklist

Selah stores private prayer, journal, subscription, and audio data. This checklist tracks the work required to move the app from promising prototype to production-ready private journaling product.

## Priority 0: Verify Data Boundaries

- [ ] Audit Row Level Security on every user-owned table.
- [ ] Confirm users can only read their own rows.
- [ ] Confirm users can only insert rows with their own `user_id`.
- [ ] Confirm users can only update and delete their own rows.
- [ ] Confirm users cannot directly modify Stripe subscription fields in `profiles`.
- [ ] Confirm donor-only records cannot be created or abused by non-donor users.
- [ ] Audit Supabase Storage policies for `custom-audio`.
- [ ] Enforce custom audio paths that begin with the authenticated user's ID.

User-owned tables currently include:

- `profiles`
- `prayer_requests`
- `prayer_sessions`
- `prayer_topics`
- `journal_entries`
- `prayer_formats`
- `color_palettes`
- `custom_audio_tracks`
- `prayer_generations`

## Priority 1: Defense-in-Depth Client Mutations

Even with correct RLS, client mutations should avoid broad record-id-only updates.

- [ ] Add `.eq('user_id', user.id)` to user-owned updates/deletes in `src/lib/db.ts`.
- [ ] Add user scoping to prayer format mutations.
- [ ] Add user scoping to color palette mutations.
- [ ] Add user scoping to custom audio metadata deletion.
- [ ] Add user scoping to prayer topic updates.
- [ ] Confirm all mutation hooks fail safely when no authenticated user exists.

## Priority 2: Edge Function Hardening

- [ ] Revisit `supabase/config.toml` and enable JWT verification for user-called functions where possible.
- [ ] Keep `stripe-webhook` JWT verification disabled because Stripe signs requests instead.
- [ ] Keep scheduled cleanup protected by service-role token or `CLEANUP_SECRET`.
- [ ] Make CORS fail closed for untrusted browser origins.
- [ ] Move hardcoded Stripe price IDs to server-side environment configuration.
- [ ] Ensure webhook subscription updates are idempotent and safe against out-of-order Stripe events.
- [ ] Avoid logging sensitive user content or secrets.

## Priority 3: Input Validation

Create shared Zod schemas for:

- [ ] Prayer requests.
- [ ] Prayer sessions and phase content.
- [ ] Prayer topics.
- [ ] Journal entries.
- [ ] Prayer formats.
- [ ] Color palettes.
- [ ] Custom audio metadata.

Validation should include:

- [ ] Required field checks.
- [ ] Maximum length checks.
- [ ] Allowed enum values.
- [ ] Maximum phase/prompt counts.
- [ ] Safe color format checks.
- [ ] File metadata checks that mirror storage policy limits.

## Priority 4: TypeScript and Lint Discipline

Do this gradually so the app does not turn into a bug-confetti cannon.

- [ ] Enable `noUnusedLocals`.
- [ ] Enable `noUnusedParameters`.
- [ ] Re-enable `@typescript-eslint/no-unused-vars`.
- [ ] Enable `strictNullChecks`.
- [ ] Enable `noImplicitAny`.
- [ ] Consider full `strict` mode after the first cleanup pass.
- [ ] Replace broad `any` in Edge Functions and app code with typed helpers.

## Priority 5: Product Reliability

- [ ] Confirm all in-app home navigation returns authenticated users to `/home`.
- [ ] Add empty/error/loading states consistently.
- [ ] Add smoke tests for auth, prayer session creation, journal entry creation, and checkout launch.
- [ ] Add monitoring for Edge Function failures.
- [ ] Add analytics only if privacy-preserving and clearly disclosed.
- [ ] Review privacy policy and terms against actual data handling.

## Priority 6: Release Process

- [ ] Require CI to pass before merging to `main`.
- [ ] Run `npm run check` before releases.
- [ ] Rotate any accidentally committed private credentials immediately.
- [ ] Keep public Vite env vars separate from server-side secrets.
- [ ] Document Supabase migrations and deployment steps.
