import { Fragment, useRef, useState } from 'react'
import { experience, light, type Rich as RichT } from '../data/content'
import { gsap, ScrollTrigger } from '../lib/lenis'
import { useGsap } from '../hooks/useGsap'
import Reveal from '../components/Reveal'
import Rich from '../components/Rich'

type Project = { title: string; note?: string; big: string; small: string; tone: 'dark' | 'light' | 'amber'; points: RichT[]; stack?: string[] }
type Company = {
  id: string
  name: string
  years: string
  role: string
  period: string
  place: string
  about?: string
  /** One headline fact for the cover panel. */
  fact: { big: string; small: string }
  /** Short companies: details live on the cover. */
  points?: RichT[]
  stack?: string[]
  /** Long companies: one slide per project after the cover. */
  projects?: Project[]
}

const [rl, cm, qt] = experience.roles
const side = experience.side
const [ingest, platform, pocs] = rl.blocks

const companies: Company[] = [
  {
    id: 'relevance-lab',
    name: rl.company,
    years: '2026 – Now',
    role: rl.title,
    period: rl.period,
    place: rl.location,
    fact: { big: '3', small: 'projects — IngestIQ, an agent platform, client PoCs' },
    projects: [
      { title: 'IngestIQ — LLM-powered data transformation', note: ingest.note, big: '6 → 1', small: 'days of data mapping', tone: 'amber', points: ingest.points ?? [], stack: ingest.stack },
      { title: 'Multi-tenant AI agent platform', note: platform.note, big: '~30', small: 'MCP connectors · ~150 Rust crates', tone: 'dark', points: platform.points ?? [], stack: platform.stack },
      { title: 'Client PoCs', big: '3', small: 'client proofs of concept', tone: 'light', points: pocs.points ?? [], stack: pocs.stack },
    ],
  },
  {
    id: 'carmatec',
    name: cm.company,
    years: '2025 – 26',
    role: cm.title,
    period: cm.period,
    place: cm.location,
    about: cm.about,
    fact: { big: '2', small: 'products — Pipaan and Babiken' },
    points: cm.blocks[0].points,
    stack: cm.blocks[0].stack,
  },
  {
    id: 'quicktouch',
    name: qt.company,
    years: '2024 – 25',
    role: qt.title,
    period: qt.period,
    place: qt.location,
    about: qt.about,
    fact: { big: '200–250', small: 'schools on QuickCampus' },
    points: qt.blocks[0].points,
    stack: qt.blocks[0].stack,
  },
  {
    id: 'masai',
    name: side.company,
    years: '2023 – 24',
    role: side.title,
    period: side.period,
    place: 'Remote',
    fact: { big: 'Part-time', small: 'technical interviews' },
    points: [[{ t: 'Conducted technical interviews and evaluated students’ skills and knowledge to prepare them for tech industry roles.' }]],
  },
]

// Flatten into slides, remembering which company each belongs to.
type Slide = { company: number; project?: number }
const slides: Slide[] = companies.flatMap((c, ci) => [{ company: ci }, ...(c.projects ?? []).map((_, pi) => ({ company: ci, project: pi }))])
const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Experience. A pinned company bar ("4 companies") stays visible while the
 * slides move sideways: a cover per company (its website + role), then that
 * company's project slides. Phones / reduced motion: grouped vertical stack.
 */
