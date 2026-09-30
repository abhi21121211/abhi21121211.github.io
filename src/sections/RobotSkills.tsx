import { useEffect, useMemo, useRef, useState } from 'react'
import { light } from '../data/content'
import { orbitGroups, type OrbitGroup } from '../data/orbit'
import { mobileTopSkills, robotAnchors, robotBeats, robotTimeline, robotVideo } from '../data/robot'
import type { RobotOrbitApi, Tip } from '../orbit/robotEngine'
import { ScrollTrigger } from '../lib/lenis'
import { isMobileViewport, prefersReducedMotion, supportsWebGL } from '../lib/env'

const TOTAL = robotTimeline.reduce((n, s) => n + s.screens, 0)
const HOLD_AT = robotTimeline.slice(0, robotTimeline.findIndex((s) => s.hold)).reduce((n, s) => n + s.screens, 0)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const between = (t: number, [a, b]: number[]) => clamp01((t - a) / (b - a))
const smooth = (x: number) => x * x * (3 - 2 * x)

/** Scroll position (in screens) → video time. */
function timeAt(screens: number) {
  let acc = 0
  for (const seg of robotTimeline) {
    if (screens <= acc + seg.screens) return seg.from + (seg.to - seg.from) * ((screens - acc) / seg.screens)
    acc += seg.screens
  }
  return robotVideo.duration
}

/**
 * Skills section ("Meet Abhishek"). The video (walk → spin/transform → ring → dissolve) is scrubbed
 * by scroll. Tiles burst from the robot's hands into 7 rings anchored on the
 * glowing ring; the page holds there so visitors can drag / hover / click.
 * Reduced motion / no WebGL: a still of the ring frame + a flat skill grid.
 */
export default function RobotSkills() {
  const [mode] = useState<'scroll' | 'static'>(() => (prefersReducedMotion() || !supportsWebGL() ? 'static' : 'scroll'))
  if (mode === 'static') return <StaticHero />
  return <ScrollHero />
}

