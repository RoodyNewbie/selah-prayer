# Selah Redesign — Implementation Spec
**React + TypeScript + Tailwind + shadcn/ui**
Date: April 24, 2026

---

## 0. Reference Files

The HTML prototype lives in `Selah Redesign.html`, `selah-screens.jsx`, and `selah-pray.jsx`.
These are **design references only** — not production code. Recreate them in the existing Selah codebase using its hooks, contexts, and Supabase queries.

---

## 1. Design Philosophy

The redesign moves away from generic card-on-card shadcn dashboard patterns toward a **contemplative illuminated journal** aesthetic:

- **Depth through tone, not borders** — no card outlines; use background tiers (`bg`, `bg1`, `bg2`) for visual separation
- **Scripture is the hero** — the daily verse leads the home screen at display scale; never tucked away
- **Immersive prayer phases** — each phase fills the viewport with a unique color wash; the prompt is the largest element
- **Handwritten journal feel** — ruled textarea lines, borderless input, Playfair Display italic for prompts and quotes
- **Phase sigils** — custom SVG glyphs replace generic progress dots on the prayer rail

---

## 2. Design Token System

Replace the existing shadcn token values in `src/index.css` with these. Keep the same CSS variable names so shadcn components continue to work.

### 2a. Color Palette

#### Light mode (`:root`)
```css
/* Tiers */
--background:   hsl(42 30% 97%);      /* Warm vellum parchment */
--card:         hsl(40 24% 94%);      /* bg1 — cards, raised surfaces */
--muted:        hsl(40 20% 90%);      /* bg2 — pressed/hover states */

/* Text */
--foreground:        hsl(232 22% 17%);  /* Near-black, warm blue tint */
--muted-foreground:  hsl(232 12% 50%);  /* Secondary text */
--fg3:               hsl(40 10% 66%);   /* Tertiary / timestamps — add as custom var */

/* Primary — cool morning blue */
--primary:           hsl(220 52% 40%);
--primary-foreground: hsl(42 30% 97%);
--ring:              hsl(220 52% 40%);

/* Accent — warm amber */
--accent:            hsl(42 48% 58%);
--accent-foreground: hsl(232 22% 17%);

/* Structure */
--border:  hsl(40 22% 86%);
--input:   hsl(40 24% 94%);

/* Shadows */
--shadow-pri: hsl(220 52% 40% / 0.28);  /* custom var */
```

#### Dark mode (`.dark`)
```css
/* Deep midnight indigo, NOT just inverted light */
--background:   hsl(240 28% 11%);
--card:         hsl(240 24% 16%);
--muted:        hsl(240 20% 20%);

--foreground:        hsl(44 20% 93%);   /* Warm off-white */
--muted-foreground:  hsl(240 10% 60%);
--fg3:               hsl(240  8% 40%);  /* custom var */

/* Primary shifts to warm terracotta in dark mode */
--primary:           hsl(26 56% 64%);
--primary-foreground: hsl(240 28% 11%);
--ring:              hsl(26 56% 64%);

--accent:            hsl(43 50% 70%);
--accent-foreground: hsl(240 28% 11%);

--border: hsl(240 18% 22%);
--input:  hsl(240 24% 16%);

--shadow-pri: hsl(26 56% 64% / 0.22);
```

#### Phase tint backgrounds (add as custom CSS vars)
Each prayer phase gets its own full-viewport background tint. These are **barely-there** washes — think watercolor on white paper:

```css
/* Light mode */
--ph-praise:      hsl(44  60% 97.5%);   /* Warm gold */
--ph-will:        hsl(150 42% 97.5%);   /* Sage green */
--ph-needs:       hsl(222 38% 97.5%);   /* Calm blue */
--ph-forgiveness: hsl(340 45% 97.5%);   /* Soft rose */
--ph-protection:  hsl(268 35% 97.5%);   /* Lavender */
--ph-worship:     hsl(42  52% 97.5%);   /* Golden amber */

/* Dark mode */
--ph-praise:      hsl(44  38% 13%);
--ph-will:        hsl(148 32% 13%);
--ph-needs:       hsl(220 30% 13%);
--ph-forgiveness: hsl(338 35% 13%);
--ph-protection:  hsl(268 28% 13%);
--ph-worship:     hsl(42  38% 13%);
```

Map these to Tailwind arbitrary values: `bg-[hsl(var(--ph-praise))]` or create a plugin.

