import { useRef } from 'react'
import { gsap, ScrollTrigger } from '../../lib/lenis'
import { useGsap } from '../../hooks/useGsap'

/** Endless band that speeds up and reverses with scroll velocity. */
export default function Marquee({ items }: { items: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useGsap(ref, () => {
    const track = ref.current!.querySelector('.mq-track')
    const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 })
    let dir = 1
    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        dir = self.direction
        const boost = Math.min(Math.abs(self.getVelocity()) / 300, 6)
        gsap.to(loop, {
          timeScale: dir * (1 + boost),
          duration: 0.25,
          overwrite: true,
          onComplete: () => void gsap.to(loop, { timeScale: dir, duration: 1.4, ease: 'power2.out' }),
        })
      },
    })
  })
  const row = items.map((t, i) => (
    <span className="mq-item" key={i}>
      {t}
      <i aria-hidden="true" />
    </span>
  ))
  return (
    <div ref={ref} className="marquee" aria-label={items.join(', ')} role="img">
      <div className="mq-track" aria-hidden="true">
        {row}
        {row}
      </div>
    </div>
  )
}
