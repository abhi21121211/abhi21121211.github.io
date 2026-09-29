import { useRef, type ReactNode, type CSSProperties } from 'react'
import { gsap } from '../lib/lenis'
import { useGsap } from '../hooks/useGsap'

type Props = { children: ReactNode; className?: string; as?: 'div' | 'section' | 'ul' | 'p' | 'h2' | 'h3'; y?: number; delay?: number; stagger?: number; children_?: boolean; style?: CSSProperties; id?: string }

/**
 * Apple-style entrance: a short rise with a long, soft ease.
 * `stagger` animates direct children instead of the element itself.
 */
export default function Reveal({ children, className = '', as: Tag = 'div', y = 36, delay = 0, stagger, style, id }: Props) {
  const ref = useRef<HTMLElement>(null)
  useGsap(ref, () => {
    const el = ref.current!
    const targets = stagger ? el.children : el
    gsap.from(targets, { y, opacity: 0, duration: 1.3, delay, ease: 'power3.out', stagger, scrollTrigger: { trigger: el, start: 'top 86%', once: true } })
  })
  return (
    <Tag ref={ref as React.Ref<never>} className={className} style={style} id={id}>
      {children}
    </Tag>
  )
}
