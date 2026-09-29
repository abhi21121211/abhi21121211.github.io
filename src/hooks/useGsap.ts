import { useLayoutEffect, type DependencyList, type RefObject } from 'react'
import { gsap } from '../lib/lenis'
import { prefersReducedMotion } from '../lib/env'

/**
 * Runs GSAP setup scoped to `scope`, reverted on unmount (StrictMode-safe).
 * Skipped entirely under reduced motion, so content is visible by default.
 */
export function useGsap(scope: RefObject<Element | null>, setup: (ctx: gsap.Context) => void, deps: DependencyList = []) {
  useLayoutEffect(() => {
    if (!scope.current || prefersReducedMotion()) return
    const ctx = gsap.context(setup, scope.current)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
