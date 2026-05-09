# Landing/App Synchronization Game Plan

## Purpose

Make Selah's public landing page and authenticated app feel like one coherent product: same promise, same vocabulary, same interaction flow, same light/dark behavior, and previews that are faithful to what users actually see after sign-in.

This is an audit and implementation roadmap, not a redesign handoff. Each item below should be treated as a source-of-truth checklist before future landing-page copy or visual changes ship.

## Current Product Truth

The authenticated product currently routes users through these primary surfaces:

1. `/home` — a daily scripture home screen with a begin-prayer tile, recurring prayer threads, and an answered-prayer quote when available.
2. `/pray` — guided prayer sessions with selectable formats, phase prompts, scripture, free-writing, optional generated prayer, and optional meditation follow-up.
3. `/requests` — active prayer requests.
4. `/journal` — personal journal entries.
5. `/answered` — answered requests / Stones of Remembrance.
6. `/history` — prayer-session history with search/filtering and regenerated/copied generated prayers.
7. `/settings` — theme, palette, audio, timer, prayer-format, donor, and developer-test controls.

## What Is Already Aligned

- The landing page correctly positions Selah as a prayer, journaling, and remembrance companion.
- The top-level feature set maps well to real app destinations: guided prayer, requests, Stones, daily scripture, journal, and history.
- The landing page uses the same broad spiritual vocabulary as the app: prayer frameworks, phases, Scripture, journaling, and remembrance.
- The landing page correctly advertises the three built-in prayer frameworks: Lord's Prayer, ACTS, and Daily Examen.
- The public route already redirects authenticated users to `/home`, so the funnel is structurally correct.

## Key Gaps To Fix

### 1. Theme contract mismatch

**Current state:** The app has global light and dark tokens, custom palette overrides, and app pages use `page-background`. The landing page uses a dedicated `.theme-twilight` scope that is explicitly documented as marketing-only.

**Risk:** The landing page looks incredible, but it can feel like a separate product. It also does not reflect user-selected palette behavior or the app's light/dark state.

**Decision:** Keep the landing page dramatic, but make its tokens derive from the same Selah semantic token family. The landing page should have a marketing presentation layer, not an unrelated theme system.

**Implementation plan:**

- Create a shared semantic token map for Selah surfaces: `sanctuary`, `parchment`, `lantern`, `cardSoft`, `hairline`, and `shadowSoft`.
- Keep `.theme-twilight` as a scoped marketing skin, but make the app's light/dark token values visibly related.
- Add an unauthenticated landing theme toggle only if it can mirror the real `ThemeToggle` behavior without creating a second settings model.
- Add a visual QA matrix with screenshots for:
  - landing light
  - landing dark/twilight
  - `/home` light
  - `/home` dark
  - `/pray` light
  - `/pray` dark
  - custom palette active

### 2. Product preview is a static parallel app

**Current state:** `ProductPreview` has internal tabs named Today, Pray, Requests, Answered, and Journal. The real app uses bottom navigation labels Home, Requests, Pray, Journal, and Stones, with Settings available from header actions.

**Risk:** Prospects see a polished mini-product that does not quite match the tabs and layout they receive after sign-in.

**Decision:** Replace the landing preview with a faithful mini journey that mirrors actual screens and labels.

**Implementation plan:**

- Rename preview tabs to match authenticated app navigation exactly: Home, Requests, Pray, Journal, Stones.
- Consider adding History as a secondary preview panel because landing lists Prayer History as a feature but the bottom nav does not expose it as a primary tab.
- Use the same icon choices as `BottomNav` unless a deliberate marketing variant is documented.
- Replace static copy with a reusable `demoContent` fixture that mirrors real app concepts:
  - Home: random Scripture, Begin Prayer card, recurring threads, optional Stone quote.
  - Pray: selected format, phase title, prompt, scripture card, ruled textarea.
  - Requests: request cards with title, cadence/recurring hint, and answer action.
  - Journal: journal entry card styled like the real journal surface.
  - Stones: answered prayer/testimony card styled like the real answered surface.
  - History: saved session card with generated prayer/personal prayer excerpts.

### 3. Framework names differ between landing and app

**Current state:** Landing says `ACTS`, while the built-in format is named `ACTS Prayer`. Landing says `The Lord's Prayer`, while the default format is `Lord's Prayer`.

**Risk:** Small wording mismatches make the product feel less polished and can complicate support/screenshots.

**Decision:** Use the real built-in format names everywhere unless the landing intentionally uses a shorter display alias pulled from the same source.

**Implementation plan:**

- Export a small metadata helper from built-in formats with `marketingName`, `appName`, `phaseCount`, and `description`.
- Render the landing framework cards from that helper instead of hand-maintained constants.
- Add a low-cost test that verifies landing framework labels and phase counts match the built-in formats.

### 4. Landing overpromises daily Scripture placement

**Current state:** Landing says users begin each session anchored in the Word. The home page begins with random Scripture, and prayer phases include scripture cards, but the exact user flow is more nuanced.

**Risk:** The claim is spiritually aligned but imprecise. If users expect a daily Scripture handoff directly into every session, they may notice the difference.

**Decision:** Tighten copy to match actual flow: home opens with Scripture; prayer phases include curated Scripture.

**Implementation plan:**

- Change feature copy from "Begin each session anchored in the Word" to "Open your home screen with Scripture, then pray through phase-specific verses."
- Ensure landing preview shows both the home Scripture hero and a prayer phase Scripture card.

### 5. Light/dark and custom palette story is missing from landing

**Current state:** Settings exposes theme/palette controls inside the app, but the landing does not hint at this customization and does not visually match the customization system.

**Risk:** Custom palettes can make the app feel different from the landing immediately after onboarding.

