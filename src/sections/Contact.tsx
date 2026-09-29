import { contact, photos, site } from '../data/content'
import Words from '../components/anim/Words'
import ImageReveal from '../components/anim/ImageReveal'
import FadeUp from '../components/anim/FadeUp'
import Roll from '../components/anim/Roll'
import Eyebrow from '../components/Eyebrow'
import { useCopy } from '../hooks/useCopy'
import { useMagnetic } from '../hooks/useMagnetic'

export default function Contact() {
  const [copied, copy] = useCopy()
  const send = useMagnetic<HTMLAnchorElement>(0.2)

  return (
    <section id="contact" className="section contact" data-station="7" aria-labelledby="contact-h">
      <Eyebrow index="05" label="Contact" node="end" />
      <div className="contact-grid">
        <div>
          <Words id="contact-h" text={contact.heading} className="contact-h" />
          <FadeUp>
            <p className="contact-sub">{contact.sub}</p>
          </FadeUp>
        </div>
        <ImageReveal photo={photos.contact} className="contact-photo" sizes="(max-width: 767px) 60vw, 22vw" caption={<span className="eyebrow">Off the clock</span>} />
      </div>

      <FadeUp className="contact-cta">
        <a ref={send} className="send-node" href={`mailto:${site.email}`} data-cursor-label="Write ↗">
          <span className="send-ring" aria-hidden="true" />
          <span className="send-ring send-ring-2" aria-hidden="true" />
          <span className="send-label">Send</span>
          <span className="sr-only"> an email to {site.email}</span>
        </a>
        <div className="contact-mail">
          <span className="eyebrow">Email</span>
          <a className="mail-link" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <button type="button" className="copy-btn" onClick={() => copy(site.email)} aria-live="polite">
            {copied ? 'Copied ✓' : 'Copy address'}
          </button>
        </div>
      </FadeUp>

      <FadeUp as="ul" className="contact-links">
        {[
          { label: 'LinkedIn', href: site.linkedin, ext: true },
          { label: 'GitHub', href: site.github, ext: true },
          { label: 'Resume PDF', href: site.resume, ext: false },
        ].map((l) => (
          <li key={l.label}>
            <a className="contact-link" href={l.href} {...(l.ext ? { target: '_blank', rel: 'noopener noreferrer' } : { download: true })}>
              <Roll>{l.label}</Roll>
              <span aria-hidden="true">{l.ext ? '↗' : '↓'}</span>
              {l.ext && <span className="sr-only"> (opens in new tab)</span>}
            </a>
          </li>
        ))}
      </FadeUp>
    </section>
  )
}
