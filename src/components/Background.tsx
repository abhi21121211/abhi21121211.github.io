import { lazy, Suspense, useEffect, useState } from 'react'
import StaticGraph from './StaticGraph'
import LoopVideo from './LoopVideo'
import { media } from '../data/content'
import { isMobileViewport, prefersReducedMotion, supportsWebGL } from '../lib/env'

const Scene = lazy(() => import('../three/Scene'))

/** Fixed layer behind all content: optional video → 3D graph (lazy) → static SVG fallback. */
export default function Background() {
  const [mount, setMount] = useState(false)
  const [ready, setReady] = useState(false)
  const [mobile] = useState(isMobileViewport)

  useEffect(() => {
    if (prefersReducedMotion() || !supportsWebGL()) return
    const go = () => setMount(true)
    if (mobile) {
      // Phones: compiling shaders blocks the main thread, so wait for the first
      // sign of intent. The static SVG graph covers the hero until then.
      const events = ['scroll', 'touchstart', 'pointerdown', 'keydown'] as const
      const once = () => {
        events.forEach((e) => window.removeEventListener(e, once))
        go()
      }
      events.forEach((e) => window.addEventListener(e, once, { passive: true }))
      return () => events.forEach((e) => window.removeEventListener(e, once))
    }
    // Desktop: wait for first paint + idle so hero text wins LCP.
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
    const start = () => (idle ? idle(go, { timeout: 1200 }) : setTimeout(go, 300))
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
  }, [mobile])

  return (
    <div className="bg-layer" aria-hidden="true">
      <StaticGraph hidden={ready} />
      {media.heroLoop && <LoopVideo media={media.heroLoop} className="bg-video" />}
      {mount && (
        <div className={`bg-canvas${ready ? ' is-ready' : ''}`}>
          <Suspense fallback={null}>
            <Scene mobile={mobile} bloom={!mobile && (navigator.hardwareConcurrency ?? 4) >= 4} onReady={() => setReady(true)} />
          </Suspense>
        </div>
      )}
      <div className="bg-vignette" />
    </div>
  )
}