function ScrollHero() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const intro = useRef<HTMLDivElement>(null)
  const api = useRef<RobotOrbitApi | null>(null)
  const [mobile] = useState(isMobileViewport)
  const variant = mobile ? robotVideo.mobile : robotVideo.desktop
  const [ready, setReady] = useState(false)
  const [loadPct, setLoadPct] = useState(0)
  const [interactive, setInteractive] = useState(false)
  const [focus, setFocus] = useState<number | null>(null)
  const [tip, setTip] = useState<Tip>(null)
  // Nothing heavy loads until the section is within ~2 screens.
  const [near, setNear] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: '200% 0px' })
    io.observe(root.current!)
    return () => io.disconnect()
  }, [])

  // Phones: only the top 20 tiles (every ring keeps at least one).
  const groups: OrbitGroup[] = useMemo(
    () => (mobile ? orbitGroups.map((g) => ({ ...g, tiles: g.tiles.filter((t) => mobileTopSkills.includes(t.label)) })) : orbitGroups),
    [mobile],
  )

  // Load the video fully as a blob so scrubbing never stalls on the network.
  useEffect(() => {
    if (!near) return
    let url = ''
    let alive = true
    ;(async () => {
      try {
        const res = await fetch(variant.src)
        const total = Number(res.headers.get('content-length')) || 0
        const reader = res.body!.getReader()
        const chunks: Uint8Array[] = []
        let got = 0
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
          got += value.length
          if (total && alive) setLoadPct(Math.round((got / total) * 100))
        }
        if (!alive) return
        url = URL.createObjectURL(new Blob(chunks as BlobPart[], { type: 'video/mp4' }))
        const v = video.current!
        v.src = url
        v.addEventListener('loadeddata', () => alive && setReady(true), { once: true })
        v.load()
        // iOS only allows seeking after playback has started once.
        v.play().then(() => v.pause()).catch(() => {})
      } catch {
        if (video.current) (video.current.src = variant.src), setReady(true)
      }
    })()
    return () => {
      alive = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [variant.src, near])

  // Three.js layer (lazy).
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

  /** Map a point on the source frame to stage pixels (object-fit cover/contain + crop). */
  const toStage = (sx: number, sy: number) => {
    const r = stage.current!.getBoundingClientRect()
    const scale = variant.fit === 'cover' ? Math.max(r.width / variant.aspect, r.height) : Math.min(r.width / variant.aspect, r.height)
    const dw = scale * variant.aspect
    const dh = scale
    return { x: (r.width - dw) / 2 + ((sx - variant.crop.x) / variant.crop.w) * dw, y: (r.height - dh) / 2 + sy * dh, dw }
  }
  const placeAnchor = () => {
    if (!api.current || !stage.current) return
    const c = toStage(robotAnchors.ring.x, robotAnchors.ring.y)
    api.current.setAnchor({
      cx: c.x,
      cy: c.y,
      radius: (robotAnchors.ring.halfWidth / variant.crop.w) * c.dw,
      hands: robotAnchors.hands.map((h) => toStage(h.x, h.y)),
    })
  }
  useEffect(() => {
    const ro = new ResizeObserver(placeAnchor)
    ro.observe(stage.current!)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Scroll → video time + overlays.
  useEffect(() => {
    const v = video.current!
    let target = 0
    let raf = 0
    const scrub = () => {
      if (v.readyState >= 2 && !v.seeking && Math.abs(v.currentTime - target) > 0.02) v.currentTime = target
      raf = requestAnimationFrame(scrub)
    }
    raf = requestAnimationFrame(scrub)

    let lastInteractive = false
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const screens = self.progress * TOTAL
        const t = timeAt(screens)
        target = Math.min(t, robotVideo.duration - 0.05)

        // Intro text: subline fades in, then the block slides to the top-left.
        const el = intro.current
        if (el) {
          const nameIn = smooth(between(t, robotBeats.nameIn))
          const aside = smooth(between(t, robotBeats.aside))
          const H = window.innerHeight
          // Phones: start above his head (the frame's letterbox); desktop: left, mid-height.
          const y0 = mobile ? 70 : H / 2 - el.offsetHeight / 2
          const y1 = mobile ? 64 : 78
          el.style.transform = `translate3d(0, ${y0 + (y1 - y0) * aside}px, 0) scale(${1 - aside * (mobile ? 0.45 : 0.55)})`
          el.style.setProperty('--in', String(nameIn))
          el.style.opacity = String(1 - smooth(between(t, robotBeats.burst)))
        }

        const reveal = between(t, robotBeats.burst)
        const dissolve = smooth(between(t, robotBeats.dissolve))
        api.current?.setReveal(reveal)
        api.current?.setDissolve(dissolve)

        const on = t >= robotBeats.interactive[0] && t <= robotBeats.interactive[1]
        if (on !== lastInteractive) {
          lastInteractive = on
          setInteractive(on)
          api.current?.setInteractive(on)
          if (!on) setFocus(null)
        }

        // Last part of the tail: the stage becomes a card and lets the page through.
        const tail = clamp01((screens - (TOTAL - 0.45)) / 0.45)
        if (stage.current) {
          stage.current.style.transform = `scale(${1 - tail * 0.08})`
          stage.current.style.borderRadius = `${tail * 40}px`
        }
      },
    })
    const io = new IntersectionObserver(([e]) => api.current?.setVisible(e.isIntersecting))
    io.observe(root.current!)
    return () => {
      cancelAnimationFrame(raf)
      st.kill()
      io.disconnect()
    }
  }, [mobile])

  useEffect(() => {
    api.current?.focus(focus)
  }, [focus])

  const active = focus !== null ? orbitGroups[focus] : null
  const total = groups.reduce((n, g) => n + g.tiles.length, 0)

  return (
    <section ref={root} className="rh" data-nav="dark" style={{ height: `${(TOTAL + 1) * 100}vh` }} aria-labelledby="rh-title">
      {/* Jump target for "Toolkit" — lands on the hold. */}
      <span id="skills" className="rh-anchor" style={{ top: `${(HOLD_AT + 0.4) * 100}vh` }} aria-hidden="true" />

      <div ref={stage} className="rh-stage">
        <video ref={video} className={`rh-video rh-${variant.fit}`} muted playsInline preload="none" aria-hidden="true" />
        {!ready && <img className={`rh-video rh-${variant.fit}`} src={robotVideo.poster} alt="" loading="lazy" aria-hidden="true" />}
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
              <h2 className="rh-panel-title">{active.name}</h2>
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

        {!ready && (
          <p className="rh-loading" aria-hidden="true">
            Loading {loadPct}%
          </p>
        )}
      </div>

      {/* Screen readers: the full skill list. */}
      <SkillList className="sr-only" />
    </section>
  )
}

function SkillList({ className = '' }: { className?: string }) {
  return (
    <div className={`orbit-flat ${className}`}>
      {orbitGroups.map((g) => (
        <div key={g.id} className="flat-group">
          <h3 style={{ '--c': g.color } as React.CSSProperties}>
            <i aria-hidden="true" />
            {g.name} <span>{g.tiles.length}</span>
          </h3>
          <ul>
            {g.tiles.map((t) => (
              <li key={t.full} style={{ '--c': g.color } as React.CSSProperties}>
                {t.icon && (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d={t.icon.path} />
                  </svg>
                )}
                <span>{t.icon ? t.label : t.full}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function StaticHero() {
  return (
    <section className="rh-static" data-nav="dark" aria-labelledby="rh-title">
      <div className="rh-static-media">
        <img src={robotVideo.ringPoster} alt="Abhishek’s robot avatar with a glowing ring" />
      </div>
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
      <div id="skills" className="wrap">
        <h2 className="h-section h-light rh-static-skills">The stack behind the agents.</h2>
        <SkillList />
      </div>
    </section>
  )
}
