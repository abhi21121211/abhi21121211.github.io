import { useInView } from '../hooks/useInView'

// 13 nodes, left → right. Node 8 is the human-in-the-loop approval gate.
const N: [number, number][] = [
  [20, 80], [70, 80],
  [122, 36], [122, 80], [122, 124],
  [176, 80],
  [228, 48], [228, 112],
  [282, 80],
  [334, 48], [334, 112],
  [384, 80], [428, 80],
]
const E: [number, number][] = [
  [0, 1], [1, 2], [1, 3], [1, 4], [2, 5], [3, 5], [4, 5], [5, 6], [5, 7],
  [6, 8], [7, 8], [8, 9], [8, 10], [9, 11], [10, 11], [11, 12],
]
const HITL = 8
const route = 'M20 80 L70 80 L122 80 L176 80 L228 48 L282 80 L334 112 L384 80 L428 80'

/** IngestIQ: a 13-node agent graph that draws itself; one node turns amber = human approval. */
export default function MiniGraph() {
  const [ref, inView] = useInView<HTMLElement>('0px 0px -20% 0px')
  return (
    <figure ref={ref} className={`mini-graph${inView ? ' is-in' : ''}`}>
      <svg viewBox="0 0 448 160" role="img" aria-label="Diagram: a 13-node agent graph flowing left to right, with one human-approval node before the final steps.">
        <g className="mg-edges">
          {E.map(([a, b], i) => (
            <line key={i} x1={N[a][0]} y1={N[a][1]} x2={N[b][0]} y2={N[b][1]} pathLength={1} style={{ '--i': i } as React.CSSProperties} />
          ))}
        </g>
        {inView && (
          <circle className="mg-pulse" r="3">
            <animateMotion dur="3.2s" repeatCount="indefinite" path={route} begin="1.6s" />
          </circle>
        )}
        <g className="mg-nodes">
          {N.map(([x, y], i) => (
            <g key={i} className={i === HITL ? 'mg-node mg-hitl' : 'mg-node'} style={{ '--i': i } as React.CSSProperties}>
              {i === HITL && <circle className="mg-hitl-ring" cx={x} cy={y} r="13" />}
              <circle cx={x} cy={y} r={i === 0 || i === 12 ? 6 : 5} />
            </g>
          ))}
        </g>
        <text x={N[HITL][0]} y={N[HITL][1] - 22} textAnchor="middle" className="mg-label mg-label-hitl">
          human approval
        </text>
        <text x="20" y="152" className="mg-label">excel in</text>
        <text x="428" y="152" textAnchor="end" className="mg-label">mapped + audited</text>
      </svg>
      <figcaption className="mono">13 nodes · 1 human-in-the-loop gate · LangGraph</figcaption>
    </figure>
  )
}