### 2b. Palette Presets (user-selectable)

Support 4 accent presets. Store choice in `localStorage` and apply via CSS var override:

| Name | `--primary` (light) | Notes |
|------|---------------------|-------|
| Dawn (default) | `hsl(220 52% 40%)` | Morning blue |
| Candlelight | `hsl(26 56% 56%)` | Warm flame |
| Cathedral | `hsl(262 44% 44%)` | Deep indigo |
| Garden | `hsl(155 44% 36%)` | Quiet sage |

Apply by setting `document.documentElement.style.setProperty('--primary', value)` and persist to a `accent_preset` field in the `profiles` table (or localStorage for v1).

---

## 3. Typography System

Keep the existing font imports: **Playfair Display** (display/serif) + **DM Sans** (body).

### Type Scale

| Role | Class | Size | Weight | Line-height | Letter-spacing | Notes |
|------|-------|------|--------|-------------|----------------|-------|
| App name | `font-display text-[22px] font-medium` | 22px | 500 | — | 0.01em | Header "Selah" wordmark |
| Screen title | `font-display text-2xl font-medium` | 24px | 500 | — | — | Page H1s |
| Scripture hero | `font-display text-[26-28px] italic` | 26–28px | 400 | 1.55 | 0.005em | Home screen blockquote |
| Phase prompt | `font-display text-[26px] italic` | 26px | 400 | 1.5 | 0.008em | The question card in pray flow |
| Drop cap "A" | `font-display text-[68px] italic` | 68px | 400 | 0.8 | -0.02em | First letter of "Amen" on complete screen |
| "men." suffix | `font-display text-[38px]` | 38px | 400 | 1.0 | 0.04em | Paired with drop cap |
| Days-waited hero | `font-display text-[36px]` | 36px | 400 | 1 | — | Stones timeline number |
| Body default | `font-body text-[15px]` | 15px | 400–500 | 1.65 | — | Request titles, content |
| Secondary | `font-body text-[13-14px]` | 13–14px | 400 | 1.55–1.6 | — | Descriptions, sub-labels |
| Eyebrow / label | `font-body text-[10-11px] font-semibold uppercase tracking-[0.1em]` | 10–11px | 600 | — | 0.10em | All-caps category labels |
| Scripture quote (inline) | `font-display text-[12px] italic` | 12px | 400 | 1.65 | — | Phase-screen scripture |
| Timestamp / tertiary | `font-body text-[11px]` | 11px | 400–500 | — | — | Dates, counts |

### Typography utilities to add to `tailwind.config.ts`

```ts
// in theme.extend
fontFamily: {
  display: ['"Playfair Display"', 'serif'],
  body:    ['"DM Sans"', 'sans-serif'],
},
```

These already exist — keep them. Use `font-display` and `font-body` throughout instead of `font-serif`/`font-sans`.

---

## 4. Spacing & Layout System

The app is **mobile-only** (max-width ~430px). Do not add breakpoint variants for these components.

### Global layout shell

```tsx
<div className="relative w-full min-h-dvh bg-background text-foreground overflow-hidden">
  {/* Screen content */}
  <main className="pb-[82px] pt-[56px] overflow-y-auto overflow-x-hidden h-dvh">
    {/* page content */}
  </main>
  <BottomNav />
</div>
```

- `pt-[56px]` — clears the Dynamic Island / status bar area
- `pb-[82px]` — clears the BottomNav (82px tall)
- `h-dvh` — use `dvh` not `vh` for reliable mobile viewport height

### Horizontal padding
- Standard content: `px-6` (24px)
- Section titles & headers: `px-6`
- Scrollable strip items: `px-6` then items have no extra padding

### Vertical rhythm
- Header bottom border: `border-b border-border`
- Section gaps: `space-y-[18px]` or `gap-[18px]`
- List item padding: `py-4` (16px top + bottom) with `border-b border-border` between items
- Section top/bottom: `py-7` (28px) for the scripture plate, `py-5` (20px) for most sections

---

## 5. Screen Specifications

### 5a. Home Screen (`/home` → `src/pages/Index.tsx`)

**Layout structure (top to bottom):**

