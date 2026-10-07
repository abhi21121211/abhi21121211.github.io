import { useEffect, useMemo, useRef, useState } from 'react'
import { light } from '../data/content'
import { orbitGroups, type OrbitGroup } from '../data/orbit'
import { mobileTopSkills, robotAnchors, robotBeats, robotVideo } from '../data/robot'
import type { RobotOrbitApi, Tip } from '../orbit/robotEngine'
import { isMobileViewport, prefersReducedMotion, supportsWebGL } from '../lib/env'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const between = (t: number, [a, b]: number[]) => clamp01((t - a) / (b - a))
const smooth = (x: number) => x * x * (3 - 2 * x)

/**
 * Skills section ("Meet Abhishek"). A normal one-screen section — no scroll
 * pinning. The video autoplays (muted) when it comes into view: walk →
 * spin/transform → hands spread, where 65 glass skill tiles burst out and
 * orbit the glowing ring. It stops on the ring frame with the orbit live
 * (drag / hover / click a group). The full skill list is its own section
 * (SkillList).
 */
export default function RobotSkills() {
  const [mode] = useState<'play' | 'static'>(() => (prefersReducedMotion() || !supportsWebGL() ? 'static' : 'play'))
  return (
    <section id="skills" className="rh-section" data-nav="dark" aria-labelledby="rh-title">
      {mode === 'play' ? <Stage /> : <StaticStage />}
    </section>
  )
}

