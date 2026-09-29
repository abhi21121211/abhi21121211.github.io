import { light } from '../data/content'
import Highlight from '../components/Highlight'
import Reveal from '../components/Reveal'
import Count from '../components/Count'
import Days from './Days'

export default function About() {
  return (
    <>
      <section id="about" className="band band-white" aria-label="About">
        <div className="wrap">
          <Highlight parts={light.statement} className="statement" />
        </div>
      </section>

      <Days />

      <section className="band band-grey" aria-labelledby="numbers-h">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">By the numbers</p>
            <h2 id="numbers-h" className="h-section">
              <span className="tone-2">Measured in</span> days saved.
            </h2>
          </Reveal>
          <Reveal as="ul" className="bento" stagger={0.08} y={50}>
            {light.numbers.map((n) => (
              <li key={n.value} className={`tile tile-${n.size} tile-${n.tone}`}>
                <span className="tile-value">
                  <Count value={n.value} />
                </span>
                <span className="tile-label">{n.label}</span>
              </li>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  )
}
