import { useEffect, useRef, useState } from 'react'
import { light } from '../data/content'
import { orbitExtra, orbitGroups, orbitVideo } from '../data/orbit'
import type { HoverInfo, OrbitApi } from '../orbit/engine'
import { isMobileViewport, prefersReducedMotion, supportsWebGL } from '../lib/env'
import Reveal from '../components/Reveal'

const total = orbitGroups.reduce((n, g) => n + g.tiles.length, 0)

/**
 * "Orbit of skills": Abhishek (video) in the centre, 7 rings of glass skill
 * tiles around him (Three.js, lazy-loaded). Drag to spin, hover to enlarge,
 * click a group to pull its ring forward; the hand sweep swirls the tiles.
 * Phones / reduced motion / no WebGL: the video plus a flat grouped grid.
 */
export default function Orbit() {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const api = useRef<OrbitApi | null>(null)
  const [mode] = useState<'3d' | 'flat'>(() => (prefersReducedMotion() || isMobileViewport() || !supportsWebGL() ? 'flat' : '3d'))
  const [focus, setFocus] = useState<number | null>(null)
  const [hover, setHover] = useState<HoverInfo>(null)
  const [ready, setReady] = useState(false)

  // Lazy-load the engine when the section is near the viewport.
  useEffect(() => {
    if (mode !== '3d') return
    let disposed = false
    const io = new IntersectionObserver(
      async ([e]) => {
        if (!e.isIntersecting || api.current) return
        io.disconnect()
        const { createOrbit } = await import('../orbit/engine')
        if (disposed || !canvas.current || !video.current) return
        api.current = createOrbit(canvas.current, video.current, orbitVideo.aspect, orbitGroups, setHover)
        setReady(true)
      },
      { rootMargin: '600px 0px' },
    )
    io.observe(root.current!)
    return () => {
      disposed = true
      io.disconnect()
      api.current?.dispose()
      api.current = null
    }
  }, [mode])

  // Play/pause the video and the render loop with visibility.
  useEffect(() => {
    const v = video.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => {
      api.current?.setVisible(e.isIntersecting)
      if (e.isIntersecting && !prefersReducedMotion()) v.play().catch(() => {})
      else v.pause()
    })
    io.observe(root.current!)
    return () => io.disconnect()
  }, [])

  // Hand sweep → swirl, once per loop when playback crosses `sweepAt`.
  useEffect(() => {
    const v = video.current
    if (!v || mode !== '3d') return
    let last = 0
    const onTime = () => {
      const t = v.currentTime
      if ((last < orbitVideo.sweepAt && t >= orbitVideo.sweepAt) || (t < last && t >= orbitVideo.sweepAt)) api.current?.sweep(orbitVideo.sweepDir)
      last = t
    }
    v.addEventListener('timeupdate', onTime)
    return () => v.removeEventListener('timeupdate', onTime)
  }, [mode])

  useEffect(() => {
    api.current?.focus(focus)
  }, [focus, ready])

  return (
    <section id="skills" ref={root} className={`band band-black orbit orbit-${mode}`} data-nav="dark" aria-labelledby="orbit-h">
      <Reveal className="wrap center orbit-head">
        <p className="eyebrow eyebrow-dark">{light.film.eyebrow} · Toolkit</p>
        <h2 id="orbit-h" className="h-section h-light">
          {light.film.title}
        </h2>
        <p className="lead lead-dark">{light.film.sub}</p>
        <p className="orbit-kicker">
          {orbitGroups.length} rings. {total} skills.{mode === '3d' && <span> Drag to spin — hover a tile.</span>}
        </p>
      </Reveal>

      {mode === '3d' ? (
        <div className="orbit-stage">
          <canvas ref={canvas} className={`orbit-canvas${ready ? ' is-ready' : ''}`} aria-hidden="true" />
          {!ready && <img className="orbit-poster" src={orbitVideo.poster} alt="" aria-hidden="true" />}
          {hover && (
            <div className="orbit-tip" style={{ left: hover.x, top: hover.y, '--c': hover.color } as React.CSSProperties} aria-hidden="true">
              <b>{hover.label}</b>
              <span>{hover.group}</span>
            </div>
          )}
        </div>
      ) : null}

      {/* Source for the WebGL texture (hidden) or the visible centre piece on phones. */}
      <video
        ref={video}
        className={mode === '3d' ? 'orbit-video-src' : 'orbit-video'}
        muted
        loop
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
        poster={orbitVideo.poster}
        aria-label="Abhishek Dukare in a studio"
      >
        <source src={orbitVideo.mp4} type="video/mp4" />
      </video>

      {mode === '3d' && (
        <div className="wrap orbit-groups" role="group" aria-label="Pull a ring forward">
          {orbitGroups.map((g, i) => (
            <button key={g.id} type="button" className="orbit-chip" aria-pressed={focus === i} style={{ '--c': g.color } as React.CSSProperties} onClick={() => setFocus(focus === i ? null : i)}>
              <i aria-hidden="true" />
              {g.name}
              <span>{g.tiles.length}</span>
            </button>
          ))}
        </div>
      )}

      {/* Flat grid: visible on phones / reduced motion; screen-reader list on desktop. */}
      <div className={`wrap orbit-flat${mode === '3d' ? ' sr-only' : ''}`}>
        {orbitGroups.map((g) => (
          <Reveal key={g.id} className="flat-group" stagger={0.03} y={16}>
            <h3 style={{ '--c': g.color } as React.CSSProperties}>
              <i aria-hidden="true" />
              {g.name} <span>{g.tiles.length}</span>
            </h3>
            <ul>
              {g.tiles.map((t) => (
                <li key={t.full} title={t.full} style={{ '--c': g.color } as React.CSSProperties}>
                  {t.icon ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d={t.icon.path} />
                    </svg>
                  ) : null}
                  <span>{t.icon ? t.label : t.full}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      <p className="wrap orbit-extra">
        <span>Also — {orbitExtra.name}:</span> {orbitExtra.items.join(' · ')}
      </p>
    </section>
  )
}