function Stage() {
  const root = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const intro = useRef<HTMLDivElement>(null)
  const api = useRef<RobotOrbitApi | null>(null)
  const [mobile] = useState(isMobileViewport)
  const variant = mobile ? robotVideo.mobile : robotVideo.desktop
  const [near, setNear] = useState(false)
  const [interactive, setInteractive] = useState(false)
  const [ended, setEnded] = useState(false)
  const [focus, setFocus] = useState<number | null>(null)
  const [tip, setTip] = useState<Tip>(null)

  const groups: OrbitGroup[] = useMemo(
    () => (mobile ? orbitGroups.map((g) => ({ ...g, tiles: g.tiles.filter((t) => mobileTopSkills.includes(t.label)) })) : orbitGroups),
    [mobile],
  )

  // Load video + 3D only when the section is within ~2 screens.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: '200% 0px' })
    io.observe(root.current!)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!near) return
    let disposed = false
    import('../orbit/robotEngine').then(({ createRobotOrbit }) => {
      if (disposed || !canvas.current) return
      api.current = createRobotOrbit(canvas.current, groups, setTip, (g) => setFocus(g))
      placeAnchor()
    })
    return () => {
      disposed = true
      api.current?.dispose()
      api.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, near])

  const toStage = (sx: number, sy: number) => {
    const r = root.current!.getBoundingClientRect()
    const scale = variant.fit === 'cover' ? Math.max(r.width / variant.aspect, r.height) : Math.min(r.width / variant.aspect, r.height)
    const dw = scale * variant.aspect
    return { x: (r.width - dw) / 2 + ((sx - variant.crop.x) / variant.crop.w) * dw, y: (r.height - scale) / 2 + sy * scale, dw }
  }
  const placeAnchor = () => {
    if (!api.current || !root.current) return
    const c = toStage(robotAnchors.ring.x, robotAnchors.ring.y)
    api.current.setAnchor({ cx: c.x, cy: c.y, radius: (robotAnchors.ring.halfWidth / variant.crop.w) * c.dw, hands: robotAnchors.hands.map((h) => toStage(h.x, h.y)) })
  }
  useEffect(() => {
    const ro = new ResizeObserver(placeAnchor)
    ro.observe(root.current!)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Play while on screen; pause when scrolled away.
  useEffect(() => {
    const v = video.current!
    let inView = false
    const tryPlay = () => {
      if (inView && v.currentTime < robotVideo.stopAt) v.play().catch(() => {})
    }
    const io = new IntersectionObserver(
      ([e]) => {
        api.current?.setVisible(e.isIntersecting)
        inView = e.isIntersecting && e.intersectionRatio > 0.45
        if (inView) tryPlay()
        else v.pause()
      },
      { threshold: [0, 0.45] },
    )
    io.observe(root.current!)
    // The file may still be loading when the section scrolls in — start once it can.
    v.addEventListener('canplay', tryPlay)
    return () => {
      io.disconnect()
      v.removeEventListener('canplay', tryPlay)
    }
  }, [])

  // Drive overlays from the video's own clock.
  useEffect(() => {
    const v = video.current!
    let raf = 0
    let lastOn = false
    const tick = () => {
      const t = v.currentTime
      if (t >= robotVideo.stopAt && !v.paused) {
        v.pause()
        setEnded(true)
      }
      const el = intro.current
      if (el) {
        const nameIn = smooth(between(t, robotBeats.nameIn))
        const aside = smooth(between(t, robotBeats.aside))
        const H = root.current!.clientHeight
        const y0 = mobile ? 70 : H / 2 - el.offsetHeight / 2
        const y1 = mobile ? 64 : 78
        el.style.transform = `translate3d(0, ${y0 + (y1 - y0) * aside}px, 0) scale(${1 - aside * (mobile ? 0.45 : 0.55)})`
        el.style.setProperty('--in', String(nameIn))
        el.style.opacity = String(1 - smooth(between(t, robotBeats.burst)))
      }
      api.current?.setReveal(between(t, robotBeats.burst))
      const on = t >= robotBeats.interactive[0]
      if (on !== lastOn) {
        lastOn = on
        setInteractive(on)
        api.current?.setInteractive(on)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mobile])

  useEffect(() => {
    api.current?.focus(focus)
  }, [focus])

  const replay = () => {
    const v = video.current!
    setFocus(null)
    setEnded(false)
    v.currentTime = 0
    v.play().catch(() => {})
  }

  const active = focus !== null ? orbitGroups[focus] : null
  const total = groups.reduce((n, g) => n + g.tiles.length, 0)

  return (
    <div ref={root} className="rh-stage">
      <video
        ref={video}
        className={`rh-video rh-${variant.fit}`}
        src={near ? variant.src : undefined}
        poster={robotVideo.poster}
        muted
        playsInline
        preload={near ? 'auto' : 'none'}
        aria-label="Abhishek walks in, puts on sunglasses and transforms into a robot; skill tiles orbit around it"
      />
      <div className="rh-shade" aria-hidden="true" />
      <canvas ref={canvas} className={`rh-canvas${interactive ? ' is-live' : ''}`} aria-hidden="true" />

      <div ref={intro} className="rh-intro">
        <p className="rh-eyebrow">{light.film.eyebrow} · Toolkit</p>
        <h2 id="rh-title" className="rh-title">
          {light.film.title}
        </h2>
        <p className="rh-sub">{light.film.sub}</p>
      </div>

      <div className={`rh-hold${interactive ? ' is-on' : ''}`}>
        <div className="rh-hold-head">
          <p className="rh-hold-title">The stack behind the agents.</p>
          <p className="rh-hold-hint">
            {orbitGroups.length} rings · {total} skills — {mobile ? 'drag to spin, tap a tile' : 'drag to spin, hover a tile, click a group'}
          </p>
        </div>
        <div className="rh-chips" role="group" aria-label="Skill groups">
          {orbitGroups.map((g, i) => (
            <button key={g.id} type="button" className="orbit-chip" aria-pressed={focus === i} tabIndex={interactive ? 0 : -1} style={{ '--c': g.color } as React.CSSProperties} onClick={() => setFocus(focus === i ? null : i)}>
              <i aria-hidden="true" />
              {g.name}
              <span>{g.tiles.length}</span>
            </button>
          ))}
        </div>
        {active && (
          <aside className="rh-panel" style={{ '--c': active.color } as React.CSSProperties} aria-live="polite">
            <button type="button" className="rh-panel-x" onClick={() => setFocus(null)} aria-label="Close">
              ×
            </button>
            <p className="rh-panel-count">{active.tiles.length} skills</p>
            <h3 className="rh-panel-title">{active.name}</h3>
            <ul>
              {active.tiles.map((t) => (
                <li key={t.full}>{t.full}</li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      {tip && (
        <div className="orbit-tip" style={{ left: tip.x, top: tip.y, '--c': tip.color } as React.CSSProperties} aria-hidden="true">
          <b>{tip.label}</b>
          <span>{tip.group}</span>
        </div>
      )}

      {ended && (
        <button type="button" className="rh-replay" onClick={replay}>
          <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
            <path d="M3 8a5 5 0 1 0 1.5-3.6M3 3v2.6h2.6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Replay
        </button>
      )}
    </div>
  )
}

function StaticStage() {
  return (
    <div className="rh-static">
      <img src={robotVideo.ringPoster} alt="Abhishek’s robot avatar with a glowing ring" loading="lazy" />
      <div className="wrap rh-static-text">
        <p className="rh-eyebrow" style={{ '--in': 1 } as React.CSSProperties}>
          {light.film.eyebrow} · Toolkit
        </p>
        <h2 id="rh-title" className="rh-title">
          {light.film.title}
        </h2>
        <p className="rh-sub" style={{ '--in': 1 } as React.CSSProperties}>
          {light.film.sub}
        </p>
      </div>
    </div>
  )
}
