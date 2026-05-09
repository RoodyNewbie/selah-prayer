# Selah Design Direction

## 1) Product Design North Star
Selah should feel like a sacred daily return, not a productivity dashboard. The interface must communicate **quiet focus, reverence, and emotional safety** while preserving the app’s current theological and functional structure. 

The redesign direction is a refinement strategy:
- Keep the spiritual structure users already trust (phases, scripture, journaling, remembrance).
- Remove visual noise that reads as generic SaaS scaffolding.
- Increase contemplative clarity through typography, rhythm, and restrained ornament.

### Experience Statement
> “Open Selah and immediately exhale.”

Users should feel invited into prayerful presence within seconds, with minimal cognitive overhead and a clear primary path to begin prayer.

---

## 2) Core Design Philosophy

### 2.1 Contemplative Utility
Every element should serve either:
1. spiritual focus,
2. emotional grounding, or
3. gentle task completion.

### 2.2 Sacred Restraint
Use visual warmth, not decoration. Keep symbolic language subtle and dignified. Avoid cliché “church app” motifs.

### 2.3 Human Texture Over Dashboard Chrome
Prefer typographic hierarchy, spacing, soft tonal surfaces, and thin rules over heavy card borders and high-contrast container stacking.

### 2.4 Primary Action Clarity
Prayer is the center of the product, so primary navigation and home hierarchy should continually orient toward beginning prayer.

---

## 3) Visual Identity System

## 3.1 Typography
- **Display voice**: Keep Playfair Display as the devotional/emotional anchor (scripture, major headings, pull quotes).
- **Body voice**: Keep DM Sans for legibility in journaling, controls, and metadata.
- **Usage rhythm**:
  - Scripture and testimony quotes: larger, italicized display text.
  - Functional labels and metadata: small, calm sans-serif.
  - Avoid dense all-caps except restrained micro-labels.

## 3.2 Spacing and Layout Cadence
- Adopt a breathing rhythm that mimics journal pagination (larger vertical spacing, fewer competing blocks).
- Favor max-width reading columns for reflective content.
- Replace multi-box density with sectional flow:
  - heading
  - reflection content
  - divider/rule
  - action

## 3.3 Color and Atmosphere
- Base palette should remain warm/cool balanced, with slightly softened contrast.
- Surfaces should feel like layered paper and light, not flat app panes.
- Accent colors should be sparse and meaningful (calls to prayer, active state, testimony markers).

## 3.4 Tone and Microcopy
- Language should be pastoral and invitational, never transactional.
- Replace mechanical phrasing with calm, direct spiritual guidance.
- Keep brevity: one clear sentence per moment is better than explanatory clutter.

---

## 4) UX Principles

### 4.1 Quiet by Default
- No abrupt movement or aggressive highlighting.
- Emphasize reduced cognitive load over discoverability gimmicks.

### 4.2 Progressive Depth
- Show what is needed now; reveal deeper context only when asked.
- Support reflective pacing in prayer phases (not throughput optimization).

### 4.3 Emotional Anchoring
- Home opens with scripture-led orientation.
- Answered prayer areas read as testimony and remembrance, not list administration.

### 4.4 Ritual Continuity
- Repeated actions should feel ritualized and familiar.
- Keep route structure and core interaction models stable so redesign is emotionally additive, not disruptive.

---

## 5) Component Pattern Direction

## 5.1 Cards and Containers
- De-emphasize heavy bordered cards as default framing.
- Introduce hierarchy via:
  - whitespace
  - thin section rules
  - soft tonal backgrounds
  - typographic contrast
- Reserve stronger cards for key moments (critical CTA, warnings, completion states).

## 5.2 Scripture Hero
- Promote scripture to an editorial “hero” treatment on Home.
- Larger display scale, generous leading, italic emphasis, centered composition.
- Surround with subtle atmospheric treatment (glow/noise/tonal veil), never high-contrast ornament.

## 5.3 Prayer Phase Surfaces
- Each phase should feel like entering a quiet room.
- Use subtle per-phase background shifts as atmospheric cues.
- Keep transitions gentle and reduced-motion aware.

## 5.4 Journal Text Areas
- Move toward borderless, manuscript-like writing surfaces.
- Prioritize writing comfort (line-height, breathing room, low visual interruption).
- Input chrome should recede while preserving accessibility and focus visibility.

## 5.5 Navigation
- Move from equal-weight tab pattern to a center-emphasis prayer action.
- Center prayer button should read as invitation, not floating gimmick.
- Secondary destinations remain available but visually subordinate.

## 5.6 Remembrance/Testimony Presentation
- “Stones of Remembrance” should use testimony-first composition:
  - pull-quote treatment
  - date/journey metadata as secondary
  - memorial tone over CRUD tone

---

## 6) Light and Dark Mode Intent

## 6.1 Light Mode
- Warm physical-paper sensibility.
- Soft ivory and muted neutrals with restrained accent use.
- Gentle shadowing; avoid bright clinical whites.

## 6.2 Dark Mode
- Not a simple inversion of light tokens.
- Use deep indigo foundations with warm terracotta/amber accents.
- Lower contrast pairings and glow discipline to reduce visual fatigue.
- Preserve contemplative readability for long-form prayer and journaling.

---

## 7) What Makes Selah Distinct (vs Generic SaaS)
Selah differentiates through **devotional pacing + sacred emotional tone + liturgical interaction structure**:
- Prayer phases are a guided spiritual progression, not a wizard form.
- Scripture and testimony are first-class emotional anchors.
- Journaling and remembrance are framed as spiritual practice, not data capture.
- Donor personalization remains supportive and respectful, not conversion-forward.

The redesign should amplify these traits so users perceive Selah as a personal sanctuary in app form.

---

## 8) Design Governance Notes
- Redesign is visual/experiential only; existing product architecture remains intact.
- Respect current data flow, auth/security assumptions, and domain structures.
- Validate direction in phases to avoid regressions and preserve trust continuity.
