# Homepage Mobile UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the homepage hero section on mobile — big-number layout, touch-interactive particle field, larger tag pill tap targets, and a proper browse button.

**Architecture:** All changes are mobile-only via Tailwind `sm:` breakpoints and touch event listeners. Desktop behaviour is untouched. Two components change: `HomepageClient.tsx` (layout + tag pills + browse button) and `ParticleField.tsx` (touch handler + tap hint). No new files.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS v3, React 18, Vitest + happy-dom + @testing-library/react

---

## File Map

| File | What changes |
|------|-------------|
| `components/HomepageClient.tsx` | Hero split into mobile/desktop blocks; tag pill classes; browse link → button |
| `components/ParticleField.tsx` | `touchstart` handler; auto-dismiss timeout; tap hint `<p>` element |
| `__tests__/components/HomepageClient.test.tsx` | New test file |
| `__tests__/components/ParticleField.test.tsx` | New test file |

Run tests at any time: `npm test`  
Expected baseline: 2 existing LiveCounter tests pass.

---

## Task 1: Mobile hero stat block

**Files:**
- Create: `__tests__/components/HomepageClient.test.tsx`
- Modify: `components/HomepageClient.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/HomepageClient.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HomepageClient from '../../components/HomepageClient'

// ParticleField accesses canvas and window.innerWidth — mock to avoid jsdom errors
vi.mock('../../components/ParticleField', () => ({
  default: () => null,
}))

const mockStats = { total_dead: 258, total_burned_crore: 78116 }
const mockStartups: never[] = []

describe('HomepageClient', () => {
  it('renders mobile dead-count stat block', () => {
    render(<HomepageClient startups={mockStartups} stats={mockStats} />)
    expect(screen.getByTestId('mobile-dead-count')).toBeInTheDocument()
  })

  it('renders mobile burned-count stat block', () => {
    render(<HomepageClient startups={mockStartups} stats={mockStats} />)
    expect(screen.getByTestId('mobile-burned-count')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test
```

Expected: `Cannot find element by data-testid="mobile-dead-count"` (×2 failures)

- [ ] **Step 3: Replace the hero block in HomepageClient.tsx**

Open `components/HomepageClient.tsx`. Find and replace the single `<div className="mb-8 space-y-2">` block (lines 34–52) with this mobile + desktop split:

```tsx
{/* Mobile hero: big number stacked layout */}
<div className="md:hidden mb-6 text-center space-y-1">
  <div
    className="text-6xl font-extrabold leading-none tracking-tight"
    data-testid="mobile-dead-count"
  >
    <LiveCounter value={stats.total_dead} className="neon-text" duration={2500} />
  </div>
  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[rgba(200,180,255,0.45)]">
    startups failed &amp; counting
  </p>
  <div
    className="mt-3 text-[26px] font-bold leading-none text-white"
    data-testid="mobile-burned-count"
  >
    <LiveCounter value={stats.total_burned_crore} prefix="₹" suffix=" Cr" duration={2500} />
  </div>
  <p className="text-[10px] uppercase tracking-[0.2em] text-[rgba(200,180,255,0.35)]">
    burned
  </p>
</div>

{/* Desktop hero: existing layout — untouched */}
<div className="hidden md:block mb-8 space-y-2">
  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
    <LiveCounter
      value={stats.total_dead}
      suffix=" startups failed"
      className="neon-text"
      duration={2500}
    />
    <span className="text-gray-500 text-2xl ml-2">… and counting.</span>
  </h1>
  <p className="text-2xl md:text-3xl text-gray-400">
    <LiveCounter
      value={stats.total_burned_crore}
      prefix="₹"
      suffix=" Cr burned"
      duration={2500}
    />
  </p>
</div>
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test
```

Expected: 4 tests pass (2 LiveCounter + 2 new HomepageClient)

- [ ] **Step 5: Commit**

```bash
git add components/HomepageClient.tsx __tests__/components/HomepageClient.test.tsx
git commit -m "feat(mobile): big-number hero layout for mobile"
```

---

## Task 2: Larger tag pill touch targets

**Files:**
- Modify: `__tests__/components/HomepageClient.test.tsx`
- Modify: `components/HomepageClient.tsx`

- [ ] **Step 1: Add the failing test**

Append inside the `describe('HomepageClient', ...)` block in `__tests__/components/HomepageClient.test.tsx`:

```tsx
  it('renders tag pill buttons with min-h-[36px] for touch targets', () => {
    render(<HomepageClient startups={mockStartups} stats={mockStats} />)
    const pills = screen.getAllByRole('button')
    expect(pills.length).toBe(4) // Overfunded, Too Early, Bad Product, Market Shift
    pills.forEach((pill) => {
      expect(pill.className).toContain('min-h-[36px]')
    })
  })
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test
```

Expected: `expect(received).toContain("min-h-[36px]")` fails for all 4 pills.

- [ ] **Step 3: Update tag pill buttons in HomepageClient.tsx**

Find the `<button>` inside the `{ALL_TAGS.map(...)}` in `components/HomepageClient.tsx`. It currently reads:

