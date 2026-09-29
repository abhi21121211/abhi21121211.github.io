import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../lib/env'

const KEY = 'ad-v4-seen'
const DURATION = 1150

let resolveDone: () => void
/** Resolves when the loader has left (immediately if skipped). */
export const loaderDone = new Promise<void>((r) => (resolveDone = r))

function shouldSkip() {
  try {
    return prefersReducedMotion() || sessionStorage.getItem(KEY) === '1'
  } catch {
    return prefersReducedMotion()
  }
}

/** ≤1.5 s: a node pulses, edges shoot out, % counts up, fades into the hero. */
export default function Loader() {
  const [skip] = useState(shouldSkip)
  const [pct, setPct] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(skip)

  useEffect(() => {
    if (skip) {
      resolveDone()
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / DURATION)
      setPct(Math.round(100 * (1 - Math.pow(1 - p, 2))))
      if (p < 1) raf = requestAnimationFrame(tick)
      else {
        setLeaving(true)
        resolveDone()
        try {
          sessionStorage.setItem(KEY, '1')
        } catch {
          /* private mode */
        }
        setTimeout(() => setGone(true), 350)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [skip])

  if (gone) return null
  const edges = [0, 55, 110, 170, 230, 290]
  return (
    <div className={`loader${leaving ? ' is-leaving' : ''}`} role="presentation">
      <svg viewBox="-100 -100 200 200" className="loader-graph" aria-hidden="true">
        {edges.map((deg, i) => {
          const r = (deg * Math.PI) / 180
          const len = 55 + (i % 3) * 18
          return (
            <g key={deg} style={{ animationDelay: `${120 + i * 70}ms` }} className="loader-edge">
              <line x1="0" y1="0" x2={Math.cos(r) * len} y2={Math.sin(r) * len} pathLength={1} />
              <circle cx={Math.cos(r) * len} cy={Math.sin(r) * len} r="3" />
            </g>
          )
        })}
        <circle className="loader-core" r="7" />
      </svg>
      <p className="loader-pct mono" aria-hidden="true">
        {String(pct).padStart(3, '0')}%
      </p>
    </div>
  )
}
