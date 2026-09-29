import { useRef } from 'react'
import { gsap } from '../lib/lenis'
import { useGsap } from '../hooks/useGsap'
import type { Rich } from '../data/content'

/** Words go from light grey to near-black as they scroll through the viewport. */
export default function Highlight({ parts, className = '' }: { parts: Rich; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  useGsap(ref, () => {
    const words = ref.current!.querySelectorAll<HTMLElement>('.hw')
    const st = { trigger: ref.current, start: 'top 78%', end: 'bottom 45%', scrub: 0.5 }
    // Two-tone: everything starts grey; key phrases light up to ink, the rest settles one shade darker.
    const tl = gsap.timeline({ scrollTrigger: st })
    words.forEach((w, i) => {
      if (w.classList.contains('hw-hl')) tl.fromTo(w, { color: '#86868b' }, { color: '#1d1d1f', ease: 'none', duration: 1 }, i * 0.08)
      else tl.fromTo(w, { color: '#86868b' }, { color: '#6e6e73', ease: 'none', duration: 1 }, i * 0.08)
    })
  })
  let k = 0
  return (
    <p ref={ref} className={`highlight ${className}`}>
      {parts.map((p, i) =>
        p.t.split(/(\s+)/).map((w) =>
          !w.trim() ? (
            w
          ) : (
            <span key={`${i}-${k++}`} className={p.hl ? 'hw hw-hl' : 'hw'}>
              {w}
            </span>
          ),
        ),
      )}
    </p>
  )
}
