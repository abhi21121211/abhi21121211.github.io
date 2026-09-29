import { useRef } from 'react'
import { gsap } from '../../lib/lenis'
import { useGsap } from '../../hooks/useGsap'

/** Hairline that draws itself from the left when it enters. */
export default function Rule({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useGsap(ref, () => {
    gsap.from(ref.current, { scaleX: 0, transformOrigin: 'left', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: ref.current, start: 'top 92%', once: true } })
  })
  return <div ref={ref} className={`rule ${className}`} aria-hidden="true" />
}
