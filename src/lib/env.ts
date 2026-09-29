const mq = (q: string) => typeof window !== 'undefined' && window.matchMedia(q).matches

export const prefersReducedMotion = () => mq('(prefers-reduced-motion: reduce)')
export const isMobileViewport = () => mq('(max-width: 767px)')
export const hasFinePointer = () => mq('(hover: hover) and (pointer: fine)')

export function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
