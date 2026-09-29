import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, m as motion } from 'framer-motion'
import { site } from '../data/content'
import { scrollToTarget } from '../lib/lenis'
import { useCopy } from '../hooks/useCopy'

type Item = { id: string; label: string; hint: string; run: () => void }

/** `/` or Ctrl/⌘+K → quick jump. Listbox pattern with aria-activedescendant. */
export default function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const [copied, copy] = useCopy()
  const input = useRef<HTMLInputElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  const items: Item[] = useMemo(() => {
    const jump = (id: string) => () => scrollToTarget(id)
    const open = (href: string) => () => window.open(href, '_blank', 'noopener')
    return [
      { id: 'about', label: 'About', hint: '', run: jump('about') },
      { id: 'work', label: 'Experience', hint: '', run: jump('work') },
      { id: 'projects', label: 'Projects', hint: '', run: jump('projects') },
      { id: 'skills', label: 'Skills', hint: '', run: jump('skills') },
      { id: 'contact', label: 'Contact', hint: '', run: jump('contact') },
      { id: 'resume', label: 'Download resume', hint: 'pdf', run: open(site.resume) },
      { id: 'email', label: 'Copy email address', hint: site.email, run: () => copy(site.email) },
      { id: 'github', label: 'GitHub', hint: '↗', run: open(site.github) },
      { id: 'linkedin', label: 'LinkedIn', hint: '↗', run: open(site.linkedin) },
    ]
  }, [copy])

  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.trim().toLowerCase()))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement)?.tagName ?? '')
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && !open)) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement
      setQuery('')
      setIndex(0)
      requestAnimationFrame(() => input.current?.focus())
    } else returnFocus.current?.focus?.()
  }, [open])

  const run = (item?: Item) => {
    if (!item) return
    item.run()
    if (item.id !== 'email') setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') (e.preventDefault(), setIndex((i) => (i + 1) % Math.max(1, filtered.length)))
    else if (e.key === 'ArrowUp') (e.preventDefault(), setIndex((i) => (i - 1 + filtered.length) % Math.max(1, filtered.length)))
    else if (e.key === 'Enter') (e.preventDefault(), run(filtered[index]))
    else if (e.key === 'Escape') (e.preventDefault(), setOpen(false))
    else if (e.key === 'Tab') e.preventDefault() // keep focus inside the dialog
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="palette-backdrop" onMouseDown={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="palette"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onMouseDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <div className="palette-input">
              <span className="mono" aria-hidden="true">
                &gt;_
              </span>
              <input
                ref={input}
                value={query}
                onChange={(e) => (setQuery(e.target.value), setIndex(0))}
                onKeyDown={onKeyDown}
                placeholder="Jump to…"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={filtered[index] ? `cmd-${filtered[index].id}` : undefined}
                aria-label="Search commands"
              />
              <kbd className="mono">esc</kbd>
            </div>
            <ul id="palette-list" role="listbox" aria-label="Commands">
              {filtered.map((item, i) => (
                <li
                  key={item.id}
                  id={`cmd-${item.id}`}
                  role="option"
                  aria-selected={i === index}
                  className={i === index ? 'is-active' : ''}
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => run(item)}
                >
                  <span>{item.id === 'email' && copied ? 'Copied ✓' : item.label}</span>
                  <span className="mono muted">{item.hint}</span>
                </li>
              ))}
              {!filtered.length && <li className="palette-empty mono">no matching node</li>}
            </ul>
            <p className="palette-foot mono" aria-hidden="true">
              ↑↓ navigate · ↵ run · / or ⌘K toggle
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
