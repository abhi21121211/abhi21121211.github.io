import { setStation } from './scrollState'

/**
 * Maps scrollY → continuous station value.
 * While a section fills the viewport the camera "holds" on its node;
 * between sections it travels along the edge to the next node.
 */
export function initStationTracker() {
  let holds: { start: number; end: number }[] = []

  const measure = () => {
    const vh = window.innerHeight
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-station]'))
    holds = els.map((el, i) => {
      const r = el.getBoundingClientRect()
      const top = r.top + window.scrollY
      const bottom = top + r.height
      const start = i === 0 ? -Infinity : top - vh * 0.3
      const end = Math.max(start, bottom - vh * 0.8)
      return { start, end: i === 0 ? Math.max(0, end) : end }
    })
    update()
  }

  const update = () => {
    const y = window.scrollY
    if (!holds.length) return
    let value = holds.length - 1
    for (let i = 0; i < holds.length; i++) {
      const h = holds[i]
      if (y <= h.end) {
        if (y >= h.start || i === 0) value = i
        else {
          const prev = holds[i - 1]
          const t = (y - prev.end) / Math.max(1, h.start - prev.end)
          value = i - 1 + ease(Math.min(1, Math.max(0, t)))
        }
        break
      }
    }
    setStation(value)
  }

  const ro = new ResizeObserver(measure)
  ro.observe(document.body)
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', measure)
  measure()
  return () => {
    ro.disconnect()
    window.removeEventListener('scroll', update)
    window.removeEventListener('resize', measure)
  }
}

const ease = (t: number) => t * t * (3 - 2 * t)
