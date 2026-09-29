import { useRef } from 'react'
import { light, projects, type Project } from '../data/content'
import { gsap } from '../lib/lenis'
import { useGsap } from '../hooks/useGsap'
import Reveal from '../components/Reveal'

/**
 * Bento grid. Tile variants:
 * - hero     (first project): wide, text + screenshot
 * - research: wide black tile with a 2×2 grid of headline results
 * - app mock: built-in UI illustration instead of a screenshot
 * - default / client: text + screenshot
 */
export default function Projects() {
  return (
    <section id="projects" className="band band-white" aria-labelledby="projects-h">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">{light.projects.eyebrow}</p>
          <h2 id="projects-h" className="h-section">
            <span className="tone-2">Things</span> I’ve built.
          </h2>
        </Reveal>

        <Reveal as="ul" className="pgrid" stagger={0.1} y={60}>
          {projects.featured.map((p, i) => (
            <Tile key={p.name} p={p} hero={i === 0} />
          ))}
        </Reveal>

        <Reveal className="archive">
          <span>Earlier learning projects:</span>{' '}
          {projects.archive.map((a, i) => (
            <span key={a.name}>
              {i > 0 && ', '}
              <a href={a.href} target="_blank" rel="noopener noreferrer">
                {a.name}
              </a>
            </span>
          ))}
          .
        </Reveal>
      </div>
    </section>
  )
}

function Tile({ p, hero }: { p: Project; hero: boolean }) {
  const dark = p.kind === 'research'
  const cls = ['ptile', hero && 'ptile-hero', dark && 'ptile-research ptile-dark', p.kind === 'client' && 'ptile-client', p.mock && 'ptile-mock'].filter(Boolean).join(' ')

  return (
    <li className={cls}>
      <div className="ptile-text">
        <p className="ptile-tag">
          {p.kind === 'client' && <span className="ptile-badge">Client work</span>}
          {p.tagline.replace(/^Client work · /, '')}
        </p>
        <h3 className="ptile-name">{p.name}</h3>
        {p.highlight ? (
          <p className="ptile-stat">
            <span className="accent">{p.highlight.split(' ')[0]}</span> {p.highlight.split(' ').slice(1).join(' ')}
          </p>
        ) : (
          <p className="ptile-desc">{p.desc}</p>
        )}
        {p.extra && <p className="ptile-extra">{p.extra}</p>}
        {!hero && (
          <p className="ptile-tech">
            <span>Built with</span> {p.tech.join(' · ')}
          </p>
        )}
        {p.links.length > 0 && (
          <div className="ptile-links">
            {p.links.map((l) => (
              <a key={l.href} className={`link-chevron${dark ? ' link-light' : ''}`} href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label}
                <span className="sr-only"> — {p.name} (opens in new tab)</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {p.stats ? (
        <ul className="rstats">
          {p.stats.map((s) => (
            <li key={s.v}>
              <span className="rstat-v">{s.v}</span>
              <span className="rstat-l">{s.l}</span>
            </li>
          ))}
        </ul>
      ) : p.mock === 'voice-transaction' ? (
        <VoiceMock />
      ) : p.image ? (
        <div className="ptile-media">
          <img src={p.image} alt={p.imageAlt ?? ''} loading="lazy" decoding="async" />
        </div>
      ) : null}
    </li>
  )
}

/**
 * Nivesh AI's core idea in one glance: a spoken sentence becomes a filed
 * transaction. Plays once when it scrolls into view. Illustrative UI.
 */
function VoiceMock() {
  const ref = useRef<HTMLDivElement>(null)
  useGsap(ref, () => {
    gsap
      .timeline({ scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true } })
      .from('.vm-bubble', { y: 20, opacity: 0, scale: 0.9, transformOrigin: '100% 100%', duration: 0.6, ease: 'back.out(1.6)' })
      .from('.vm-wave i', { scaleY: 0.2, duration: 0.3, stagger: { each: 0.04, repeat: 3, yoyo: true } }, 0.1)
      .from('.vm-typing', { opacity: 0, duration: 0.3 }, 0.9)
      .to('.vm-typing', { opacity: 0, duration: 0.2 }, 1.7)
      .from('.vm-card', { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out' }, 1.8)
      .from('.vm-card-row', { x: -12, opacity: 0, duration: 0.4, stagger: 0.08 }, 2.1)
      .from('.vm-check', { scale: 0, duration: 0.4, ease: 'back.out(2)' }, 2.3)
  })
  return (
    <div ref={ref} className="vmock" aria-hidden="true">
      <div className="vm-bubble">
        <span className="vm-wave">
          {[0, 1, 2, 3, 4].map((k) => (
            <i key={k} />
          ))}
        </span>
        “spent 450 on groceries”
      </div>
      <div className="vm-typing">
        <i />
        <i />
        <i />
      </div>
      <div className="vm-card">
        <p className="vm-card-head">
          <span className="vm-check">✓</span> Transaction added
        </p>
        <p className="vm-card-row">
          <span>Category</span>
          <b>Groceries</b>
        </p>
        <p className="vm-card-row">
          <span>Amount</span>
          <b>₹450</b>
        </p>
        <p className="vm-card-row">
          <span>Type</span>
          <b>Expense</b>
        </p>
      </div>
    </div>
  )
}
