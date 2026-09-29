import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './env'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

export function initSmoothScroll() {
  if (prefersReducedMotion() || lenis) return lenis
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis?.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

/** Scroll to an element id or 'top'. Falls back to native scrolling. */
export function scrollToTarget(target: string) {
  const el = target === 'top' ? null : document.getElementById(target)
  if (target !== 'top' && !el) return
  if (lenis) {
    lenis.scrollTo(el ?? 0, { offset: el ? -24 : 0, duration: 1.6 })
  } else {
    if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    else window.scrollTo({ top: 0 })
  }
  if (el) {
    // Move focus for keyboard + screen-reader users without a second jump.
    const focusable = el.querySelector<HTMLElement>('h1, h2') ?? el
    focusable.setAttribute('tabindex', '-1')
    focusable.focus({ preventScroll: true })
  }
}

export { gsap, ScrollTrigger }