```
┌─ Header bar (h-[56px], px-6) ──────────────────┐
│  "Selah" wordmark (left)   dark mode toggle (right) │
├─ Scripture Plate (py-7, px-7, text-center) ────┤
│  ─── ✦ ─── (ornamental divider)                │
│  blockquote: large italic Playfair verse        │
│  — REFERENCE (10px eyebrow, primary color)      │
│  ─── ✦ ─── (ornamental divider)                │
├─ Last prayed text (text-center, py-[14px]) ────┤
├─ Asymmetric CTA tile (mx-5) ───────────────────┤
│  border-radius: 20px 8px 20px 8px              │
│  Begin Prayer title + sigil strip + arrow       │
├─ Threads strip header (px-6) ──────────────────┤
│  "ONGOING · N CARRIED" + "View all" link        │
├─ Threads horizontal scroll (px-6) ─────────────┤
│  [Title · N days] cards, min-w-[100px]          │
├─ Stone of Remembrance (px-6, py-4) ────────────┤
│  3px primary left bar + title + date            │
└────────────────────────────────────────────────┘
```

**Ornamental dividers:**
```tsx
<div className="flex items-center gap-[10px]">
  <div className="flex-1 h-px bg-border" />
  <span className="text-muted-foreground text-[13px]">✦</span>
  <div className="flex-1 h-px bg-border" />
</div>
```

**Asymmetric Begin Prayer tile:**
```tsx
<button
  onClick={onStartPray}
  className="w-full bg-card border border-border text-left p-[20px_22px] transition-all duration-200 hover:bg-muted hover:shadow-[0_4px_20px_hsl(var(--shadow-pri))]"
  style={{ borderRadius: '20px 8px 20px 8px' }}
>
  <div className="flex justify-between items-start mb-1">
    <span className="font-display text-[22px] font-medium text-foreground">Begin Prayer</span>
    <span className="text-primary text-[18px] mt-0.5">→</span>
  </div>
  <p className="text-[12px] text-muted-foreground mb-[14px]">6 phases · ~10 minutes</p>
  <div className="flex gap-[9px] items-center">
    {PHASE_IDS.map((id, i) => <PhaseSigil key={id} phase={id} size={14} className={i===0 ? 'text-primary' : 'text-muted-foreground/60'} />)}
  </div>
</button>
```

**Threads strip item:**
```tsx
<div className="flex-shrink-0 min-w-[100px] bg-card border border-border rounded-xl p-[12px_14px] cursor-pointer hover:bg-muted transition-colors">
  <p className="text-[13px] font-medium text-foreground leading-[1.3] mb-1">{thread.title}</p>
  <p className="text-[11px] text-muted-foreground">{thread.days} days</p>
</div>
```

**Stone of Remembrance pull-quote:**
```tsx
<button className="flex gap-[14px] w-full text-left py-4">
  <div className="w-[3px] flex-shrink-0 bg-primary rounded-[2px] mt-1 self-stretch" />
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-[6px]">Stone of Remembrance</p>
    <p className="text-[15px] font-medium text-foreground leading-[1.5]">{stone.title}</p>
    <p className="text-[12px] text-muted-foreground mt-1">{stone.date} · {stone.daysWaited} days carried</p>
  </div>
</button>
```

---

### 5b. Requests Screen (`/requests` → `src/pages/Requests.tsx`)

**Structure:**
- Header with title left + circular primary `+` button right
- Horizontal filter pill row (scrollable, `overflow-x-auto`, `gap-2`, `px-6`, `py-3`)
- List of requests separated by `border-b border-border`

**Filter pills** (already in codebase — update styles):
```tsx
// Active
className="flex-shrink-0 px-[14px] py-[6px] rounded-full text-[12px] font-medium bg-primary text-primary-foreground transition-all"
// Inactive
className="flex-shrink-0 px-[14px] py-[6px] rounded-full text-[12px] font-medium bg-card text-muted-foreground transition-all hover:bg-muted"
```

**Request list item layout:**
```
[44px date col] [flex-1 title + tag row] [30px circle check btn]
```
- Date col: `text-[11px] text-muted-foreground text-right leading-[1.4]`, split "Apr" / "18" onto two lines
- Title: `text-[15px] font-medium text-foreground leading-[1.45] mb-[6px]`
- Tag chip: `text-[11px] font-medium px-[9px] py-[2px] rounded-full capitalize` with per-tag background (see tag color system below)
- Check button: `w-[30px] h-[30px] rounded-full border border-border hover:border-primary hover:text-primary transition-all`

**Tag color system (add to `src/lib/prayerData.ts` or define in CSS):**

