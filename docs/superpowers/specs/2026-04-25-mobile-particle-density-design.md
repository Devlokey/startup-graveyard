# Mobile Particle Density Fix

**Date:** 2026-04-25  
**Scope:** Mobile-only (`canvas.width < 640px`). Desktop is untouched.  
**Pages affected:** Homepage (`/`) only — `ParticleField.tsx`.

---

## Problem

On a 375–390px mobile screen, all 258 startup name particles render simultaneously across the full viewport. This creates:

1. **Dense visual noise** — names overlap each other and the UI elements
2. **UI illegibility** — the counter (258 / ₹78,116 Cr), search bar, tag pills, and browse button all sit on top of a field of competing text
3. **Poor scannability** — no visual hierarchy; particles and UI are indistinguishable in weight

Desktop is unaffected (larger viewport handles 258 names comfortably).

---

## Design Decisions

### 1. Centre Exclusion Zone

In the canvas `draw()` loop, when `canvas.width < 640`, skip drawing any particle whose current Y position falls within the middle 55% of the canvas height — specifically between `canvas.height * 0.22` and `canvas.height * 0.78`.

This keeps the UI area (counter, search, tags, button) visually clear. Particles continue to animate and exist in data — search highlighting and tap-to-tooltip still work for all 258 startups. They are only suppressed from rendering while in the centre zone. When they drift into the top or bottom strip, they appear normally.

No change to opacity, font size, or any other visual property of the particles.

The same exclusion zone check (`drawY < canvas.height * 0.22 || drawY > canvas.height * 0.78`) must also be applied inside `onTouchStart` when `canvas.width < 640` — so a tap in the centre area cannot trigger a tooltip for an invisible particle.

### 2. Mobile Particle Cap

In the first `useEffect` (particle initialisation), when `window.innerWidth < 640`, take every 3rd startup from the array (`startups.filter((_, i) => i % 3 === 0)`), giving ~86 particles instead of 258.

This prevents the top and bottom strips from being overcrowded even when the centre zone is clear. Text stays at full opacity — no dimming.

### 3. Desktop Untouched

Both the cap and the exclusion zone are gated behind `canvas.width < 640` / `window.innerWidth < 640` checks. All 258 particles render across the full canvas on desktop, identical to before.

---

## Files to Change

| File | Change |
|------|--------|
| `components/ParticleField.tsx` | Particle cap in first useEffect; centre exclusion zone check in draw loop |

No other files change. No new files.

---

## What Is Not Changing

- Particle opacity, font size, animation speed, parallax
- Touch tooltip behaviour (all particles remain tappable, even suppressed ones — they just aren't visible while in the centre zone)
- Search highlight behaviour
- Desktop rendering
- Any other component
