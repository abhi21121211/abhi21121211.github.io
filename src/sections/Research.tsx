import { useRef, useState } from 'react'
import { light } from '../data/content'
import { ScrollTrigger } from '../lib/lenis'
import { useGsap } from '../hooks/useGsap'
import Reveal from '../components/Reveal'

// A small associative memory graph. Node 0 is the agent's "self"; nodes are
// ordered by when they're lit, so the graph grows as the steps scroll past.
const N: [number, number][] = [
  [300, 150], [220, 100], [380, 105], [240, 215], [365, 210], [140, 150],
  [300, 55], [460, 160], [170, 245], [440, 250], [95, 80], [520, 70],
]
const E: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [1, 6], [2, 6], [2, 7], [3, 8], [4, 9], [5, 10], [7, 11], [3, 4], [5, 8],
]
// Step 2 (self-correction): these memories are forgotten, yet the graph keeps its shape.
const FORGOTTEN = new Set([8, 10, 11])
const litNodes = (step: number) => (step === 0 ? 3 : step === 1 ? 8 : 12)
const edgeOn = ([a, b]: [number, number], step: number) => a < litNodes(step) && b < litNodes(step)

/**
 * Same sticky pattern as the old IngestIQ feature: the memory graph stays pinned
 * while four findings scroll past. Each step shows its headline number.
 */
export default function Research() {
  const root = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)
  const r = light.research
  const s = r.steps[step]

  useGsap(root, () => {
    root.current!.querySelectorAll<HTMLElement>('.iq-step').forEach((el, i) => {
      ScrollTrigger.create({ trigger: el, start: 'top 60%', end: 'bottom 60%', onToggle: (self) => self.isActive && setStep(i) })
    })
  })

  return (
    <section id="research" ref={root} className="band band-white iq" aria-labelledby="rs-h">
      <div className="wrap">
        <Reveal className="iq-head">
          <p className="eyebrow">{r.eyebrow}</p>
          <h2 id="rs-h" className="h-section">
            <span className="tone-2">{r.title[0]}</span> {r.title[1]}
          </h2>
          <p className="rs-sub">{r.sub}</p>
        </Reveal>

        <div className="iq-grid">
          <div className="iq-sticky">
            <figure className={`iq-card step-${step}`}>
              <p className="rs-stat" aria-live="polite">
                <span className="rs-v">{s.v}</span>
                <span className="rs-l">{s.l}</span>
              </p>
              <svg viewBox="0 0 600 300" role="img" aria-label="An associative memory graph that grows around the agent's self as experience accumulates.">
                <g className="iq-edges">
                  {E.map((e, i) => {
                    const faded = step === 2 && (FORGOTTEN.has(e[0]) || FORGOTTEN.has(e[1]))
                    return <line key={i} x1={N[e[0]][0]} y1={N[e[0]][1]} x2={N[e[1]][0]} y2={N[e[1]][1]} className={`${edgeOn(e, step) ? 'on' : ''}${faded ? ' faded' : ''}`} />
                  })}
                </g>
                {N.map(([x, y], i) => (
                  <g key={i} className={`iq-node${i < litNodes(step) ? ' on' : ''}${i === 0 ? ' hitl' : ''}${step === 2 && FORGOTTEN.has(i) ? ' faded' : ''}`}>
                    {i === 0 && <circle className="iq-ring" cx={x} cy={y} r="18" />}
                    <circle cx={x} cy={y} r={i === 0 ? 11 : 8} />
                  </g>
                ))}
                <text x={N[0][0]} y={N[0][1] + 34} textAnchor="middle" className="iq-label">
                  self
                </text>
              </svg>
              <figcaption>
                <span>{step < 2 ? 'Track A · simulation bench' : step === 2 ? 'Encoded, not forgotten' : 'Track B · memory around a frozen LLM'}</span>
                <span className="iq-count">
                  {String(step + 1).padStart(2, '0')} / 04
                </span>
              </figcaption>
            </figure>
          </div>

          <ol className="iq-steps">
            {r.steps.map((st, i) => (
              <li key={st.k} className={`iq-step${i === step ? ' is-active' : ''}`}>
                <h3>{st.k}.</h3>
                <p>{st.t}</p>
              </li>
            ))}
          </ol>
        </div>

        <Reveal className="rs-foot">
          <p className="rs-practice">{r.practice}</p>
          <p className="ptile-tech">
            <span>Built with</span> {r.stack.join(' · ')}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
