import { useEffect, useState } from 'react'
import { AnimatePresence, m as motion } from 'framer-motion'
import { site } from '../data/content'
import { scrollToTarget } from '../lib/lenis'

const links = [
  { id: 'about', label: 'About' },
  { id: 'ingestiq', label: 'IngestIQ' },
  { id: 'work', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Toolkit' },
  { id: 'contact', label: 'Contact' },
]

/** Apple-style global nav: 48px, frosted; flips to dark over [data-nav="dark"] sections. */
export default function Nav({ onPalette }: { onPalette: () => void }) {
  const [dark, setDark] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const check = () => {
      const probe = 24 // nav's vertical centre
      const hit = Array.from(document.querySelectorAll<HTMLElement>('[data-nav="dark"]')).some((el) => {
        const r = el.getBoundingClientRect()
        return r.top <= probe && r.bottom >= probe
      })
      setDark(hit)
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (!open) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    scrollToTarget(id)
  }

  return (
    <header className={`nav${dark ? ' nav-dark' : ''}${open ? ' nav-open' : ''}`}>
      <div className="nav-inner">
        <a className="nav-brand" href="#start" onClick={(e) => (e.preventDefault(), go('start'))}>
          Abhishek Dukare
        </a>
        <nav className="nav-links" aria-label="Primary">
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={(e) => (e.preventDefault(), go(l.id))}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <button type="button" className="nav-icon" onClick={onPalette} aria-label="Search (⌘K)">
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
              <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.3" />
              <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
          <a className="pill pill-blue pill-xs" href={site.resume} download>
            Résumé
          </a>
          <button type="button" className="nav-burger" aria-expanded={open} aria-controls="nav-menu" onClick={() => setOpen((o) => !o)}>
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="nav-menu"
            className="nav-menu"
            aria-label="Menu"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.45, ease: [0.28, 0.11, 0.32, 1] }}
          >
            <ul>
              {links.map((l, i) => (
                <motion.li key={l.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.03, duration: 0.3 }}>
                  <a href={`#${l.id}`} onClick={(e) => (e.preventDefault(), go(l.id))}>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
