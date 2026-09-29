import { useEffect, useState } from 'react'
import { useInView } from '../hooks/useInView'
import { prefersReducedMotion } from '../lib/env'

type Props = { to: number; decimals?: number; suffix?: string; duration?: number }

/** Counts up once when scrolled into view. Final value is rendered for no-JS/reduced motion. */
export default function Counter({ to, decimals = 0, suffix = '', duration = 1600 }: Props) {
  const [ref, inView] = useInView<HTMLSpanElement>()
  const [value, setValue] = useState(to)
  useEffect(() => {
    if (!inView || prefersReducedMotion()) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      setValue(to * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    setValue(0)
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])
  const text = value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return (
    <span ref={ref}>
      <span className="sr-only">
        {to.toLocaleString('en-US')}
        {suffix}
      </span>
      <span aria-hidden="true">
        {text}
        {suffix}
      </span>
    </span>
  )
}
