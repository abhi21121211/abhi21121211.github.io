import { useRef } from 'react'
import { education, light, photos } from '../data/content'
import { gsap } from '../lib/lenis'
import { useGsap } from '../hooks/useGsap'
import Reveal from '../components/Reveal'

/** Three portraits drifting at different speeds, then education as a quiet list. */
export default function Life() {
  const root = useRef<HTMLElement>(null)
  useGsap(root, () => {
    gsap.utils.toArray<HTMLElement>('.life-photo').forEach((el, i) => {
      gsap.fromTo(el, { y: 60 + i * 40 }, { y: -40 - i * 30, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.from(el.querySelector('img'), { scale: 1.25, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
    })
  })
  const shots = [
    { p: photos.about, cap: 'At work.' },
    { p: photos.hero, cap: 'In the city.' },
    { p: photos.contact, cap: 'Off the clock.' },
  ]
  return (
    <section ref={root} className="band band-white life" aria-labelledby="life-h">
      <div className="wrap">
        <Reveal className="center">
          <p className="eyebrow">{light.life.eyebrow}</p>
          <h2 id="life-h" className="h-section">
            {light.life.title}
          </h2>
        </Reveal>
        <div className="life-row">
          {shots.map((s) => (
            <figure className="life-photo" key={s.p.src}>
              <div className="life-frame">
                <img src={s.p.src} srcSet={`${s.p.srcSm} 640w, ${s.p.src} 1100w`} sizes="(max-width: 767px) 80vw, 30vw" alt={s.p.alt} loading="lazy" decoding="async" />
              </div>
              <figcaption>{s.cap}</figcaption>
            </figure>
          ))}
        </div>

        <Reveal as="ul" className="edu" stagger={0.08}>
          {[...education.items, ...education.certs].map((e) => (
            <li key={e.title}>
              <span className="edu-title">{e.title}</span>
              <span className="edu-where">{e.where}</span>
              <span className="edu-when">{e.when}</span>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
