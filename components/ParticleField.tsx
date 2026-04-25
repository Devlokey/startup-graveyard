'use client'

import { useEffect, useRef, useState } from 'react'
import type { StartupParticle } from '../lib/types'

interface Particle {
  startup: StartupParticle
  x: number
  y: number
  vx: number
  vy: number
  depth: number
  fontSize: number
  textWidth: number
}

interface TooltipState {
  startup: StartupParticle
  x: number
  y: number
}

interface ParticleFieldProps {
  startups: StartupParticle[]
  searchQuery: string
  activeTags: string[]
}

/** Exported for unit testing. Returns every 3rd startup on mobile to reduce particle density. */
export function getMobileParticles(startups: StartupParticle[], isMobile: boolean): StartupParticle[] {
  return isMobile ? startups.filter((_, i) => i % 3 === 0) : startups
}

export default function ParticleField({ startups, searchQuery, activeTags }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const scrollRef = useRef(0)
  const animFrameRef = useRef<number>(0)
  const touchDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchActiveRef = useRef(false)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const prevTooltipIdRef = useRef<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const DEPTHS = [0.3, 0.6, 1.0]

    const mobileStartups = getMobileParticles(startups, window.innerWidth < 640)

    particlesRef.current = mobileStartups.map((startup) => {
      const depth = DEPTHS[Math.floor(Math.random() * 3)]
      const fontSize = Math.round(10 + depth * 5)
      ctx.font = `${fontSize}px Inter, system-ui, sans-serif`
      return {
        startup,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        depth,
        fontSize,
        textWidth: ctx.measureText(startup.name).width,
      }
    })
  }, [startups])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const MOUSE_RADIUS = 120
    const REPULSION = 2.5

    let pendingTooltip: TooltipState | null = null

    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const scrollY = scrollRef.current
      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      pendingTooltip = null

      for (const p of particlesRef.current) {
        const parallaxOffset = scrollY * (1 - p.depth) * 0.4
        const drawY = p.y - parallaxOffset

        const dx = p.x - mx
        const dy = drawY - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * REPULSION * 0.04
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        p.vx *= 0.97
        p.vy *= 0.97
        p.x += p.vx
        p.y += p.vy

        if (p.x < -150) p.x = canvas.width + 150
        if (p.x > canvas.width + 150) p.x = -150
        if (p.y < -100) p.y = canvas.height + 100
        if (p.y > canvas.height + 100) p.y = -100

        const tagMatch =
          activeTags.length === 0 ||
          (p.startup.failure_tag != null && activeTags.includes(p.startup.failure_tag))
        const searchMatch =
          searchQuery === '' ||
          p.startup.name.toLowerCase().includes(searchQuery.toLowerCase())
        const visible = tagMatch && searchMatch

        const hx = p.x - mx
        const hy = (p.y - parallaxOffset) - my
        const hDist = Math.sqrt(hx * hx + hy * hy)
        const isHovered = hDist < p.textWidth / 2 + 10

        if (isHovered) {
          pendingTooltip = { startup: p.startup, x: p.x, y: p.y - parallaxOffset }
        }

        ctx.save()
        ctx.font = `${isHovered ? p.fontSize * 1.15 : p.fontSize}px Inter, system-ui, sans-serif`

        if (!visible) {
          ctx.globalAlpha = 0.08
          ctx.fillStyle = 'rgba(200, 180, 255, 1)'
        } else if (isHovered) {
          ctx.globalAlpha = 1
          ctx.fillStyle = '#d4aaff'
          ctx.shadowBlur = 18
          ctx.shadowColor = 'rgba(180, 100, 255, 0.9)'
        } else if (searchQuery !== '' && searchMatch) {
          ctx.globalAlpha = 1
          ctx.fillStyle = '#b47dff'
          ctx.shadowBlur = 10
          ctx.shadowColor = 'rgba(160, 80, 255, 0.7)'
        } else {
          ctx.globalAlpha = 0.55 * p.depth
          ctx.fillStyle = 'rgba(200, 180, 255, 1)'
        }

        ctx.fillText(p.startup.name, p.x, p.y - parallaxOffset)
        ctx.restore()
      }

      const newId = pendingTooltip?.startup.id ?? null
      if (newId !== null) {
        // Mouse is hovering something — take over from any active touch
        if (newId !== prevTooltipIdRef.current) {
          prevTooltipIdRef.current = newId
          touchActiveRef.current = false
          setTooltip(pendingTooltip)
        }
      } else if (!touchActiveRef.current) {
        // Nothing hovered and no touch active — clear tooltip
        if (prevTooltipIdRef.current !== null) {
          prevTooltipIdRef.current = null
          setTooltip(null)
        }
      }
      animFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    const onScroll = () => {
      scrollRef.current = window.scrollY
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('scroll', onScroll)

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return
      const tx = touch.clientX
      const ty = touch.clientY
      const scrollY = scrollRef.current

      let closest: TooltipState | null = null
      let closestDist = 40 // px radius — relaxed for fat-finger tolerance

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
        touchActiveRef.current = true
        setTooltip(closest)
        touchDismissRef.current = setTimeout(() => {
          setTooltip(null)
          prevTooltipIdRef.current = null
          touchActiveRef.current = false
        }, 2000)
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchstart', onTouchStart)
      touchActiveRef.current = false
      if (touchDismissRef.current) clearTimeout(touchDismissRef.current)
    }
  }, [searchQuery, activeTags])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />
      {tooltip && (
        <div
          className="fixed pointer-events-none"
          style={{ left: tooltip.x + 14, top: tooltip.y - 70, zIndex: 100 }}
        >
          <div className="glass-card px-3 py-2 min-w-[160px]">
            <p className="font-semibold text-white text-sm leading-tight">{tooltip.startup.name}</p>
            {tooltip.startup.sector && (
              <p className="text-purple-300 text-xs mt-0.5">{tooltip.startup.sector}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {tooltip.startup.founded_year ?? '?'} → {tooltip.startup.shutdown_date?.slice(0, 4) ?? '?'}
            </p>
            {tooltip.startup.failure_tag && (
              <span className="tag-pill mt-1.5 inline-block">{tooltip.startup.failure_tag}</span>
            )}
          </div>
        </div>
      )}
      <p
        data-testid="tap-hint"
        className="fixed bottom-6 left-0 right-0 text-center text-[10px] text-purple-400/40 pointer-events-none sm:hidden"
        style={{ zIndex: 100 }}
      >
        ✦ tap any name to see details
      </p>
    </>
  )
}
