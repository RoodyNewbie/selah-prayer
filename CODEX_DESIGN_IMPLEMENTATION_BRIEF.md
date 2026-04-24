# Codex Design Implementation Brief

## Scope and Non-Negotiables
This brief covers a **UI/UX redesign only** across Home, prayer flow, and supporting pages.

### Must Preserve (No Functional Regression)
- Supabase hooks, queries, and mutation contracts.
- Auth/session behavior.
- RLS/security assumptions.
- Prayer session save flow.
- AI generation flow (Edge Function invocation and limits behavior).
- Stripe/donor behaviors and gated experience.
- Existing route structure.
- Existing prayer phase IDs and phase ordering semantics.

### Explicitly Out of Scope
- Database schema changes.
- API contract changes.
- Edge Function changes.
- Security model changes.

---

## Current UI Audit (Code-Verified)

### Home (`src/pages/Index.tsx`)
- Strong foundation: scripture, daily testimony, entry point to prayer, quick-add request, and bottom navigation are already present.
- Current hierarchy still feels card-centric and dashboard-like due to stacked cards and equal visual weighting.
- Opportunity: elevate scripture to hero anchor and reduce heavy container framing.

### Bottom Navigation (`src/components/navigation/BottomNav.tsx`)
- Current nav uses equal-weight tabs for Home/Requests/Journal/Stones.
- Opportunity: shift to center-elevated prayer action while preserving route map and existing destinations.

### Pray (`src/pages/Pray.tsx`)
- Core architecture is mature and must remain untouched (session create, topic save, AI generation, donor limits, personal prayer save, meditation handoff).
- Opportunity: visual phase immersion, quieter surface hierarchy, more manuscript-like writing treatment, and stronger contemplative pacing.

### PhaseCard (`src/components/prayer/PhaseCard.tsx`)
- Already has transition choreography, phase color cues, scripture, memory card integration, and reduced-motion handling.
- Opportunity: replace boxed prompt/input feel with softer section/rule composition and journal-grade textarea styling.

### Requests (`src/pages/Requests.tsx`)
- Functional list management is clear (filtering, add, mark answered, delete).
- Opportunity: reduce utility-first list appearance and move toward devotional list styling with calmer hierarchy.

### Journal (`src/pages/Journal.tsx`)
- Feature-complete and readable; currently card-heavy with action menus per item.
- Opportunity: reshape entries as notebook/timeline blocks with softer visual chrome while retaining all actions.

### Answered (`src/pages/Answered.tsx`)
- Rich functionality (card/timeline, favorites, details, delete) already supports “stones” concept.
- Opportunity: memorial/testimony presentation can be pushed further via pull-quote emphasis and reverent metadata styling.

### History (`src/pages/History.tsx`)
- Powerful search/filter/detail functionality; visually reads as standard app list.
- Opportunity: align with new design language while preserving filtering/search and prayer regeneration workflows.

---

## Phased Implementation Plan

## Phase 1 — Foundation Layer (Tokens + Shared Primitives)
**Goal**
Create the visual system primitives needed to implement redesign safely and consistently.

**Files / Components to Modify**
- `src/index.css` (theme tokens, dark-mode counterparts, typography rhythm, elevation/shadow tuning).
- `src/components/navigation/BottomNav.tsx` (+ maybe `BottomNavItem.tsx`) for center-prayer nav shell.
- Shared UI primitives likely under `src/components/ui/*` only where style-only changes are needed (no behavior changes).
- New shared presentational components (e.g., scripture hero, section rule, pull-quote) in `src/components/*`.

**Changes to Make**
- Introduce refined spacing/type scale variables and color tokens for contemplative palette.
- Add reusable primitives:
  - ScriptureHero
  - SectionRule
  - PullQuote
  - JournalTextarea style variant
- Build center-emphasis prayer nav treatment while maintaining existing routes and affordances.

**Must NOT Change**
- Route paths or navigation destinations.
- Any hook/service logic.
- Any API or data-layer contracts.

**Risk Level**
- **Medium** (global CSS and shared primitives can create broad visual regressions if not sequenced carefully).

---

## Phase 2 — Home Experience Redesign
**Goal**
Make Home feel like devotional entry, with scripture as emotional anchor and prayer as central CTA.

**Files / Components to Modify**
- `src/pages/Index.tsx`
- Reused shared components from Phase 1
- Minor style alignment in `src/components/subscription/UpgradePrompt` only if needed for visual consistency