| Tag | Light bg | Light fg | Dark bg | Dark fg |
|-----|----------|----------|---------|---------|
| health | `hsl(155 42% 90%)` | `hsl(155 45% 25%)` | `hsl(155 30% 22%)` | `hsl(155 55% 70%)` |
| work | `hsl(222 40% 90%)` | `hsl(222 45% 25%)` | `hsl(222 28% 22%)` | `hsl(222 55% 70%)` |
| family | `hsl(22 55% 90%)` | `hsl(22 55% 25%)` | `hsl(22 38% 22%)` | `hsl(22 60% 70%)` |
| finances | `hsl(42 48% 90%)` | `hsl(42 50% 28%)` | `hsl(42 35% 22%)` | `hsl(42 60% 70%)` |
| spiritual | `hsl(272 38% 90%)` | `hsl(272 42% 28%)` | `hsl(272 28% 22%)` | `hsl(272 55% 70%)` |
| others | `hsl(0 0% 91%)` | `hsl(0 0% 32%)` | `hsl(0 0% 20%)` | `hsl(0 0% 65%)` |

---

### 5c. Journal Screen (`/journal` → `src/pages/Journal.tsx`)

**Layout:** Same header pattern. List items separated by `border-b border-border`.

**Journal entry item:**
```tsx
<div className="px-6 py-5">
  <div className="flex justify-between items-center mb-[9px]">
    <span className={cn("text-[10px] font-semibold uppercase tracking-[0.1em]",
      entry.type === 'dream' ? 'text-primary' : 'text-accent')}>
      {entry.type === 'dream' ? 'Dream' : 'Word'}
    </span>
    <span className="text-[11px] text-muted-foreground">{entry.date}</span>
  </div>
  <p className={cn("text-foreground leading-[1.65]",
    entry.type === 'word'
      ? 'font-display italic text-[18px]'
      : 'font-body text-[15px]')}>
    {entry.text}
  </p>
</div>
```

---

### 5d. Stones of Remembrance Screen (`/answered` → `src/pages/Answered.tsx`)

**Timeline layout:**

This is the most structurally novel screen. Replace the existing card list with a vertical ink-rail timeline.

```tsx
<div className="px-6 py-7 relative">
  {/* Vertical ink rail — positioned behind all items */}
  <div className="absolute left-[35px] top-7 bottom-7 w-[1.5px] bg-border" />

  {answeredRequests.map((item, i) => (
    <div key={item.id} className="flex gap-[18px] relative mb-10 last:mb-0">
      {/* Rail marker */}
      <div className={cn(
        "w-[26px] h-[26px] rounded-full flex-shrink-0 z-10 mt-1 flex items-center justify-center",
        "border-2 transition-all duration-[280ms] ease-[cubic-bezier(0.37,0,0.63,1)]",
        isExpanded ? "bg-primary border-primary shadow-[0_0_0_4px_hsl(var(--shadow-pri))]" : "bg-background border-border"
      )}>
        <div className={cn("w-[7px] h-[7px] rounded-full transition-colors duration-[280ms]",
          isExpanded ? "bg-white" : "bg-border")} />
      </div>

      {/* Content */}
      <div className="flex-1 cursor-pointer" onClick={() => toggle(item.id)}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-1">{item.date}</p>
        <p className="text-[15px] font-semibold text-foreground leading-[1.4] mb-[10px]">{item.title}</p>

        {/* Days waited — THE hero number */}
        <div className="flex items-baseline gap-[5px] mb-1">
          <span className="font-display text-[36px] text-primary leading-none">{item.daysWaited}</span>
          <span className="text-[11px] text-muted-foreground font-medium">days carried</span>
        </div>

        {/* Testimony — only when expanded */}
        {isExpanded && (
          <p className="font-display italic text-[14px] text-muted-foreground leading-[1.78] mt-[14px] animate-fade-in">
            "{item.testimony}"
          </p>
        )}
        {!isExpanded && (
          <p className="text-[11px] text-muted-foreground">Tap to read testimony →</p>
        )}
      </div>
    </div>
  ))}
</div>
```

**`daysWaited` data:** Add a `days_waited` computed column or calculate it client-side from `created_at` to `answered_at` on `prayer_requests`.

---

## 6. Bottom Navigation (`src/components/navigation/BottomNav.tsx`)

Complete redesign — replaces 4-equal-tab layout with **raised center pray button**.

