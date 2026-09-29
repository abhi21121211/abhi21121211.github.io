import { useRef } from 'react'
import { gsap } from '../../lib/lenis'
import { useGsap } from '../../hooks/useGsap'
import { loaderDone } from '../Loader'
import type { Photo } from '../../data/content'

type Props = { photo: Photo; className?: string; caption?: React.ReactNode; onLoad?: boolean; eager?: boolean; sizes?: string }

/** Clip-path wipe up + slow de-zoom on enter, then gentle scroll parallax. */
export default function ImageReveal({ photo, className = '', caption, onLoad, eager, sizes = '(max-width: 767px) 90vw, 40vw' }: Props) {
  const ref = useRef<HTMLElement>(null)
  useGsap(ref, () => {
    const el = ref.current!
    const img = el.querySelector('img')
    const inner = el.querySelector('.ir-inner')
    const tl = gsap.timeline({ paused: true })
    tl.from(el.querySelector('.ir-frame'), { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }).from(img, { scale: 1.4, duration: 2, ease: 'expo.out' }, 0.2)
    if (onLoad) loaderDone.then(() => tl.play())
    else gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true, onEnter: () => void tl.play() } })
    gsap.fromTo(inner, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
  })
  return (
    <figure ref={ref} className={`img-reveal ${className}`}>
      <div className="ir-frame">
        <div className="ir-inner">
          <img
            src={photo.src}
            srcSet={`${photo.srcSm} 640w, ${photo.src} 1100w`}
            sizes={sizes}
            alt={photo.alt}
            width={photo.w}
            height={photo.h}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : undefined}
            decoding="async"
          />
        </div>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
