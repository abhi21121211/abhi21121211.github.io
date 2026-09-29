import { about, photos } from '../data/content'
import Words from '../components/anim/Words'
import ScrubText from '../components/anim/ScrubText'
import ImageReveal from '../components/anim/ImageReveal'
import FadeUp from '../components/anim/FadeUp'
import Rule from '../components/anim/Rule'
import Eyebrow from '../components/Eyebrow'
import Counter from '../components/Counter'
import Rich from '../components/Rich'

export default function About() {
  return (
    <section id="about" className="section about" data-station="1" aria-labelledby="about-h">
      <Eyebrow index="01" label="About" node="node_01" />
      <div className="about-grid">
        <ImageReveal photo={photos.about} className="about-photo" caption={<span className="eyebrow">At work — Bengaluru</span>} />
        <div className="about-copy">
          <Words id="about-h" text={about.heading} className="display" />
          <ScrubText parts={[...about.body[0], { t: ' ' }, ...about.body[1]]} className="about-statement" />
          <p className="about-more">
            <Rich parts={about.body[2]} />
          </p>
        </div>
      </div>

      <Rule />
      <FadeUp as="ul" className="stats">
        {about.stats.map((s, i) => (
          <li className="stat" key={i}>
            <span className="stat-index eyebrow">0{i + 1}</span>
            <span className="stat-value">
              {s.kind === 'count' ? (
                <Counter to={s.to} decimals={s.decimals} suffix={s.suffix} />
              ) : (
                <>
                  <span className="stat-from">{s.from}</span>
                  <span className="stat-arrow" aria-hidden="true">
                    →
                  </span>
                  <span className="sr-only"> to </span>
                  <span className="serif">{s.to}</span>
                </>
              )}
            </span>
            <span className="stat-caption">{s.caption}</span>
          </li>
        ))}
      </FadeUp>
    </section>
  )
}
