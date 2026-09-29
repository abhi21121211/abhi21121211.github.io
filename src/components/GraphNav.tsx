import { useEffect, useRef, useState } from 'react'
import { stations } from '../data/content'
import { onActiveStation, scrollState } from '../lib/scrollState'
import { scrollToTarget } from '../lib/lenis'

/** Right-hand mini graph: one dot per node, the travelled edge fills as you scroll. */
export default function GraphNav() {
  const [active, setActive] = useState(0)
  const fill = useRef<HTMLDivElement>(null)

  useEffect(() => onActiveStation(setActive), [])
  useEffect(() => {
    let raf = 0
    const loop = () => {
      if (fill.current) fill.current.style.transform = `scaleY(${scrollState.station / (stations.length - 1)})`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <nav className="graph-nav" aria-label="Sections">
      <div className="graph-nav-edge" aria-hidden="true">
        <div ref={fill} className="graph-nav-fill" />
      </div>
      <ol>
        {stations.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={`graph-nav-node${i === active ? ' is-active' : ''}${i < active ? ' is-done' : ''}`}
              aria-current={i === active ? 'location' : undefined}
              onClick={() => scrollToTarget(s.id)}
            >
              <span className="graph-nav-label mono">
                {s.node} / {s.label}
              </span>
              <span className="graph-nav-dot" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