**Changes to Make**
- Recompose hierarchy:
  1. concise greeting/context
  2. scripture hero (primary visual focus)
  3. primary begin-prayer invitation
  4. testimony/remembrance preview
  5. secondary utility actions
- Replace heavy card stacking with sectional rhythm, rules, and soft surfaces.
- Maintain existing actions: begin prayer, add request, history/settings/logout, testimony navigation, upgrade prompt.

**Must NOT Change**
- Verse selection logic.
- Testimony query/randomization logic.
- Existing click-through behavior and destinations.

**Risk Level**
- **Low** (mostly compositional and style-level updates in one page).

---

## Phase 3 — Prayer Flow Redesign (Immersive Phase Rooms)
**Goal**
Create a quieter, phase-immersive prayer journey while keeping all session/gen/save logic intact.

**Files / Components to Modify**
- `src/pages/Pray.tsx`
- `src/components/prayer/PhaseCard.tsx`
- Supporting prayer display components (e.g., `PhaseProgress`, `PhaseScriptureCard`, `PrayerMemoryCard`) for style-only alignment

**Changes to Make**
- Introduce subtle per-phase atmospheric backgrounds.
- Shift prompt + scripture + writing area composition toward journal manuscript style.
- Apply border-light/borderless textarea treatment with stronger typographic comfort.
- Keep transition cadence gentle and reduced-motion compliant.
- Harmonize completion screen with memorial/devotional tone.

**Must NOT Change**
- `useCreateSession`, `useUpdateSessionPrayer`, `useSaveSessionTopics` flow.
- Edge Function invocation (`generate-prayer`) behavior.
- Daily generation/rate-limit logic.
- Donor-only gating and meditation routing.
- Phase IDs, skip/next semantics, and completion semantics.

**Risk Level**
- **High** (this is the densest feature area with many state transitions and side effects).

---

## Phase 4 — Supporting Pages Harmonization (Requests, Journal, Answered, History)
**Goal**
Bring list/detail surfaces into the new design language without reducing feature depth.

**Files / Components to Modify**
- `src/pages/Requests.tsx`
- `src/pages/Journal.tsx`
- `src/pages/Answered.tsx`
- `src/pages/History.tsx`
- Related presentational cards/components where style-level alignment is required

**Changes to Make**
- Requests: gentler list framing, quieter filter presentation, stronger devotional reading rhythm.
- Journal: notebook-like entry blocks and improved long-form readability.
- Answered: testimony-first memorial styling (pull-quote and remembrance tone), preserving favorites/timeline/actions.
- History: maintain search/filter power while reducing utilitarian dashboard appearance.

**Must NOT Change**
- Mutation/query behavior on request/journal/session actions.
- Favorite/delete/update operations.
- Search/filter logic and date-range behavior.
- Any donor-related access patterns.

**Risk Level**
- **Medium** (broad surface area, but mostly style/composition refactors).

---

## Phase 5 — Motion, Micro-Polish, and Accessibility Finalization
**Goal**
Add subtle polish that supports contemplative feel without distraction.

**Files / Components to Modify**
- Transition and animation classes in shared CSS.
- Page-level motion wrappers where already used.
- Any focus/interaction states needing accessibility tuning.

**Changes to Make**
- Introduce restrained micro-animations (fade, slow lift, soft background drift).
- Normalize hover/focus/active states across redesigned components.
- Confirm reduced-motion path is fully respected.
- Tune contrast and readability in both light and dark modes.

**Must NOT Change**
- Functional component behavior.
- Timing logic that controls prayer-phase state transitions (only visual timing envelopes).

**Risk Level**
- **Low** (polish pass, provided no state logic is altered).

---

## Delivery and Validation Checklist (Per Phase)
- Visual changes verified against contemplative direction.
- No changed TypeScript interfaces for data access hooks unless purely UI-local typing.
- Manual regression passes on:
  - session creation and completion
  - generated prayer
  - add/edit/delete requests/journal items
  - answered favorites/detail/delete
  - history search/filter/regenerate
- Light and dark mode checked side-by-side.
- Reduced-motion behavior verified.

---

## Suggested Execution Order
1. Token/primitives + nav shell.
2. Home redesign.
3. Prayer flow redesign.
4. Supporting pages harmonization.
5. Motion/accessibility polish and final QA.

This order minimizes regressions by establishing shared visual language before deep page-level work.
