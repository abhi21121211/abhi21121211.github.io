import { useEffect, useState } from 'react'
import { LazyMotion, domMax } from 'framer-motion'
import Nav from './components/Nav'
import Footer from './components/Footer'
import CommandPalette from './components/CommandPalette'
import Hero from './sections/Hero'
import About from './sections/About'
import IngestIQ from './sections/IngestIQ'
import RobotSkills from './sections/RobotSkills'
import Work from './sections/Work'
import Projects from './sections/Projects'
import Webforge from './sections/Webforge'
import Life from './sections/Life'
import Contact from './sections/Contact'
import { initSmoothScroll } from './lib/lenis'

export default function App() {
  const [palette, setPalette] = useState(false)
  useEffect(() => void initSmoothScroll(), [])

  return (
    <LazyMotion features={domMax} strict>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav onPalette={() => setPalette(true)} />
      <main id="main">
        <Hero />
        <About />
        <IngestIQ />
        <RobotSkills />
        <Work />
        <Projects />
        <Webforge />
        <Life />
        <Contact />
      </main>
      <Footer />
      <CommandPalette open={palette} setOpen={setPalette} />
    </LazyMotion>
  )
}
