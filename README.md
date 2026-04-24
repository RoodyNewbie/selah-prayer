# Selah Prayer

Selah is a personal prayer and reflection app built with React, TypeScript, Supabase, Stripe, and Supabase Edge Functions. It guides users through structured prayer, stores prayer sessions and requests, records journal entries, and offers donor-supported customization features such as meditation tools, custom colors, custom formats, and custom audio.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth, Postgres, Storage, and Edge Functions
- Stripe Checkout, Billing Portal, and Webhooks
- React Query

## Local Development

```sh
npm install
npm run dev
```

The production validation command is:

```sh
npm run check
```

This runs linting, TypeScript checking, and a production build.

## Environment Variables

Browser-exposed Vite variables are public by design. They must never contain service-role keys, Stripe secret keys, webhook secrets, AI provider secrets, or other private credentials.

Required public app variables:

```sh
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_STRIPE_PRICE_MONTHLY=
VITE_STRIPE_PRICE_YEARLY=
```

Required server-side Supabase Edge Function secrets:

```sh
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
LOVABLE_API_KEY=
CLEANUP_SECRET=
```

## Security Model

Selah stores private spiritual reflections, prayer requests, journal entries, and uploaded audio. Treat this data more like a private journal than generic app content.

Production must enforce all sensitive authorization server-side through Supabase Row Level Security, Supabase Storage policies, Stripe webhooks, and Edge Functions. Client-side checks are only for user experience.

Minimum expectations:

- Every user-owned table must enforce `auth.uid() = user_id` through RLS.
- Client mutations should still filter by both `id` and `user_id` for defense in depth.
- Stripe subscription fields should only be written by trusted server-side code.
- Donor-only features must be enforced by policies/functions, not only hidden in the UI.
- Custom audio storage paths should be scoped to the authenticated user's ID.
- Edge Functions that require a logged-in user should verify JWTs where possible.
- Public CORS allowlists should fail closed for untrusted origins.

See `SECURITY_HARDENING.md` for the active hardening checklist.

## Supabase Functions

Configured Edge Functions include:

- `generate-prayer` - authenticated AI prayer generation with input validation and daily limits.
- `create-checkout` - creates Stripe Checkout sessions for allowlisted prices.
- `manage-subscription` - opens Stripe Billing Portal for authenticated users.
- `stripe-webhook` - processes signed Stripe subscription events.
- `cleanup-old-records` - scheduled cleanup for old usage/session records.

## Production Validation

Before merging production changes:

```sh
npm run check
```

The repository also runs CI on pushes to `main` and pull requests.

## Deployment Notes

Deploy the frontend through the chosen hosting provider or Lovable publish flow. Deploy Supabase Edge Functions through the Supabase CLI or dashboard. Configure Stripe webhook delivery to the deployed `stripe-webhook` function and make sure all Edge Function secrets are set in Supabase, not committed to the repository.
