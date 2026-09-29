import type { Rich as RichT } from '../data/content'

/** Renders copy with highlighted numbers / key phrases. */
export default function Rich({ parts }: { parts: RichT }) {
  return (
    <>
      {parts.map((p, i) =>
        p.hl ? (
          <strong className="hl" key={i}>
            {p.t}
          </strong>
        ) : (
          <span key={i}>{p.t}</span>
        ),
      )}
    </>
  )
}
