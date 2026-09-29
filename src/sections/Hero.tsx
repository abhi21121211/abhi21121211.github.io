import { useEffect, useRef } from 'react'
import { light, site } from '../data/content'
import { gsap, scrollToTarget } from '../lib/lenis'
import { useGsap } from '../hooks/useGsap'
import { isMobileViewport, prefersReducedMotion } from '../lib/env'

/**
 * Black "Pro" tile. The section is 300vh tall with a sticky 100vh stage;
 * scroll progress scrubs an 81-frame sequence so Abhishek turns from looking
 * away to facing you, while the name gives way to the headline.
 * Frames: design/video/export_dark.py → public/img/hero-dark/{d,m}.
 */
const COUNT = 81
const FRONT = 48

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const state = useRef({ frame: 0, zoom: 1, sweep: -1, draw: () => {} })

  // Frame loading + drawing.
  useEffect(() => {
    const c = canvas.current!
    const ctx = c.getContext('2d')!
    const mobile = isMobileViewport()
    const set = mobile ? 'm' : 'd'
    const images: (HTMLImageElement | null)[] = Array(COUNT).fill(null)
    let alive = true

    const nearest = (i: number) => {
      for (let d = 0; d < COUNT; d++) {
        if (images[i - d]) return images[i - d]
        if (images[i + d]) return images[i + d]
      }
      return null
    }
    const draw = () => {
      const i = Math.max(0, Math.min(COUNT - 1, Math.round(state.current.frame)))
      const img = images[i] ?? nearest(i)
      if (!img) return
      const W = c.width
      const H = c.height
      // Height-fit, bottom-aligned: frames have pure-black edges, so they melt into the tile.
      // Starts small (name sits above his head), grows as he turns to face you.
      const base = mobile ? 0.66 : 0.72
      const h = H * base * state.current.zoom
      const w = h * (img.naturalWidth / img.naturalHeight)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)
      const x = (W - w) / 2
      const y = H - h + (h - H * base) * 0.3
      ctx.drawImage(img, x, y, w, h)
      // Light sweep: a soft diagonal band crossing him as he turns. 'overlay'
      // brightens his midtones but leaves the pure-black backdrop black.
      const sw = state.current.sweep
      if (sw > -0.5 && sw < 1.5) {
        const cx = x + w * sw
        const band = ctx.createLinearGradient(cx - w * 0.3, y, cx + w * 0.3, y + h * 0.35)
        band.addColorStop(0, 'rgba(255,255,255,0)')
        band.addColorStop(0.5, 'rgba(255,244,225,0.55)')
        band.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.save()
        ctx.globalCompositeOperation = 'overlay'
        ctx.fillStyle = band
        ctx.fillRect(x, y, w, h)
        ctx.restore()
      }
    }
    state.current.draw = draw
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      c.width = Math.round(c.clientWidth * dpr)
      c.height = Math.round(c.clientHeight * dpr)
      draw()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(c)

    const load = (i: number) =>
      new Promise<void>((done) => {
        const im = new Image()
        im.src = `/img/hero-dark/${set}/${String(i).padStart(3, '0')}.webp`
        im.decode().then(
          () => {
            images[i] = im
            if (alive) draw()
            done()
          },
          () => done(),
        )
      })
    const reduced = prefersReducedMotion()
    if (reduced) state.current.frame = FRONT
    ;(async () => {
      await load(reduced ? FRONT : 0)
      if (reduced) return
      // Coarse → fine so any scroll position has a close frame early.
      const order: number[] = []
      for (let step = 16; step >= 1; step = step / 2) for (let i = 0; i < COUNT; i += step) if (!order.includes(i) && i !== 0) order.push(i)
      for (let k = 0; k < order.length && alive; k += 8) await Promise.all(order.slice(k, k + 8).map(load))
    })()
    return () => {
      alive = false
      ro.disconnect()
    }
  }, [])

  // Scroll choreography.
  useGsap(root, () => {
    const s = state.current
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
      onUpdate: () => s.draw(),
    })
    // 0 → 0.55  he turns to face you; name recedes; a light sweep crosses him
    // 0.45 → 0.7 headline arrives word by word, then the sub + CTAs
    // 0.82 → 1  the black stage shrinks into a rounded card, revealing the page
    tl.to(s, { frame: FRONT, zoom: 1.18, duration: 0.55, onUpdate: s.draw }, 0)
      .fromTo(s, { sweep: -0.4 }, { sweep: 1.4, duration: 0.5, onUpdate: s.draw }, 0.08)
      .to('.hero-name', { opacity: 0, y: -60, scale: 0.94, duration: 0.25 }, 0.05)
      .to(s, { zoom: 1.26, duration: 0.3, onUpdate: s.draw }, 0.55)
      .to('.hero-scrim', { opacity: 1, duration: 0.25 }, 0.45)
      .fromTo('.hero-reveal .rw', { opacity: 0, yPercent: 60, filter: 'blur(8px)' }, { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.12, stagger: 0.025 }, 0.45)
      .fromTo('.hero-foot', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.12 }, 0.62)
      .to('.hero-stage', { scale: 0.9, borderRadius: 44, duration: 0.18, ease: 'power1.in' }, 0.82)
      .to({}, { duration: 0.02 })

    // Intro on load.
    gsap.from('.hero-canvas', { opacity: 0, scale: 1.04, duration: 2.2, ease: 'power2.out' })
    // Rise only (no fade) — the title is the LCP element.
    gsap.from('.hero-name > *', { y: 40, duration: 1.6, ease: 'power3.out', stagger: 0.12 })
  })

  return (
    <section id="start" ref={root} className="hero" data-nav="dark" aria-labelledby="hero-title">
      <div className="hero-stage">
        <canvas ref={canvas} className="hero-canvas" aria-hidden="true" />
        <div className="hero-scrim" aria-hidden="true" />

        <div className="hero-name">
          <p className="hero-eyebrow">{light.hero.eyebrow}</p>
          <h1 id="hero-title" className="hero-title">
            {light.hero.title}
          </h1>
        </div>

        <div className="hero-reveal">
          <h2 className="hero-reveal-title" aria-label={light.hero.reveal}>
            {light.hero.reveal.split(' ').map((w, i) => (
              <span key={i} aria-hidden="true">
                {i > 0 && ' '}
                <span className="rw">{w}</span>
              </span>
            ))}
          </h2>
          <div className="hero-foot">
            <p className="hero-sub">{light.hero.sub}</p>
            <div className="hero-ctas">
              <a className="pill pill-blue" href="#work" onClick={(e) => (e.preventDefault(), scrollToTarget('work'))}>
                See the work
              </a>
              <a className="link-chevron link-light" href={site.resume} download>
                Download résumé
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
