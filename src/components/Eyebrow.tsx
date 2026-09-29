/** Section index: "(01) About ——— node_01". Keeps the graph idea, quietly. */
export default function Eyebrow({ index, label, node }: { index: string; label: string; node?: string }) {
  return (
    <p className="eyebrow section-eyebrow">
      <span>({index})</span>
      <span>{label}</span>
      <span className="eyebrow-line" aria-hidden="true" />
      {node && <span className="eyebrow-node">{node}</span>}
    </p>
  )
}
