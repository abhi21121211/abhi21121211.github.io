import { useEffect, useRef, useState } from 'react'
import type { Media } from '../data/content'
import { isMobileViewport } from '../lib/env'

/** Muted inline loop that only plays while on screen. Renders nothing if it fails. */
export default function LoopVideo({ media, className }: { media: Media; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)
  const portrait = isMobileViewport() && (media.mobileMp4 || media.mobileWebm)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.1 })
    io.observe(v)
    return () => io.disconnect()
  }, [])

  if (failed) return null
  const webm = portrait ? media.mobileWebm : media.webm
  const mp4 = portrait ? media.mobileMp4 : media.mp4
  return (
    <video ref={ref} className={className} poster={media.poster} muted playsInline loop preload="none" aria-hidden="true" onError={() => setFailed(true)}>
      {webm && <source src={webm} type="video/webm" />}
      {mp4 && <source src={mp4} type="video/mp4" onError={() => setFailed(true)} />}
    </video>
  )
}
