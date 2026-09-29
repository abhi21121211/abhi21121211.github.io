import { Fragment, useRef } from 'react'
import { gsap } from '../../lib/lenis'
import { parseAccent, plain } from '../../lib/accent'
import { useGsap } from '../../hooks/useGsap'
import { loaderDone } from '../Loader'

type Props = {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  id?: string
  /** Play on load (after the loader) instead of on scroll. */
  onLoad?: boolean
  delay?: number
}

/** Each word rises out of its own mask. `*word*` renders in serif italic. */
export default function Words({ text, as: Tag = 'h2', className = '', id, onLoad, delay = 0 }: Props) {
  const ref = useRef<HTMLHeadingElement>(null)
  useGsap(ref, () => {
    const words = ref.current!.querySelectorAll('.w')
    const vars: gsap.TweenVars = { yPercent: 118, rotate: 5, duration: 1.2, ease: 'expo.out', stagger: 0.05, delay }
    if (onLoad) {
      gsap.set(words, { yPercent: 118 })
      loaderDone.then(() => gsap.fromTo(words, { yPercent: 118, rotate: 5 }, { ...vars, yPercent: 0, rotate: 0 }))
    } else {
      gsap.from(words, { ...vars, scrollTrigger: { trigger: ref.current, start: 'top 88%', once: true } })
    }
  })
  return (
    <Tag ref={ref} id={id} className={`words ${className}`} aria-label={plain(text)}>
      {parseAccent(text).map((t, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <span className="w-mask" aria-hidden="true">
            <span className={t.accent ? 'w serif' : 'w'}>{t.word}</span>
          </span>
        </Fragment>
      ))}
    </Tag>
  )
}