```
[Home] [Requests] [🕊 PRAY] [Journal] [Stones]
           ↑ cross icon, 54×54px circle raised 18px above nav bar
```

**Structure:**
```tsx
<nav className="fixed bottom-0 left-0 right-0 h-[82px] bg-background border-t border-border flex items-start justify-around pt-[10px] z-50">
  <NavItem to="/" icon={Home} label="Home" />
  <NavItem to="/requests" icon={ListChecks} label="Requests" />

  {/* Raised center pray button */}
  <button
    onClick={onStartPray}
    className="-mt-[18px] flex flex-col items-center"
  >
    <div className="w-[54px] h-[54px] rounded-full bg-primary flex items-center justify-center shadow-[0_4px_18px_hsl(var(--shadow-pri))] transition-all duration-150 hover:scale-[1.06] active:scale-[0.97]">
      {/* Cross sigil */}
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round">
        <path d="M12 3v18M5 9h14"/>
      </svg>
    </div>
  </button>

  <NavItem to="/journal" icon={BookOpen} label="Journal" />
  <NavItem to="/answered" icon={Milestone} label="Stones" />
</nav>
```

**NavItem:**
```tsx
function NavItem({ to, icon: Icon, label }) {
  const active = useMatch(to);
  return (
    <Link to={to} className={cn("flex-1 flex flex-col items-center gap-[3px] py-[2px] transition-colors",
      active ? "text-primary" : "text-muted-foreground/60")}>
      <Icon size={22} strokeWidth={active ? 2 : 1.75} />
      <span className="text-[10px] font-medium uppercase tracking-[0.04em]">{label}</span>
    </Link>
  );
}
```

---

## 7. Prayer Flow

### 7a. Format Select Screen

A full-screen sheet (presented as a page, not a modal) with 3 format cards.

