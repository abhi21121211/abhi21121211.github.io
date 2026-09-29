import { useEffect, useRef } from 'react'
import { skills } from '../data/content'
import { prefersReducedMotion } from '../lib/env'

type Props = { active: number; onHover: (i: number | null) => void; paused: boolean }

const R = 165
const PERSPECTIVE = 700
const clusters = skills.clusters

/**
 * Four skill clusters orbiting a tilted ring. Projection is done in JS
 * (one transform per cluster per frame), so text stays crisp.
 * Decorative — the accessible version is the tab panel beside it.
 */
export default function Constellation({ active, onHover, paused }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const items = useRef<(HTMLDivElement | null)[]>([])
  const angle = useRef(0)
  const state = useRef({ active, paused })
  state.current = { active, paused }

  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduced = prefersReducedMotion()
    let raf = 0
    let visible = false
    let last = performance.now()
    const step = (Math.PI * 2) / clusters.length

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const { active, paused } = state.current
      if (paused || reduced) {
        // Bring the selected cluster to the front along the shortest arc.
        const target = -active * step
        let d = target - angle.current
        d = Math.atan2(Math.sin(d), Math.cos(d))
        angle.current += reduced ? d : d * Math.min(1, dt * 4)
      } else angle.current += dt * 0.18

      clusters.forEach((_, i) => {
        const node = items.current[i]
        if (!node) return
        const a = i * step + angle.current
        const x = Math.sin(a) * R * 1.15
        const z = Math.cos(a) * R + (i === active ? 60 : 0)
        const y = -Math.cos(a) * R * 0.22
        const s = PERSPECTIVE / (PERSPECTIVE - z)
        node.style.transform = `translate(-50%, -50%) translate3d(${x * s}px, ${y * s}px, 0) scale(${s * (i === active ? 1.08 : 0.92)})`
        node.style.opacity = String(0.25 + 0.75 * ((Math.cos(a) + 1) / 2) ** 1.4)
        node.style.zIndex = String(Math.round(z + 1000))
      })
      if (visible) raf = requestAnimationFrame(frame)
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(raf)
      if (visible) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    })
    io.observe(el)
    frame(performance.now())
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="constellation" ref={root} aria-hidden="true">
      <div className="constellation-ring" />
      {clusters.map((c, i) => {
        const n = c.items.length
        return (
          <div
            key={c.id}
            ref={(el) => void (items.current[i] = el)}
            className={`cluster cluster-${c.color}${i === active ? ' is-active' : ''}`}
            onPointerEnter={() => onHover(i)}
            onPointerLeave={() => onHover(null)}
          >
            <svg className="cluster-lines" viewBox="-130 -130 260 260">
              {c.items.map((_, k) => {
                const a = (k / n) * Math.PI * 2 - Math.PI / 2
                return <line key={k} x1="0" y1="0" x2={Math.cos(a) * 95} y2={Math.sin(a) * 95} />
              })}
            </svg>
            <span className="cluster-core" />
            <span className="cluster-name">{c.name}</span>
            {c.items.map((s, k) => {
              const a = (k / n) * Math.PI * 2 - Math.PI / 2
              return (
                <span key={s} className="skill-node" style={{ left: `calc(50% + ${Math.cos(a) * 95}px)`, top: `calc(50% + ${Math.sin(a) * 95}px)` }}>
                  <i />
                  <b className={Math.cos(a) < -0.2 ? 'is-left' : ''}>{s.replace(/\s*\(.*\)/, '')}</b>
                </span>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
