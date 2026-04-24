# Homepage Mobile UI Improvement

**Date:** 2026-04-25  
**Scope:** Mobile-only (`< sm` breakpoint). Desktop is untouched.  
**Pages affected:** Homepage (`/`) only — graveyard page is a separate task.

---

## Problem

The homepage hero section has four distinct mobile breakdowns:

1. **Headline overflow** — `text-4xl` counter + inline `… and counting.` span overflow on 375px screens. The text either clips or wraps mid-phrase in an ugly way.
2. **No touch interaction on particles** — `ParticleField` only listens to `mousemove`. On mobile, floating startup names are purely decorative — users can't tap them to see details.
3. **Tag pills too small to tap** — current pills are `px-2 py-0.5` (~16px tall), below iOS/Android's 44px recommended tap target.
4. **Browse link invisible** — `text-gray-500 text-sm` underlined text is hard to see and too small to reliably tap.

---

## Design Decisions

### 1. Hero — Big Number Layout (Option B)

Split the counter block into stacked elements with a clear size hierarchy:

```
[64px bold]  258
[11px caps]  STARTUPS FAILED & COUNTING

[26px bold]  ₹78,116 Cr
[10px caps]  BURNED
```

- The raw number at `text-6xl font-extrabold` is the visual anchor on mobile.
- "startups failed & counting" moves to a small uppercase label below the number — no longer inline with the counter.
- Burned amount gets its own block below with a slightly smaller size.
- On `sm:` and above, the existing layout (`text-4xl md:text-6xl` with inline suffix) is preserved unchanged.

### 2. Particle Touch Interaction

Add `touchstart` event listener to the canvas in `ParticleField.tsx`.

**Behaviour:**
- User taps anywhere on the canvas.
- Find the nearest particle within a 40px radius of the tap point (same hitbox logic as the existing mouse hover, using `textWidth / 2 + 10` threshold but relaxed to 40px minimum for touch).
- Show the same tooltip React state that the hover path already drives (`setTooltip`).
- Auto-dismiss after **2 seconds** via `setTimeout`. Tapping a second particle while one tooltip is open resets the timer.
- A small hint label — `✦ tap any name to see details` — appears at the bottom of the screen on mobile only (hidden on `sm:`).

No changes to mouse hover behaviour on desktop.

### 3. Tag Pills — Larger Touch Targets

Update `.tag-pill` in `globals.css` and the tag `<button>` elements in `HomepageClient.tsx`:

- Padding: `px-2 py-0.5` → `px-3 py-1.5` (gives ~32px height)
- Add `min-h-[36px]` to the button to guarantee a minimum tap area.
- Font size bumped from `text-xs` (12px) to `text-sm` (14px) — more readable at a glance.

The activated (selected) style stays the same.

### 4. Browse Link → Button

Replace the anchor tag styling from a faint underlined link to a proper outlined button:

- Background: `rgba(160,100,255,0.12)`
- Border: `1px solid rgba(180,125,255,0.25)`
- Text: `#b47dff`, `font-medium`
- Min-height: `44px` (iOS standard)
- Rounded corners: `rounded-xl`
- On `sm:` and above, the link reverts to the existing subtle underlined style.

---

## Files to Change

| File | Change |
|------|--------|
| `components/HomepageClient.tsx` | Restructure hero `<h1>` into stacked divs with mobile-specific Tailwind classes; update tag pill buttons; update browse link to button on mobile |
| `components/ParticleField.tsx` | Add `touchstart` handler; add auto-dismiss timeout; add tap-hint label (hidden on `sm:`) |
| `app/globals.css` | Bump `.tag-pill` padding and font-size |

---

## What Is Not Changing

- Desktop layout — zero changes above `sm:` breakpoint.
- Graveyard page (`/graveyard`) — separate task.
- ParticleField canvas rendering, animation loop, mouse hover logic.
- Nav bar — already works fine on mobile.
- LiveCounter animation component — only its wrapper layout changes.