```tsx
className={`tag-pill cursor-pointer transition-all ${
```

Replace with:

```tsx
className={`tag-pill py-1.5 px-3 text-sm min-h-[36px] cursor-pointer transition-all ${
```

(The `py-1.5 px-3 text-sm` Tailwind utilities override `.tag-pill`'s `@apply px-2 py-0.5 text-xs` because utilities layer wins over components layer in Tailwind v3.)

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/HomepageClient.tsx __tests__/components/HomepageClient.test.tsx
git commit -m "feat(mobile): larger tag pill touch targets (36px min-height)"
```

---

## Task 3: Browse link → tappable button on mobile

**Files:**
- Modify: `__tests__/components/HomepageClient.test.tsx`
- Modify: `components/HomepageClient.tsx`

- [ ] **Step 1: Add the failing test**

Append inside the `describe('HomepageClient', ...)` block:

```tsx
  it('renders browse link with 44px min-height for iOS tap target', () => {
    render(<HomepageClient startups={mockStartups} stats={mockStats} />)
    const link = screen.getByRole('link', { name: /browse all startups/i })
    expect(link.className).toContain('min-h-[44px]')
  })
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test
```

Expected: `Cannot find text matching /browse all startups/i` or `min-h-[44px]` not in className.

- [ ] **Step 3: Update the browse anchor in HomepageClient.tsx**

Find the `<a href="/graveyard" ...>` near the bottom of the component. Replace its `className` entirely:

```tsx
<a
  href="/graveyard"
  className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-xl font-medium transition-colors bg-purple-900/20 border border-purple-500/25 text-purple-400 hover:bg-purple-900/30 hover:border-purple-400/40 sm:bg-transparent sm:border-0 sm:min-h-0 sm:rounded-none sm:px-0 sm:text-sm sm:text-gray-500 sm:hover:text-purple-300 sm:underline sm:underline-offset-4"
>
  Browse all startups →
</a>
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test
```

Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/HomepageClient.tsx __tests__/components/HomepageClient.test.tsx
git commit -m "feat(mobile): browse link becomes tappable button on mobile"
```

---

## Task 4: Touch interaction + tap hint in ParticleField

**Files:**
- Create: `__tests__/components/ParticleField.test.tsx`
- Modify: `components/ParticleField.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/components/ParticleField.test.tsx`:

```tsx
// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ParticleField from '../../components/ParticleField'

describe('ParticleField', () => {
  it('renders tap hint label for mobile users', () => {
    render(<ParticleField startups={[]} searchQuery="" activeTags={[]} />)
    expect(screen.getByTestId('tap-hint')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test
```

Expected: `Unable to find an element by: [data-testid="tap-hint"]`

- [ ] **Step 3: Add touchDismissRef and touchstart handler to ParticleField.tsx**

Open `components/ParticleField.tsx`.

**3a.** Add `touchDismissRef` alongside the other refs (after `animFrameRef`):

```tsx
const touchDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null)
```

**3b.** Inside the second `useEffect` (the draw/event loop), after the `onScroll` listener definition and before `return () => {`, add:

```tsx
const onTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0]
  if (!touch) return
  const tx = touch.clientX
  const ty = touch.clientY
  const scrollY = scrollRef.current

  let closest: TooltipState | null = null
  let closestDist = 40 // px radius — relaxed vs mouse hover for fat-finger tolerance

  for (const p of particlesRef.current) {
    const parallaxOffset = scrollY * (1 - p.depth) * 0.4
    const drawY = p.y - parallaxOffset
    const dx = p.x - tx
    const dy = drawY - ty
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < closestDist) {
      closestDist = dist
      closest = { startup: p.startup, x: p.x, y: drawY }
    }
  }

  if (closest) {
    if (touchDismissRef.current) clearTimeout(touchDismissRef.current)
    prevTooltipIdRef.current = closest.startup.id
    setTooltip(closest)
    touchDismissRef.current = setTimeout(() => {
      setTooltip(null)
      prevTooltipIdRef.current = null
    }, 2000)
  }
}

canvas.addEventListener('touchstart', onTouchStart, { passive: true })
```

**3c.** Inside the existing `return () => {` cleanup block at the end of that useEffect, add:

```tsx
canvas.removeEventListener('touchstart', onTouchStart)
if (touchDismissRef.current) clearTimeout(touchDismissRef.current)
```

- [ ] **Step 4: Add the tap hint element to the JSX return**

In `components/ParticleField.tsx`, in the `return (...)`, after the tooltip `<div>` (and before the closing `</>`), add:

```tsx
<p
  data-testid="tap-hint"
  className="fixed bottom-6 left-0 right-0 text-center text-[10px] text-purple-400/40 pointer-events-none sm:hidden"
  style={{ zIndex: 100 }}
>
  ✦ tap any name to see details
</p>
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test
```

Expected: 7 tests pass (2 LiveCounter + 4 HomepageClient + 1 ParticleField)

- [ ] **Step 6: Commit**

```bash
git add components/ParticleField.tsx __tests__/components/ParticleField.test.tsx
git commit -m "feat(mobile): touch-to-tooltip on particle field with auto-dismiss"
```

---

## Task 5: Deploy and verify

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: 7 tests pass, 0 failures.

- [ ] **Step 2: Build check**

```bash
npm run build
```

Expected: no TypeScript errors, no build failures.

- [ ] **Step 3: Deploy to production**

```bash
cd "C:\Users\Amal\OneDrive\Desktop\startup-graveyard" && npx vercel --prod --yes
```

- [ ] **Step 4: Verify on a real device**

Open `https://startup-graveyard-mocha.vercel.app` on a phone and confirm:
- Counter shows large number with small label (not overflowing)
- Tapping a floating startup name shows tooltip, auto-dismisses in 2s
- Tag pills are comfortably tappable
- "Browse all startups" shows as a button, not a grey link
- On desktop (≥ 640px) everything looks identical to before
