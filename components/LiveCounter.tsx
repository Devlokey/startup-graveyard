'use client'

import { useEffect, useRef, useState } from 'react'

interface LiveCounterProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export default function LiveCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 2000,
  className = '',
}: LiveCounterProps) {
  const [displayed, setDisplayed] = useState(0)
  const frameRef = useRef<number>(0)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const startValue = 0
    startTimeRef.current = null

    function animate(timestamp: number) {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.floor(startValue + (value - startValue) * eased))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value, duration])

  return (
    <span data-testid="live-counter" className={className}>
      {prefix}
      {displayed.toLocaleString('en-IN')}
      {suffix}
    </span>
  )
}
