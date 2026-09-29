import { useRef } from 'react'
import { hero, site } from '../data/content'
import { gsap, scrollToTarget } from '../lib/lenis'
import { loaderDone } from '../components/Loader'
import { useGsap } from '../hooks/useGsap'
import { useMagnetic } from '../hooks/useMagnetic'
import HeroFigure from '../components/HeroFigure'
import Roll from '../components/anim/Roll'

const [first, last] = ['Abhishek', 'Dukare']

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const work = useMagnetic<HTMLAnchorElement>(0.25)
  const resume = useMagnetic<HTMLAnchorElement>(0.25)

  useGsap(root, () => {
    const chars = gsap.utils.toArray<HTMLElement>('.hero-char')
    const meta = gsap.utils.toArray<HTMLElement>('.hero-meta > *')
    gsap.set(chars, { yPercent: 110 })
    gsap.set(meta, { opacity: 0, y: 14 })
    loaderDone.then(() => {
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .to(chars, { yPercent: 0, duration: 1.4, stagger: 0.045 }, 0.15)
        .to(meta, { opacity: 1, y: 0, duration: 1, stagger: 0.06 }, 0.3)
        .fromTo('.hero-figure', { opacity: 0, y: 60, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1.8 }, 0.1)
        // Slide only — the intro copy is painted from the start (LCP).
        .from('.hero-intro > *', { y: 24, duration: 1.2, stagger: 0.08 }, 0.5)
    })
    // Name drifts apart slightly as you scroll away.
    gsap.to('.hero-first', { xPercent: -6, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to('.hero-last', { xPercent: 6, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
  })

  const split = (word: string, cls: string) => (
    <span className={`hero-line ${cls}`} aria-hidden="true">
      {Array.from(word).map((ch, i) => (
        <span className="hero-mask" key={i}>
          <span className="hero-char">{ch}</span>
        </span>
      ))}
    </span>
  )

  return (
    <section id="start" ref={root} className="section hero" data-station="0" aria-labelledby="hero-name">
      <div className="hero-meta">
        <p className="eyebrow">
          <span className="avail-dot" aria-hidden="true" /> Available · {site.locations.join(' / ')}
        </p>
        <p className="eyebrow hero-meta-right">
          {hero.role} — {hero.roleTags.join(' · ')}
        </p>
      </div>

      <div className="hero-body">
        <div className="hero-intro">
          <p className="hero-kicker">
            <span className="serif">{hero.role}</span>
            <span className="muted"> building agentic AI, LLM applications &amp; RAG.</span>
          </p>
          <p className="hero-sub">{hero.sub}</p>
          <div className="hero-actions">
            <a ref={work} className="btn btn-primary" href="#experience" onClick={(e) => (e.preventDefault(), scrollToTarget('experience'))}>
              <Roll>{hero.cta.work}</Roll>
              <span className="btn-icon" aria-hidden="true">
                ↓
              </span>
            </a>
            <a ref={resume} className="btn btn-ghost" href={site.resume} download>
              <Roll>{hero.cta.resume}</Roll>
            </a>
          </div>
        </div>

        <HeroFigure alt="Abhishek Dukare in a black suit — he turns to follow your cursor" />
      </div>

      <h1 id="hero-name" className="hero-name" aria-label={site.name}>
        {split(first, 'hero-first')}
        {split(last, 'hero-last serif')}
      </h1>

      <div className="scroll-hint" aria-hidden="true">
        <span className="scroll-hint-line" />
        <span>Scroll to enter the graph</span>
      </div>
    </section>
  )
}
