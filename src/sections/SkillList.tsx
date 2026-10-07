import { light } from '../data/content'
import { orbitGroups } from '../data/orbit'
import Reveal from '../components/Reveal'

/**
 * The full skill list as a bento of white cards (12-column grid on desktop).
 * Spans are tuned so cards sharing a row end up the same height (no dead space):
 * GenAI & Agents (hero) + Evaluation · Platforms + Backend · Frontend + Data
 * · Cloud. Follows the robot orbit section, which shows the same skills as
 * an interactive ring.
 */
const span: Record<string, number> = { agents: 7, eval: 5, platforms: 7, backend: 5, frontend: 6, data: 6, cloud: 12 }
const order = Object.keys(span)
const groups = [...orbitGroups].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))

// "LangGraph (StateGraph, HITL)" → name in ink, detail in grey.
const split = (s: string) => {
  const i = s.indexOf(' (')
  return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)]
}

export default function SkillList() {
  const total = orbitGroups.reduce((n, g) => n + g.tiles.length, 0)
  return (
    <section id="toolkit" className="band band-grey" aria-labelledby="toolkit-h">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">{light.skills.eyebrow}</p>
          <h2 id="toolkit-h" className="h-section">
            <span className="tone-2">All {total} skills,</span> by group.
          </h2>
        </Reveal>

        <Reveal as="ul" className="sk-grid" stagger={0.08} y={50}>
          {groups.map((g) => {
            return (
              <li key={g.id} className={`sk-tile${g.id === 'agents' ? ' sk-hero' : ''}`} style={{ '--span': span[g.id] ?? 6 } as React.CSSProperties}>
                <div className="sk-top">
                  <span className="sk-count">{g.tiles.length}</span>
                  <h3 className="sk-name">{g.name}</h3>
                </div>
                <ul className="sk-items">
                  {g.tiles.map((t) => {
                    const [name, detail] = split(t.full)
                    return (
                      <li key={t.full}>
                        {name}
                        {detail && <span> {detail}</span>}
                      </li>
                    )
                  })}
                </ul>
              </li>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
