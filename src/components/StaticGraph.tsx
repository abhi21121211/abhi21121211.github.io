import { useMemo } from 'react'
import { mulberry32 } from '../lib/random'

/**
 * Static SVG graph: shown before the 3D scene loads, under reduced motion,
 * and when WebGL is unavailable. Deterministic, ~3 KB of DOM.
 */
export default function StaticGraph({ hidden }: { hidden?: boolean }) {
  const { nodes, edges } = useMemo(() => {
    const rand = mulberry32(42)
    const nodes = Array.from({ length: 90 }, () => {
      // Cluster toward the upper-right, where the hero graph lives.
      const x = 20 + Math.pow(rand(), 0.8) * 80
      const y = Math.pow(rand(), 1.1) * 100
      return { x, y, r: 0.12 + rand() * 0.28, v: rand() > 0.62 }
    })
    const edges: [number, number][] = []
    nodes.forEach((a, i) => {
      const near = nodes
        .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
        .filter((n) => n.j !== i && n.d < 220)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2)
      near.forEach((n) => i < n.j && edges.push([i, n.j]))
    })
    return { nodes, edges }
  }, [])

  return (
    <svg className={`static-graph${hidden ? ' is-hidden' : ''}`} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="sg-glow">
          <stop offset="0" stopColor="#4F8CFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#4F8CFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g stroke="#4F8CFF" strokeOpacity="0.14" strokeWidth="0.06">
        {edges.map(([a, b], k) => (
          <line key={k} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} />
        ))}
      </g>
      {nodes.map((n, k) => (
        <circle key={k} cx={n.x} cy={n.y} r={n.r} fill={n.v ? '#8B5CF6' : '#4F8CFF'} opacity={0.75} />
      ))}
      <circle cx="68" cy="42" r="9" fill="url(#sg-glow)" opacity="0.35" />
    </svg>
  )
}
