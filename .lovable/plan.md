
# Match the live app to the four screenshots

Visual/layout-only changes. No backend, hooks, queries, or data shapes are touched. All edits are in `src/pages/*` and `src/components/*` plus a few utility tweaks.

---

## 1. Home (`src/pages/Index.tsx` + home components)

**Header (`Index.tsx`)**
- Strip the BookHeart icon.
- Left side: just `Selah` wordmark in Playfair (`text-[22px]`, weight 500).
- Right side: a single round icon button — the **theme toggle (sun/moon)**. Move `GlobalAudioButton`, History, Settings, and Sign-out off the home header into the **Settings page** (or a small dropdown menu hidden behind the theme button group). Screenshots show only one round button on the right.

**Scripture hero**
- Already correct (centered Playfair italic, ornamental dividers, terracotta `— EXODUS 33:14`). Keep as-is.

**Begin Prayer tile (`BeginPrayerTile.tsx`)**
- Switch from centered to **left-aligned**:
  - Title `Begin Prayer` left, arrow icon pushed to the far right (`flex justify-between items-center`).
  - Sub-line `6 phases · ~10 minutes of guided reflection` left-aligned beneath title.
  - Sigil row left-aligned (`justify-start`) with first sigil tinted primary.
- Keep asymmetric rounded card and subtle border.

**Threads strip (`ThreadsStrip.tsx`)**
- Header row: left-align `ONGOING · 4 CARRIED`, push `View all` to the right (`flex justify-between`).
- Cards row: left-aligned (`justify-start`), equal-width tiles (`flex-1 min-w-0` for the first 3, no centering). Each card shows title + `N days` only.

**Stone of Remembrance (`StoneOfRemembranceQuote.tsx`)**
- Convert from centered column back to a **left-accented row**:
  - 3px terracotta vertical bar on the **left** (`w-[3px] self-stretch`).
  - Text block left-aligned: eyebrow `STONE OF REMEMBRANCE`, then bold `Found the apartment in time`, then meta `March 2025 · 84 days carried`.
- Title is sans-serif bold (DM Sans 500), not italic Playfair, per screenshot.

**Remove from Home**
- Remove the `Add a prayer request` quick-add button (not in screenshot).
- Remove the `UpgradePrompt` from the Home page (not in screenshot — keep it on Settings/Donate only).

---

## 2. Bottom Nav (`BottomNav.tsx`, `BottomNavItem.tsx`)

