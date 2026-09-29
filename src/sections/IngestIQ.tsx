import { useRef, useState } from 'react'
import { light } from '../data/content'
import { ScrollTrigger } from '../lib/lenis'
import { useGsap } from '../hooks/useGsap'
import Reveal from '../components/Reveal'

// 13 nodes, left → right; node 8 is the human-approval gate.
const N: [number, number][] = [
  [30, 150], [95, 150], [160, 70], [160, 150], [160, 230], [230, 150],
  [300, 95], [300, 205], [370, 150], [440, 95], [440, 205], [505, 150], [565, 150],
]
const E: [number, number][] = [
  [0, 1], [1, 2], [1, 3], [1, 4], [2, 5], [3, 5], [4, 5], [5, 6], [5, 7], [6, 8], [7, 8], [8, 9], [8, 10], [9, 11], [10, 11], [11, 12],
]
const HITL = 8
// Which nodes/edges light up by step (0-3).
const litNodes = (step: number) => (step === 0 ? 2 : step === 1 ? 8 : 13)
const litEdges = (step: number) => (step === 0 ? 1 : step === 1 ? 9 : 16)

/**
 * Apple-style sticky feature: the graph stays pinned while four steps scroll past.
 * Each step lights more of the agent; step 3 turns the approval node amber.
 */
export default function IngestIQ() {
  const root = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)

  useGsap(root, () => {
    root.current!.querySelectorAll<HTMLElement>('.iq-step').forEach((el, i) => {
      ScrollTrigger.create({ trigger: el, start: 'top 60%', end: 'bottom 60%', onToggle: (self) => self.isActive && setStep(i) })
    })
  })

  return (
    <section id="ingestiq" ref={root} className="band band-white iq" aria-labelledby="iq-h">
      <div className="wrap">
        <Reveal className="iq-head">
          <p className="eyebrow">{light.ingest.eyebrow} · Relevance Lab</p>
          <h2 id="iq-h" className="h-section">
            <span className="tone-2">{light.ingest.title[0]}</span> {light.ingest.title[1]}
          </h2>
        </Reveal>

        <div className="iq-grid">
          <div className="iq-sticky">
            <figure className={`iq-card step-${step}`}>
              <svg viewBox="0 0 600 300" role="img" aria-label="A 13-node agent graph. The highlighted node is the human-approval step.">
                <g className="iq-edges">
                  {E.map(([a, b], i) => (
                    <line key={i} x1={N[a][0]} y1={N[a][1]} x2={N[b][0]} y2={N[b][1]} className={i < litEdges(step) ? 'on' : ''} pathLength={1} />
                  ))}
                </g>
                {N.map(([x, y], i) => (
                  <g key={i} className={`iq-node${i < litNodes(step) ? ' on' : ''}${i === HITL && step >= 2 ? ' hitl' : ''}`}>
                    {i === HITL && step >= 2 && <circle className="iq-ring" cx={x} cy={y} r="18" />}
                    <circle cx={x} cy={y} r={i === 0 || i === 12 ? 10 : 8} />
                  </g>
                ))}
                {step >= 2 && (
                  <text x={N[HITL][0]} y={N[HITL][1] - 30} textAnchor="middle" className="iq-label">
                    Human approval
                  </text>
                )}
              </svg>
              <figcaption>
                <span>{step === 3 ? 'Amazon Bedrock · AgentCore · Aurora · S3' : '13-node LangGraph agent'}</span>
                <span className="iq-count">
                  {String(step + 1).padStart(2, '0')} / 04
                </span>
              </figcaption>
            </figure>
          </div>

          <ol className="iq-steps">
            {light.ingest.steps.map((s, i) => (
              <li key={s.k} className={`iq-step${i === step ? ' is-active' : ''}`}>
                <h3>{s.k}.</h3>
                <p>{s.t}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
