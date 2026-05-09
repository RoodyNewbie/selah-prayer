# Landing and App Alignment Plan

This document captures the landing/app alignment direction used for the immediate implementation PR.

## Source-of-Truth Rules

- Framework cards on the landing page must be derived from `builtInFormats`.
- Primary route labels should come from shared navigation metadata used by the authenticated app navigation and landing preview surfaces where practical.
- Static demo content must use real domain shape names where possible.
- Preview labels should use authenticated app terminology: `Home`, `Requests`, `Pray`, `Journal`, and `Stones`.

## Shared Navigation Config

Primary app navigation metadata lives in `src/lib/navigation.ts` and is intended to be shared by `BottomNav` and landing preview UI.

## Shared Marketing Content

Landing feature/framework/demo content lives in `src/lib/marketingContent.ts` so static content is easy to audit against app routes and built-in prayer formats.

## QA Checklist For Every Landing Change

- [ ] Do all nav labels match authenticated app labels?
- [ ] Do all framework names and phase counts come from `builtInFormats`?
- [ ] Does every feature card map to a real route or component?
- [ ] Does the preview show the same sequence users actually experience?
- [ ] Does copy avoid promising behavior gated by donor status unless labeled as such?
- [ ] Does the landing still look cohesive next to `/home`, `/pray`, and `/settings` in light and dark mode?
- [ ] Does custom palette mode remain readable and visually compatible?
- [ ] Are screenshots updated for landing + app after visual changes?

## Recommended Immediate PR Scope

1. Add shared `navigation.ts` route metadata.
2. Refactor `BottomNav` and landing preview labels from that metadata.
3. Derive landing framework cards from `builtInFormats`.
4. Tighten the Daily Scripture copy.
5. Add screenshot QA notes to the PR description.
