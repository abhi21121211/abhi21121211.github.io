import { useRef } from 'react'
import { webforgeSection as wf } from '../data/content'
import { gsap } from '../lib/lenis'
import { useGsap } from '../hooks/useGsap'
import Reveal from '../components/Reveal'

/** "Also building" — framed as initiative and proof of shipping, not a second job. */
export default function Webforge() {
  const root = useRef<HTMLElement>(null)
  useGsap(root, () => {
    // Browser window rises and straightens as it enters.
    gsap.fromTo('.wf-window', { y: 120, rotateX: 18, scale: 0.92 }, { y: 0, rotateX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.wf-window', start: 'top bottom', end: 'top 35%', scrub: 0.6 } })
  })
  if (!wf.show) return null
  return (
    <section id="webforge" ref={root} className="band band-white wf" aria-labelledby="wf-h">
      <div className="wrap center">
        <Reveal stagger={0.1}>
          <p className="eyebrow">{wf.eyebrow}</p>
          <h2 id="wf-h" className="h-section">
            {wf.title}
          </h2>
          <p className="wf-line">{wf.line}</p>
          <p className="wf-what">{wf.what}</p>
          <p>
            <a className="link-chevron" href={wf.href} target="_blank" rel="noopener noreferrer">
              Visit webforge.in<span className="sr-only"> (opens in new tab)</span>
            </a>
          </p>
        </Reveal>

        <div className="wf-stage">
          <a className="wf-window" href={wf.href} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
            <div className="wf-chrome">
              <span />
              <span />
              <span />
              <p className="wf-url">webforge.in</p>
            </div>
            <img src={wf.image} alt="" loading="lazy" decoding="async" width={1600} height={667} />
          </a>
        </div>
        <p className="sr-only">{wf.imageAlt}</p>
      </div>
    </section>
  )
}
