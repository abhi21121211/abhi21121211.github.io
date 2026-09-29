import { useRef } from 'react'
import { light } from '../data/content'
import { gsap } from '../lib/lenis'
import { useGsap } from '../hooks/useGsap'

/**
 * The headline achievement, given a whole screen. Pinned for ~2 screens of
 * scroll: an odometer rolls 6 → 1, six "day" blocks collapse to one, and the
 * caption swaps from the problem to the result.
 */
export default function Days() {
  const root = useRef<HTMLElement>(null)

  useGsap(root, () => {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
    })
    // Odometer: strip holds 6,5,4,3,2,1 — roll up five steps.
    tl.to('.days-strip', { yPercent: (-5 / 6) * 100, duration: 0.6, ease: 'power1.inOut' }, 0.1)
      .to('.days-block:not(:first-child)', { opacity: 0, scale: 0.6, width: 0, marginLeft: 0, duration: 0.5, stagger: { each: 0.08, from: 'end' } }, 0.1)
      .to('.days-first', { backgroundColor: '#f5a524', color: '#1d1d1f', duration: 0.1 }, 0.62)
      .to('.days-s', { opacity: 0, width: 0, duration: 0.08 }, 0.62)
      .to('.days-before', { opacity: 0, y: -20, duration: 0.12 }, 0.45)
      .fromTo('.days-after', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.12 }, 0.55)
      .to({}, { duration: 0.25 })
  })

  return (
    <section ref={root} className="days" aria-labelledby="days-h">
      <div className="days-stage">
        <p className="eyebrow">IngestIQ · Relevance Lab</p>
        <h2 id="days-h" className="days-number" aria-label="6 days of work, now done in 1 day">
          <span className="days-slot" aria-hidden="true">
            <span className="days-strip">
              {[6, 5, 4, 3, 2, 1].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
          <span className="days-word" aria-hidden="true">
            {' '}
            day<span className="days-s">s</span>
          </span>
        </h2>
        <p className="days-static" aria-hidden="true">
          6 days → 1 day
        </p>

        <ol className="days-blocks" aria-hidden="true">
          {[1, 2, 3, 4, 5, 6].map((d) => (
            <li key={d} className={`days-block${d === 1 ? ' days-first' : ''}`}>
              Day {d}
            </li>
          ))}
        </ol>

        <div className="days-captions">
          <p className="days-before">{light.days.before}</p>
          <p className="days-after">{light.days.after}</p>
        </div>
      </div>
    </section>
  )
}
