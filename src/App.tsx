import { useEffect, useState } from 'react'
import { LazyMotion } from 'framer-motion'
import Background from './components/Background'
import Loader from './components/Loader'
import Cursor from './components/Cursor'
import TopBar from './components/TopBar'
import GraphNav from './components/GraphNav'
import CommandPalette from './components/CommandPalette'
import Hero from './sections/Hero'
import About from './sections/About'
import Experience from './sections/Experience'
import Projects from './sections/Projects'
import Skills from './sections/Skills'
import Contact from './sections/Contact'
import { initSmoothScroll } from './lib/lenis'
import { initStationTracker } from './lib/stationTracker'
import { scrollState } from './lib/scrollState'
import { footer, site } from './data/content'

const loadMotion = () => import('framer-motion').then((m) => m.domAnimation)

export default function App() {
  const [palette, setPalette] = useState(false)

  useEffect(() => {
    initSmoothScroll()
    const stop = initStationTracker()
    const move = (e: PointerEvent) => {
      scrollState.pointerX = (e.clientX / window.innerWidth) * 2 - 1
      scrollState.pointerY = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      stop()
      window.removeEventListener('pointermove', move)
    }
  }, [])

  return (
    <LazyMotion features={loadMotion} strict>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Background />
      <Loader />
      <Cursor />
      <TopBar onPalette={() => setPalette(true)} />
      <GraphNav />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <footer className="footer section">
        <p className="mono">
          © {new Date().getFullYear()} {site.name} · {footer.joke}
        </p>
        <p className="mono">
          <a href={site.webforge} target="_blank" rel="noopener">
            {footer.credit}
          </a>
        </p>
      </footer>
      <CommandPalette open={palette} setOpen={setPalette} />
    </LazyMotion>
  )
}
