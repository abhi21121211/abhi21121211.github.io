import { experience, media, photos, stations } from '../data/content'
import Words from '../components/anim/Words'
import ImageReveal from '../components/anim/ImageReveal'
import FadeUp from '../components/anim/FadeUp'
import Rule from '../components/anim/Rule'
import Eyebrow from '../components/Eyebrow'
import Rich from '../components/Rich'
import MiniGraph from '../components/MiniGraph'
import LoopVideo from '../components/LoopVideo'

export default function Experience() {
  const current = experience.roles[0]
  return (
    <section id="experience" className="section experience" aria-labelledby="xp-h">
      <Eyebrow index="02" label="Experience" node="node_02 → node_04" />
      <Words id="xp-h" text={experience.heading} className="display" />

      <div className="xp-grid">
        <aside className="xp-aside">
          <ImageReveal
            photo={photos.work}
            className="xp-photo"
            sizes="(max-width: 900px) 80vw, 28vw"
            caption={
              <>
                <span className="eyebrow">Currently</span>
                <span>
                  {current.title} at <span className="serif">{current.company}</span>
                </span>
              </>
            }
          />
        </aside>

        <div className="xp-list">
          {experience.roles.map((role, ri) => (
            <article id={role.id} key={role.id} className="xp-role" data-station={stations.findIndex((s) => s.id === role.id)} aria-labelledby={`${role.id}-h`}>
              <Rule />
              <header className="xp-head">
                <span className="eyebrow xp-index">0{ri + 1}</span>
                <Words as="h3" id={`${role.id}-h`} text={role.company} className="xp-company" />
                <div className="xp-meta">
                  <p className="xp-title">{role.title}</p>
                  <p className="eyebrow">
                    {role.location} · {role.period}
                  </p>
                </div>
              </header>

              {role.blocks.map((b, bi) => (
                <div className="xp-block" key={bi}>
                  {b.heading && (
                    <h4 className="xp-block-h">
                      {b.heading}
                      {b.note && <span className="eyebrow">{b.note}</span>}
                    </h4>
                  )}
                  {b.miniGraph && (
                    <div className="xp-visual">
                      {media.dataCore && <LoopVideo media={media.dataCore} className="xp-video" />}
                      <MiniGraph />
                    </div>
                  )}
                  {b.points && (
                    <FadeUp as="ul" className="xp-points" stagger={0.06} y={24}>
                      {b.points.map((p, pi) => (
                        <li key={pi}>
                          <Rich parts={p} />
                        </li>
                      ))}
                    </FadeUp>
                  )}
                </div>
              ))}
            </article>
          ))}

          <div className="xp-side">
            <Rule />
            <p>
              <span className="eyebrow">Earlier</span>
              <span>
                {experience.side.company} — {experience.side.title}
              </span>
              <span className="eyebrow">{experience.side.period}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
