import { useEffect, useRef, useState } from 'react'
import { hasFinePointer, prefersReducedMotion } from '../lib/env'

/** Dot + trailing ring. Ring grows over links, turns amber over buttons. */
export default function Cursor() {
  const [enabled] = useState(() => hasFinePointer() && !prefersReducedMotion())
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('has-cursor')
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      const t = (e.target as Element | null)?.closest?.('a, button, [role="tab"], [data-cursor], [data-cursor-label]')
      const r = ring.current
      if (!r) return
      const label = t?.getAttribute('data-cursor-label')
      r.classList.toggle('is-label', !!label)
      if (label && r.textContent !== label) r.textContent = label
      if (!label) r.textContent = ''
      const isButton = !!t && (t.tagName === 'BUTTON' || t.classList.contains('btn'))
      r.classList.toggle('is-link', !!t && !isButton && !label)
      r.classList.toggle('is-button', isButton && !label)
    }
    const down = () => ring.current?.classList.add('is-down')
    const up = () => ring.current?.classList.remove('is-down')
    const out = () => {
      x = y = -100
    }
    const loop = () => {
      rx += (x - rx) * 0.2
      ry += (y - ry) * 0.2
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.addEventListener('pointerleave', out)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.removeEventListener('pointerleave', out)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
