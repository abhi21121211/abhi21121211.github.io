import { useRef } from 'react'
import { gsap } from '../../lib/lenis'
import { useGsap } from '../../hooks/useGsap'
import type { Rich } from '../../data/content'

/** Words light up one by one as the paragraph scrolls through the viewport. */
export default function ScrubText({ parts, className = '' }: { parts: Rich; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  useGsap(ref, () => {
    gsap.fromTo(
      ref.current!.querySelectorAll('.sw'),
      // From the muted text color (still ≥4.5:1 contrast) up to full white.
      { color: '#80869a' },
      { color: '#ffffff', ease: 'none', stagger: 0.1, scrollTrigger: { trigger: ref.current, start: 'top 82%', end: 'bottom 50%', scrub: 0.6 } },
    )
  })
  let k = 0
  return (
    <p ref={ref} className={`scrub ${className}`}>
      {parts.map((p, i) => (
        <span key={i} className={p.hl ? 'scrub-hl' : undefined}>
          {p.t.split(/(\s+)/).map((w) => (/^\s+$/.test(w) || !w ? w : <span className="sw" key={k++}>{w}</span>))}
        </span>
      ))}
    </p>
  )
}