**Card styles:**
- First card (Lord's Prayer): `bg-primary text-primary-foreground`, `rounded-[20px_8px_20px_8px]`
- Others: `bg-card border border-border rounded-[14px]` with `hover:bg-muted`

Each card shows the format's **sigil strip** — a row of `PhaseSigil` components at 13px, colored `text-primary-foreground/65` for the active card, `text-muted-foreground/60` for others.

### 7b. Phase Screen (`src/pages/Pray.tsx` — phase rendering section)

**Full-viewport background** — the entire screen background shifts to the phase tint:
```tsx
<div
  className="min-h-dvh flex flex-col"
  style={{
    backgroundColor: `hsl(var(--ph-${currentPhase.id}))`,
    transition: 'background-color 700ms cubic-bezier(0.37, 0, 0.63, 1)',
  }}
>
```

**Phase header (top bar):**
```
[X button, 34px circle]   [PHASE NAME, 10px eyebrow]   [N / total, 13px]
```

**Illuminated progress rail** (replaces `PhaseProgress.tsx`):
```tsx
<div className="flex items-center px-5 py-[10px]">
  {phases.map((phase, i) => {
    const done = i < phaseIdx, curr = i === phaseIdx;
    return (
      <React.Fragment key={phase.id}>
        {i > 0 && (
          <div className={cn("flex-1 h-[1.5px] min-w-[4px] transition-colors duration-[600ms]",
            i <= phaseIdx ? "bg-primary" : "bg-border")} />
        )}
        <div
          title={phase.name}
          className={cn(
            "rounded-full flex-shrink-0 flex items-center justify-center border transition-all duration-[600ms] ease-[cubic-bezier(0.37,0,0.63,1)]",
            curr ? "w-[30px] h-[30px] shadow-[0_0_0_4px_hsl(var(--shadow-pri))]" : "w-[22px] h-[22px]",
            done ? "bg-primary border-primary" : "bg-transparent",
            curr ? "border-primary" : done ? "border-primary" : "border-border"
          )}
        >
          <PhaseSigil
            phase={phase.id}
            size={curr ? 14 : 10}
            strokeWidth={done ? 2 : 1.5}
            className={done ? "text-white" : curr ? "text-primary" : "text-muted-foreground/40"}
          />
        </div>
      </React.Fragment>
    );
  })}
</div>
```

**Phase content area** — the content slides in from the right on each phase change:

Apply `key={currentPhase.id}` to the content wrapper so React remounts it. Use a CSS animation:
```css
/* in index.css */
@keyframes phaseIn {
  from { opacity: 0; transform: translateX(22px); }
  to   { opacity: 1; transform: translateX(0); }
}
.animate-phase-in {
  animation: phaseIn 620ms cubic-bezier(0.37, 0, 0.63, 1) both;
}
```

**Scripture (top of phase content):**
```tsx
<p className="font-display italic text-[12px] text-center text-muted-foreground leading-[1.65] mb-[18px]">
  {phase.scripture}
</p>
```

**THE PROMPT — hero element:**
```tsx
<h2 className="font-display italic text-[26px] text-foreground text-center leading-[1.5] tracking-[0.008em]">
  {phase.prompt}
</h2>
<p className="font-body italic text-[13px] text-muted-foreground text-center mt-[9px]">
  {phase.sub}
</p>
```

**Ruled textarea** (the journal experience):
```tsx
<textarea
  ref={textareaRef}
  value={value}
  onChange={e => onChange(e.target.value)}
  placeholder="Write freely…"
  className="flex-1 w-full bg-transparent border-none outline-none resize-none font-body text-[16px] text-foreground leading-[28px] caret-primary pt-3"
  style={{
    backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, hsl(var(--border)) 27px, hsl(var(--border)) 28px)',
    backgroundPositionY: '12px',
    minHeight: '100px',
  }}
/>
```

The textarea is separated from the prompt by `border-t border-border mt-[18px] pt-4`.

**Bottom actions:**
```tsx
<div className="flex justify-between items-center px-7 pt-3 pb-[34px] border-t border-border">
  <button className="font-body text-[14px] text-muted-foreground" onClick={onSkip}>Skip</button>
  <button className="font-body text-[15px] font-medium text-primary flex items-center gap-[6px]" onClick={onNext}>
    {isLast ? 'Finish' : 'Continue'}
    <ArrowRight size={16} />
  </button>
</div>
```

### 7c. Completion Screen

**Drop cap "Amen":**
```tsx
<div className="flex items-baseline gap-[1px]">
  <span className="font-display italic text-[68px] text-primary leading-[0.8] tracking-[-0.02em]">A</span>
  <span className="font-display text-[38px] text-foreground leading-none tracking-[0.04em]">men.</span>
</div>
```

**Phase miniature cards** (horizontal scroll strip):
```tsx
<div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
  {phases.map(phase => (
    <div key={phase.id} className="flex-shrink-0 w-24 bg-card border border-border rounded-[10px] p-[10px_12px]">
      <div className="flex items-center gap-[5px] mb-[6px]">
        <PhaseSigil phase={phase.id} size={11} className="text-primary" strokeWidth={1.5} />
        <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{phase.name}</span>
      </div>
      <p className={cn("text-[11px] leading-[1.5]", content[phase.id] ? "text-foreground" : "text-muted-foreground italic")}>
        {content[phase.id]
          ? content[phase.id].substring(0, 55) + (content[phase.id].length > 55 ? '…' : '')
          : 'Not written'}
      </p>
    </div>
  ))}
</div>
```

---

## 8. Phase Sigil Component

Create `src/components/prayer/PhaseSigil.tsx`:

```tsx
// src/components/prayer/PhaseSigil.tsx
import { cn } from '@/lib/utils';

const SIGIL_PATHS: Record<string, string> = {
  praise:      'M12 7 L13.8 11.2 L18 12 L13.8 12.8 L12 17 L10.2 12.8 L6 12 L10.2 11.2 Z',
  will:        'M12 4c-4 4-5 8-5 10a5 5 0 0010 0c0-2-1-6-5-10z',
  needs:       'M5 9h14 M7 9l1.5 9h7L17 9',
  forgiveness: 'M12 3l5 9a5 5 0 01-10 0z',
  protection:  'M12 3l9 3.5V12c0 5.5-4 9-9 10-5-1-9-4.5-9-10V6.5z',
  worship:     'M12 3c-4 4-4 9-4 10a4 4 0 008 0c0-1 0-6-4-10z',
};

interface PhaseSigilProps {
  phase: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function PhaseSigil({ phase, size = 16, strokeWidth = 1.75, className }: PhaseSigilProps) {
  const d = SIGIL_PATHS[phase];
  if (!d) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      className={className}
    >
      {d.split(' M').map((segment, i) => (
        <path key={i} d={i === 0 ? segment : 'M' + segment} />
      ))}
    </svg>
  );
}
```

---

## 9. Interaction Patterns & Transitions

### Navigation transitions
- Screen entrance: `animate-slide-up` (already in codebase) — keep `0.5s ease-out`
- Phase content entrance: `animate-phase-in` — **new** keyframe, `620ms cubic-bezier(0.37, 0, 0.63, 1)` (breath easing)
- Phase background shift: `transition: background-color 700ms cubic-bezier(0.37, 0, 0.63, 1)`

### Interactive states
- **Cards / list rows:** `hover:bg-muted` + `transition-colors duration-150`
- **Begin Prayer tile:** `hover:bg-muted hover:shadow-[0_4px_20px_hsl(var(--shadow-pri))]`
- **Center pray button:** `hover:scale-[1.06] active:scale-[0.97]` + `transition-all duration-150`
- **Answer check button on requests:** `hover:border-primary hover:text-primary transition-all`
- **Stone timeline marker:** expand/collapse with `transition-all duration-[280ms] ease-[cubic-bezier(0.37,0,0.63,1)]`
- **Format select cards:** `hover:bg-muted transition-all duration-200`

### Bottom sheet (Add Request, Tweaks)
- Slide up from bottom with `animate-slide-up`
- Overlay: `bg-black/45`
- Sheet: `rounded-[24px_24px_0_0]`
- Close on overlay tap

### Focus states
- All focusable elements: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1`
- Textarea: no visible focus ring (already full-screen, caret color is primary)

---

## 10. Mobile-First Considerations

1. **Use `dvh` not `vh`** everywhere for height — `min-h-dvh`, `h-dvh` — avoids iOS Safari URL-bar reflow.

2. **No `overflow: hidden` on `body`** — let the individual `.screen` div handle scrolling. This avoids modal/sheet breakage on iOS.

3. **Textarea on iOS** — set `font-size: 16px` minimum to prevent iOS auto-zoom on focus. This is already correct in the spec above.

4. **Horizontal scroll strips** (Threads, Phase miniatures, Filter pills):
   - `overflow-x: auto`, `-webkit-overflow-scrolling: touch`
   - `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` (`.no-scrollbar` utility — add to Tailwind config)

5. **Tap targets** — minimum 44×44px for all interactive elements. Check button on requests (30px circle) is below this — add `p-[7px]` padding to keep visual size but expand tap target, or increase to 44px.

6. **Notch / Dynamic Island clearance** — `pt-[56px]` covers this on all modern iPhones. No need for `safe-area-inset-top` unless targeting older notch designs.

7. **Bottom safe area** — on phones with home indicator, add:
   ```tsx
   <nav className="... pb-[env(safe-area-inset-bottom,0px)]" style={{ height: 'calc(82px + env(safe-area-inset-bottom, 0px))' }}>
   ```

8. **`-webkit-tap-highlight-color: transparent`** on all buttons — add to global `* {}` in `index.css`.

---

## 11. Files to Touch in the Codebase

| File | Change |
|------|--------|
| `src/index.css` | Replace token values; add phase tint vars; add `animate-phase-in` keyframe; add `.no-scrollbar` utility |
| `tailwind.config.ts` | Add `no-scrollbar` plugin or utility; confirm font families |
| `src/pages/Index.tsx` | Full redesign — scripture plate, asymmetric CTA tile, threads strip, stone pull-quote |
| `src/pages/Requests.tsx` | Update filter pills, list item layout, tag color system |
| `src/pages/Journal.tsx` | Update entry item typography/layout |
| `src/pages/Answered.tsx` | Replace card list with ink-rail timeline + days-waited hero number |
| `src/pages/Pray.tsx` | Phase tint backgrounds, phase content animation, ruled textarea |
| `src/components/prayer/PhaseProgress.tsx` | Replace progress bar with illuminated sigil rail |
| `src/components/prayer/PhaseCard.tsx` | Drop border, update prompt typography, ruled textarea |
| `src/components/navigation/BottomNav.tsx` | Raised center pray button |
| `src/components/navigation/BottomNavItem.tsx` | Active/inactive styles |
| `src/components/prayer/PhaseSigil.tsx` | **NEW** — create this component |
| `src/lib/prayerData.ts` | Add `sigil` field per phase; add tag color map |

---

## 12. What NOT to Change

- All Supabase hooks and query logic — these are correct and separate from UI
- `src/components/ui/` — shadcn primitives, leave untouched
- Auth flow, protected route logic
- Stripe/donor gating logic
- Edge function integrations
- `src/integrations/supabase/types.ts`
