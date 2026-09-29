import { useState } from 'react'
import { education, marquee, skills } from '../data/content'
import Words from '../components/anim/Words'
import FadeUp from '../components/anim/FadeUp'
import Marquee from '../components/anim/Marquee'
import Rule from '../components/anim/Rule'
import Eyebrow from '../components/Eyebrow'
import Constellation from '../components/Constellation'

export default function Skills() {
  const [selected, setSelected] = useState(0)
  const [hover, setHover] = useState<number | null>(null)
  const [pinned, setPinned] = useState(false)
  const active = hover ?? selected
  const cluster = skills.clusters[active]

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const n = skills.clusters.length
    const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? (i + 1) % n : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? (i - 1 + n) % n : -1
    if (next < 0) return
    e.preventDefault()
    setSelected(next)
    setPinned(true)
    document.getElementById(`skill-tab-${next}`)?.focus()
  }

  return (
    <>
      <Marquee items={marquee} />
      <section id="skills" className="section skills" data-station="6" aria-labelledby="skills-h">
        <Eyebrow index="04" label="Skills" node="node_06" />
        <Words id="skills-h" text={skills.heading} className="display" />

        <div className="skills-grid">
          <Constellation active={active} paused={hover !== null || pinned} onHover={setHover} />

          <div className="skills-panel">
            <div role="tablist" aria-label="Skill groups" className="skill-tabs">
              {skills.clusters.map((c, i) => (
                <button
                  key={c.id}
                  id={`skill-tab-${i}`}
                  role="tab"
                  type="button"
                  aria-selected={i === active}
                  aria-controls="skill-panel"
                  tabIndex={i === selected ? 0 : -1}
                  className={`skill-tab cluster-${c.color}`}
                  onClick={() => (setSelected(i), setPinned(true))}
                  onKeyDown={(e) => onTabKey(e, i)}
                >
                  <span className="skill-tab-i">0{i + 1}</span>
                  {c.name}
                  <span className="skill-tab-n">{c.items.length}</span>
                </button>
              ))}
            </div>
            <div id="skill-panel" role="tabpanel" aria-labelledby={`skill-tab-${active}`}>
              <ul className="skill-list" key={cluster.id}>
                {cluster.items.map((s, i) => (
                  <li key={s} style={{ '--i': i } as React.CSSProperties}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile: grouped lists. */}
        <div className="skills-flat">
          {skills.clusters.map((c, i) => (
            <FadeUp key={c.id} className={`skills-flat-group cluster-${c.color}`}>
              <h3>
                <span className="eyebrow">0{i + 1}</span> {c.name}
              </h3>
              <p>{c.items.join(' · ')}</p>
            </FadeUp>
          ))}
        </div>

        <div className="education">
          <h3 className="eyebrow">Education &amp; certifications</h3>
          {[...education.items, ...education.certs].map((e, i) => (
            <div className="edu-row" key={e.title}>
              <Rule />
              <FadeUp className="edu-inner" stagger={0.05} y={16}>
                <span className="eyebrow">{i >= education.items.length ? 'Certificate' : 'Degree'}</span>
                <span className="edu-title">{e.title}</span>
                <span className="muted">{e.where}</span>
                <span className="eyebrow edu-when">{e.when}</span>
              </FadeUp>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