- Stones icon: swap `Milestone` → `Star` (lucide).
- Center Pray button: keep raised circle, but the screenshots show a **plain `+` cross**; current `PrayCross` already renders the cross — keep, ensure it sits slightly raised with terracotta fill `bg-primary`. Confirm size matches (~56px circle).
- Active label color: terracotta (already correct via `text-primary`).
- Remove the small dot indicator under active items (`BottomNavItem`'s `absolute -bottom-1` dot) — not present in screenshots.
- Reduce active icon background pill (`bg-primary/10`) — screenshots show flat icons, only the label/icon turn terracotta.

---

## 3. Requests page (`src/pages/Requests.tsx` + `RequestCard.tsx`)

**Header**
- Title text: `Requests` (not "Prayer Requests"), Playfair `text-[28px]`.
- Right side: only the **round terracotta `+` button** (`rounded-full bg-primary w-11 h-11`). Remove `GlobalAudioButton` from this header.
- Keep thin border-bottom under header.

**Filter pills**
- Order: `All`, `Health`, `Work`, `Family`, `Finances` (drop any extras like Spiritual/Others from the visible row, or let them scroll). Active pill: solid terracotta bg, dark text. Inactive: card-tinted bg, muted text. Pill is fully rounded (`rounded-full px-4 py-2`).

**Request rows (`RequestCard.tsx`)**
- New row layout:
  - Left: stacked date `Apr` over `18` in muted small text (`text-[11px] uppercase` + `text-[13px]` number), fixed ~32px column.
  - Middle: title in DM Sans 500 white, then a tag chip in its category color (Health=green, Work=blue, Family=brown/terracotta, Finances=olive/yellow), optionally followed by `· Recurring` in muted text.
  - Right: 30px circle check button (`rounded-full border border-border w-8 h-8`).
- Hairline divider between rows (`border-b border-border/40`), no card chrome.

---

## 4. Journal page (`src/pages/Journal.tsx`)

**Header**
- Title `Journal` in Playfair `text-[28px]` left, subtitle `Dreams and words to keep` muted body, beneath title.
- Round terracotta `+` button right.
- Remove `GlobalAudioButton` from this header.

**Remove**
- Filter pills (`All / Dreams / Words / Fulfilled`) — not in screenshot. (Filtering can move into a future menu; for visual match, hide.)
- Floating FAB (`fixed bottom-24 right-4`) — replaced by the header `+` button.

**Entry list**
- No `Card` wrappers. Render as **stacked rows with hairline dividers** (`divide-y divide-border/40`).
- Each row:
  - Top: eyebrow type label `DREAM` or `WORD` in terracotta uppercase 11px on the left; date right-aligned (e.g. `Apr 18`).
  - Body:
    - **Dream** entries: description in DM Sans 16px, regular weight, foreground color.
    - **Word** entries: title rendered as `"<title>"` in **Playfair italic** 20px (the description hidden, or shown small below).
- Drop the badges, scripture-reference chips, dropdown menus, and "Fulfilled" tinting from the visible card. Keep delete/fulfill actions accessible via long-press or a hidden menu (out of scope visually — can stay rendered but visually minimal). Simplest path: keep a small `MoreVertical` button on hover only, hidden by default.

---

## 5. Stones page (`src/pages/Answered.tsx`)

**Header**
- Title `Stones of Remembrance` in Playfair `text-[28px]`.
- Subtitle `Answered prayers, kept close` muted DM Sans.
- Hide the view-mode toggle (`cards / timeline`), sort dropdown, and filter — not present in screenshot.
- Remove `GlobalAudioButton` from header.

**Default to `TimelineView`**
- Force `viewMode = 'timeline'` and remove the toggle.
- Timeline rail style: vertical 1.5px line on the left (already implemented). Each marker is a small circle outline with center dot — match the screenshot's open-circle marker.
- Each entry block:
  - Eyebrow: `MARCH 2025` in terracotta uppercase 11px tracked.
  - Title: bold DM Sans 17px white.
  - Big days-carried number `84` in Playfair `text-[44px]` terracotta + `days carried` muted small beside it (already implemented; verify size).
  - `Tap to read testimony →` muted small link below.

---

## 6. Shared cleanups

- **Filter pill utility** (`src/index.css` `filter-pill-active`): make active state use solid terracotta bg + dark fg to match screenshot (currently may be primary/10 tint).
- **Tag colors** (`prayerData.ts` already has tag categories): ensure each tag has a chip background and text color matching screenshot:
  - Health → green (`bg-emerald-700/40 text-emerald-300`)
  - Work → blue (`bg-blue-700/40 text-blue-300`)
  - Family → brown/terracotta (`bg-amber-900/40 text-amber-300`)
  - Finances → olive (`bg-yellow-800/40 text-yellow-300`)
  - Others tags get muted defaults.
- **Round `+` button**: introduce a shared variant (or reuse existing `Button variant="warm" size="icon"`) styled `rounded-full w-11 h-11 bg-primary text-primary-foreground shadow-glow`.

---

## Out of scope (explicitly not changing)

- All hooks, contexts, data fetching, mutations, RLS, edge functions, Stripe.
- Auth flow, landing page, prayer flow screens, settings.
- Filter/sort logic in Journal & Stones (moving UI behind a menu later, not in this pass).
- Color palette tokens — current dark indigo + terracotta already matches the screenshots.

---

## Files to edit

```text
src/pages/Index.tsx
src/pages/Requests.tsx
src/pages/Journal.tsx
src/pages/Answered.tsx
src/components/home/BeginPrayerTile.tsx
src/components/home/ThreadsStrip.tsx
src/components/home/StoneOfRemembranceQuote.tsx
src/components/navigation/BottomNav.tsx
src/components/navigation/BottomNavItem.tsx
src/components/prayer/RequestCard.tsx
src/index.css            (filter-pill-active tweak)
```

After implementation, QA against each screenshot at the 390–414px mobile preview to confirm spacing, alignment, and color chips match.
