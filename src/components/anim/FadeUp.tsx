import { useRef, type ReactNode } from 'react'
import { gsap } from '../../lib/lenis'
import { useGsap } from '../../hooks/useGsap'

/** Staggered rise for a group's direct children. */
export default function FadeUp({ children, className = '', as: Tag = 'div', stagger = 0.08, y = 40 }: { children: ReactNode; className?: string; as?: 'div' | 'ul' | 'ol'; stagger?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useGsap(ref, () => {
    gsap.from(ref.current!.children, { y, opacity: 0, duration: 1.1, ease: 'expo.out', stagger, scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true } })
  })
  return (
    <Tag ref={ref as React.Ref<never>} className={className}>
      {children}
    </Tag>
  )
}
