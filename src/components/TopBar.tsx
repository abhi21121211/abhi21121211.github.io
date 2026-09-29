import { useEffect, useState } from 'react'
import { AnimatePresence, m as motion } from 'framer-motion'
import { site } from '../data/content'
import { scrollToTarget } from '../lib/lenis'
import Roll from './anim/Roll'

const links = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
]

export default function TopBar({ onPalette }: { onPalette: () => void }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
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
    <header className={`topbar${scrolled ? ' is-scrolled' : ''}`}>
      <a href="#start" className="brand" onClick={(e) => (e.preventDefault(), go('start'))} aria-label="Abhishek Dukare — back to top">
        <span className="brand-name">Abhishek Dukare</span>
        <span className="brand-role serif">AI Engineer</span>
      </a>

      <nav className="topbar-links" aria-label="Primary">
        {links.map((l) => (
          <a key={l.id} href={`#${l.id}`} onClick={(e) => (e.preventDefault(), go(l.id))}>
            <Roll>{l.label}</Roll>
          </a>
        ))}
      </nav>

      <div className="topbar-actions">
        <Clock />
        <button type="button" className="kbd-btn mono" onClick={onPalette} aria-label="Open command palette">
          <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd>
          <kbd>K</kbd>
        </button>
        <a className="btn btn-ghost btn-sm" href={site.resume} download>
          <Roll>Resume</Roll>
        </a>
        <button type="button" className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className={`menu-icon${open ? ' is-open' : ''}`} aria-hidden="true" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <ol>
              {links.map((l, i) => (
                <motion.li key={l.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                  <a href={`#${l.id}`} onClick={(e) => (e.preventDefault(), go(l.id))}>
                    <span className="eyebrow">0{i + 1}</span> {l.label}
                  </a>
                </motion.li>
              ))}
            </ol>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

/** Local time in Bengaluru — a quiet "real person, real place" signal. */
function Clock() {
  const fmt = () => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date())
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const t = setInterval(() => setTime(fmt()), 15000)
    return () => clearInterval(t)
  }, [])
  return (
    <p className="clock eyebrow" aria-label={`Local time in Bengaluru: ${time}`}>
      BLR <span aria-hidden="true">{time}</span> IST
    </p>
  )
}