export default function Work() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGsap(root, () => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 834px)', () => {
      const track = root.current!.querySelector<HTMLElement>('.xs-track')!
      const items = Array.from(track.children) as HTMLElement[]
      const distance = () => track.scrollWidth - window.innerWidth
      const stops = () => items.map((el) => Math.min(1, Math.max(0, (el.offsetLeft - items[0].offsetLeft) / Math.max(1, distance()))))
      let s = stops()
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current!.querySelector('.xs-pin'),
          start: 'top top',
          end: () => '+=' + distance(),
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onRefresh: () => {
            s = stops()
          },
          onUpdate: (self) => {
            let i = 0
            s.forEach((stop, k) => {
              if (self.progress + 0.02 >= stop) i = k
            })
            setActive(i)
          },
        },
      })
      gsap.utils.toArray<HTMLElement>('.xs-card').forEach((card) => {
        gsap.from(card.querySelectorAll('.xs-anim'), {
          x: 80,
          opacity: 0,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 85%', end: 'left 45%', scrub: 0.6 },
        })
      })
      return () => ScrollTrigger.refresh()
    })
    return () => mm.revert()
  })

  const cur = slides[active]

  return (
    <section id="work" ref={root} className="band band-grey xs" aria-labelledby="work-h">
      <Reveal className="wrap">
        <p className="eyebrow">{light.work.eyebrow}</p>
        <h2 id="work-h" className="h-section">
          <span className="tone-2">{companies.length} companies.</span> Where I’ve shipped.
        </h2>
      </Reveal>

      <div className="xs-pin">
        {/* Company bar: always shows how many companies, and which one you're on. */}
        <ol className="wrap co-bar" aria-label={`${companies.length} companies`}>
          {companies.map((c, ci) => {
            const n = slides.filter((s) => s.company === ci).length
            return (
              <li key={c.id} className={`co-seg${cur.company === ci ? ' is-active' : ''}${cur.company > ci ? ' is-done' : ''}`} style={{ flexGrow: n }}>
                <span className="co-line" aria-hidden="true" />
                <span className="co-name">
                  <b>{pad(ci + 1)}</b> {c.name}
                </span>
                <span className="co-years">
                  {c.years}
                  {c.projects && ` · ${c.projects.length} projects`}
                </span>
              </li>
            )
          })}
        </ol>

        <ol className="xs-track">
          {companies.map((c, ci) => (
            <Fragment key={c.id}>
              <li className="xs-card co-cover" aria-label={`Company ${ci + 1} of ${companies.length}: ${c.name}`}>
                <div className="co-panel" aria-hidden="true">
                  <span className="co-num">{pad(ci + 1)}</span>
                  <span className="co-years-big">{c.years}</span>
                  <div className="co-fact">
                    <span className="co-fact-big">{c.fact.big}</span>
                    <span className="co-fact-small">{c.fact.small}</span>
                  </div>
                </div>
                <div className="co-body">
                  <p className="co-count xs-anim">
                    Company {pad(ci + 1)} / {pad(companies.length)}
                  </p>
                  <h3 className="co-title xs-anim">{c.name}</h3>
                  <p className="co-role xs-anim">{c.role}</p>
                  <p className="co-meta xs-anim">
                    {c.period} · {c.place}
                  </p>
                  {c.about && <p className="co-about xs-anim">{c.about}</p>}
                  {c.points && (
                    <ul className="co-points xs-anim">
                      {c.points.map((p, k) => (
                        <li key={k}>
                          <Rich parts={p} />
                        </li>
                      ))}
                    </ul>
                  )}
                  {c.stack && (
                    <p className="xs-stack xs-anim">
                      <span>Built with</span> {c.stack.join(' · ')}
                    </p>
                  )}
                  {c.projects && (
                    <ol className="co-projects xs-anim" aria-label="Projects">
                      {c.projects.map((p, pi) => (
                        <li key={p.title}>
                          <b>{pad(pi + 1)}</b> {p.title}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </li>

              {c.projects?.map((p, pi) => (
                <li key={p.title} className={`xs-card xs-${p.tone}`} aria-label={`${c.name}, project ${pi + 1} of ${c.projects!.length}: ${p.title}`}>
                  <div className="xs-visual">
                    <div className="xs-figure">
                      <span className="xs-big">{p.big}</span>
                      <span className="xs-small">{p.small}</span>
                    </div>
                  </div>
                  <div className="xs-body">
                    <p className="xs-meta xs-anim">
                      <span className="co-chip">{c.name}</span>
                      Project {pi + 1} of {c.projects!.length}
                    </p>
                    <h3 className="xs-headline xs-anim">{p.title}</h3>
                    {p.note && <p className="xs-note xs-anim">{p.note}</p>}
                    <ul className="xs-group xs-anim">
                      {p.points.map((pt, k) => (
                        <li key={k}>
                          <Rich parts={pt} />
                        </li>
                      ))}
                    </ul>
                    {p.stack && (
                      <p className="xs-stack xs-anim">
                        <span>Built with</span> {p.stack.join(' · ')}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </Fragment>
          ))}
        </ol>
      </div>
    </section>
  )
}