**Decision:** Treat theme customization as an app capability, but ensure the default landing and default app modes are visually related before promoting it heavily.

**Implementation plan:**

- First align defaults.
- Then add a small landing section or preview chip: "Set the atmosphere: light, dark, or your own palette" only if the copy stays non-distracting.
- Use screenshots or component snapshots to verify palette overrides do not break landing-derived tokens.

### 6. Completion flow is underrepresented

**Current state:** The landing says users mark answered prayers and revisit. The real prayer flow also includes generated prayer, personal prayer, meditation follow-up, and saved sessions.

**Risk:** The landing under-explains the full loop from prayer to history to remembrance.

**Decision:** Make the landing narrative exactly match the app's loop:

1. Home opens with Scripture and an invitation to begin.
2. User chooses a prayer format.
3. User moves through prompts and Scripture.
4. User writes freely and can generate/copy/save a prayer.
5. User can continue into meditation when available.
6. Saved prayers appear in History.
7. Requests can later become Stones of Remembrance.

**Implementation plan:**

- Update the "How Selah works" section to use this loop instead of only three broad movements, or keep three movements but map them to the real app:
  - Begin from Home
  - Pray through phases
  - Save, revisit, and remember
- Add one visual preview state for the completion screen so generated/personal prayer behavior is not hidden.

## Proposed Source-of-Truth Architecture

### Shared content fixtures

Create `src/lib/marketingContent.ts` with:

- `landingFeatures`
- `landingSteps`
- `landingPreviewTabs`
- `landingFrameworkCards`
- `demoPrayerRequests`
- `demoJournalEntries`
- `demoAnsweredPrayers`
- `demoHistorySessions`

Rules:

- Framework data must be derived from `builtInFormats`.
- Route labels must be derived from a shared navigation config used by both landing previews and `BottomNav` where practical.
- Demo content should use real domain shape names where possible, even if it remains static.

### Shared navigation config

Create `src/lib/navigation.ts` with route metadata:

```ts
export const primaryAppNav = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/requests', label: 'Requests', icon: ClipboardList },
  { to: '/pray', label: 'Pray', icon: Sparkles },
  { to: '/journal', label: 'Journal', icon: BookOpen },
  { to: '/answered', label: 'Stones', icon: Star },
] as const;
```

Then use the same metadata in `BottomNav` and the landing preview. If icon imports make this awkward, keep icons in the component layer but share route/label IDs.

### Shared visual primitives

Create or consolidate these classes/components:

- `SelahShell` for page background + grain/glow.
- `SelahCard` for card radius, border, shadow, and background.
- `SelahSectionHeading` for eyebrow/title/body spacing.
- `DemoDeviceFrame` for landing mockups only.

This keeps the landing beautiful while pulling it closer to the same primitives used by the authenticated app.

## Implementation Phases

### Phase 1 — Audit lock and terminology sync

- Add this document to the repo.
- Update landing framework labels and feature copy to match actual app terminology.
- Replace `Answered` with `Stones` in preview tab labels.
- Add comments near landing constants if any remain static.

**Acceptance:** No user-facing landing copy contradicts current app routes or built-in format names.

### Phase 2 — Shared content and nav source of truth

- Introduce shared nav metadata.
- Refactor `BottomNav` to render from metadata.
- Refactor `ProductPreview` tabs from the same metadata.
- Move landing feature/framework/step content into `marketingContent.ts`.

**Acceptance:** Changing a primary nav label in one place updates both the app nav and landing preview.

### Phase 3 — Faithful preview components

- Replace ProductPreview's parallel mock UI with mini versions of real app surfaces.
- Pull style cues from `ScriptureHero`, `BeginPrayerTile`, `RequestCard`, journal cards, and answered prayer cards.
- Add a completion/history preview state to represent the saved-session loop.

**Acceptance:** A new user can sign in and recognize the real app from the landing preview immediately.

### Phase 4 — Theme and palette convergence

- Normalize landing/app semantic tokens.
- Add visual regression screenshots or at minimum Playwright screenshot scripts for the QA matrix.
- Decide whether landing should expose a theme toggle.
- Ensure custom palettes do not create unreadable landing-app transitions.

**Acceptance:** Landing and authenticated surfaces look like the same brand in default light and dark modes.

### Phase 5 — End-to-end narrative QA

- Run the full onboarding path:
  1. `/`
  2. `/auth`
  3. `/home`
  4. `/pray`
  5. save session
  6. `/history`
  7. `/requests`
  8. mark answered
  9. `/answered`
  10. `/settings`
- Compare each step against landing claims and preview states.
- Create a small "landing claims checklist" in PR templates or release notes.

**Acceptance:** Every landing claim maps to a reachable app screen and a visible UI element.

## QA Checklist For Every Landing Change

- [ ] Do all nav labels match authenticated app labels?
- [ ] Do all framework names and phase counts come from `builtInFormats`?
- [ ] Does every feature card map to a real route or component?
- [ ] Does the preview show the same sequence users actually experience?
- [ ] Does copy avoid promising behavior gated by donor status unless labeled as such?
- [ ] Does the landing still look cohesive next to `/home`, `/pray`, and `/settings` in light and dark mode?
- [ ] Does custom palette mode remain readable and visually compatible?
- [ ] Are screenshots updated for landing + app after visual changes?

## Recommended Immediate Next PR

The safest first implementation PR should do only these changes:

1. Add shared `navigation.ts` route metadata.
2. Refactor `BottomNav` and `ProductPreview` labels from that metadata.
3. Derive landing framework cards from `builtInFormats`.
4. Tighten the Daily Scripture copy.
5. Add screenshot QA notes to the PR description.

That PR is small enough to review, but it removes the most visible sources of landing/app drift.
