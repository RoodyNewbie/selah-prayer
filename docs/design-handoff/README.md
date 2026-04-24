# Selah Redesign — Developer Handoff

## What's in this folder

| File | Purpose |
|------|---------|
| `IMPLEMENTATION_SPEC.md` | **Start here.** Full per-screen layout, spacing, typography, color tokens, component specs, interaction patterns, and a list of every file to touch in the codebase. |
| `Selah Redesign.html` | Interactive prototype — open in a browser to see the full design, all screens, and the prayer flow. |
| `selah-screens.jsx` | Prototype source for Home, Requests, Journal, and Stones screens. |
| `selah-pray.jsx` | Prototype source for Format Select, Phase flow, and Completion screen. |

## How to use these files

**The HTML prototype is a design reference, not production code.** Your job is to recreate these designs inside the existing Selah codebase (`src/`) using its established React + TypeScript + Tailwind + shadcn/ui patterns, hooks, and Supabase queries.

Open `Selah Redesign.html` in a browser alongside `IMPLEMENTATION_SPEC.md` and work through each screen section by section.

## Quick orientation

The redesign touches **UI only** — no backend changes, no hook changes, no Supabase schema changes (except optionally adding a `days_waited` computed value on `prayer_requests`). All Stripe/donor gating, auth, and edge function logic is untouched.

The **one new component** to create is `src/components/prayer/PhaseSigil.tsx` — the spec includes the full source.

## Where to start

1. Update CSS tokens in `src/index.css` (Section 2 of the spec)
2. Create `PhaseSigil.tsx` (Section 8)
3. Redesign `BottomNav.tsx` (Section 6) — this affects every screen immediately
4. Work through screens in order: Home → Requests → Journal → Answered → Pray flow

## Fidelity

This is a **high-fidelity** design. Recreate colors, spacing, typography, and interactions as specified. The spec includes exact HSL values, pixel measurements, easing curves, and transition durations.
