import { useRef } from 'react'
import { projects, type Project } from '../data/content'
import { gsap } from '../lib/lenis'
import { useGsap } from '../hooks/useGsap'
import { isMobileViewport } from '../lib/env'
import Words from '../components/anim/Words'
import FadeUp from '../components/anim/FadeUp'
import Roll from '../components/anim/Roll'
import Eyebrow from '../components/Eyebrow'
import LoopVideo from '../components/LoopVideo'

export default function Projects() {
  const deck = useRef<HTMLDivElement>(null)

  // Stacking deck: each card pins; the one beneath recedes as the next slides over it.
  useGsap(deck, () => {
    const cards = gsap.utils.toArray<HTMLElement>('.pj-card')
    cards.forEach((card, i) => {
      const next = cards[i + 1]
      const inner = card.querySelector('.pj-inner')
      if (next && !isMobileViewport())
        gsap.to(inner, {
          scale: 0.9,
          opacity: 0.35,
          filter: 'blur(2px)',
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 18%', scrub: true },
        })
      const media = card.querySelector('.pj-media img')
      if (media) gsap.from(media, { scale: 1.3, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'top 20%', scrub: true } })
    })
  })

  return (
    <section id="projects" className="section projects" data-station="5" aria-labelledby="projects-h">
      <Eyebrow index="03" label="Projects" node="node_05" />
      <div className="pj-head">
        <Words id="projects-h" text={projects.heading} className="display" />
        <p className="pj-count eyebrow">
          {String(projects.featured.length).padStart(2, '0')} featured
        </p>
      </div>

      <div className="pj-deck" ref={deck}>
        {projects.featured.map((p, i) => (
          <ProjectSpread key={p.name} project={p} index={i} total={projects.featured.length} />
        ))}
      </div>

      <FadeUp className="archive">
        <h3 className="eyebrow">Archive — early learning projects</h3>
        <ul>
          {projects.archive.map((a) => (
            <li key={a.name}>
              {a.href ? (
                <a className="link" href={a.href} target="_blank" rel="noopener noreferrer">
                  {a.name}
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              ) : (
                a.name
              )}
            </li>
          ))}
        </ul>
      </FadeUp>
    </section>
  )
}

function ProjectSpread({ project: p, index, total }: { project: Project; index: number; total: number }) {
  const primary = p.links[0]
  const media = p.media ? (
    <LoopVideo media={p.media} />
  ) : p.image ? (
    <img src={p.image} alt={p.imageAlt ?? ''} loading="lazy" decoding="async" />
  ) : (
    <PlaceholderArt />
  )
  return (
    <article className="pj-card" style={{ '--i': index } as React.CSSProperties} aria-labelledby={`pj-${index}`}>
      <div className="pj-inner">
        <header className="pj-top">
          <span className="eyebrow">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span className="eyebrow">{p.tagline}</span>
        </header>

        <div className="pj-body">
          {primary ? (
            <a className="pj-media" href={primary.href} target="_blank" rel="noopener noreferrer" data-cursor-label="View ↗" tabIndex={-1} aria-hidden="true">
              {media}
            </a>
          ) : (
            <div className="pj-media">{media}</div>
          )}

          <div className="pj-text">
            <h3 id={`pj-${index}`} className="pj-name">
              {p.name}
            </h3>
            <p className="pj-desc">{p.desc}</p>
            {p.highlight && (
              <p className="pj-highlight">
                <span className="serif">{p.highlight.split(' ')[0]}</span> {p.highlight.split(' ').slice(1).join(' ')}
              </p>
            )}
            <p className="pj-tech eyebrow">{p.tech.join('  ·  ')}</p>
            <div className="pj-links">
              {p.links.map((l, li) => (
                <a key={l.href} className={li === 0 ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'} href={l.href} target="_blank" rel="noopener noreferrer">
                  <Roll>{l.label}</Roll>
                  <span className="btn-icon" aria-hidden="true">
                    ↗
                  </span>
                  <span className="sr-only"> — {p.name} (opens in new tab)</span>
                </a>
              ))}
              {p.pending && <span className="eyebrow">{p.pending}</span>}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function PlaceholderArt() {
  return (
    <div className="pj-placeholder" aria-hidden="true">
      <p className="ph-err">Error: ECONNREFUSED 127.0.0.1:5432</p>
      <p className="ph-arrow">↓</p>
      <p className="ph-ok">Can’t reach the database on port 5432. Is it running?</p>
    </div>
  )
}
