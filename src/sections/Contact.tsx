import { light, site } from '../data/content'
import { useCopy } from '../hooks/useCopy'
import Reveal from '../components/Reveal'

export default function Contact() {
  const [copied, copy] = useCopy()
  return (
    <section id="contact" className="band band-grey contact" aria-labelledby="contact-h">
      <Reveal className="wrap wrap-narrow center" stagger={0.1}>
        <p className="eyebrow">Contact</p>
        <h2 id="contact-h" className="h-display">
          {light.contact.title[0]} <span className="accent">{light.contact.title[1]}</span>
        </h2>
        <p className="lead">{light.contact.sub}</p>
        <div className="contact-ctas">
          <a className="pill pill-blue pill-lg" href={`mailto:${site.email}`}>
            Email me
          </a>
          <button type="button" className="pill pill-ghost pill-lg" onClick={() => copy(site.email)} aria-live="polite">
            {copied ? 'Copied ✓' : 'Copy address'}
          </button>
        </div>
        <p className="contact-links">
          <a className="link-chevron" href={site.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn<span className="sr-only"> (opens in new tab)</span>
          </a>
          <a className="link-chevron" href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub<span className="sr-only"> (opens in new tab)</span>
          </a>
          <a className="link-chevron" href={site.resume} download>
            Résumé (PDF)
          </a>
        </p>
      </Reveal>
    </section>
  )
}
