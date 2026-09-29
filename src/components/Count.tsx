import { useRef } from 'react'
import { gsap } from '../lib/lenis'
import { useGsap } from '../hooks/useGsap'

/**
 * Counts the leading number in a string ("2,000+", "~40%", "205 MB") up from zero
 * on enter. The final text is in the DOM from the start (no-JS / reduced motion).
 */
export default function Count({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const m = value.match(/^(\D*)([\d,.]+)(.*)$/)
  useGsap(ref, () => {
    if (!m) return
    const [, pre, num, post] = m
    const target = parseFloat(num.replace(/,/g, ''))
    const decimals = num.includes('.') ? num.split('.')[1].length : 0
    const o = { v: 0 }
    const el = ref.current!
    gsap.to(o, {
      v: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: () => {
        el.textContent = pre + o.v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + post
      },
    })
  })
  return <span ref={ref}>{value}</span>
}
