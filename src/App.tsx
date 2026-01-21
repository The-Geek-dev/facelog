import { Hero } from './components/Hero'
import { Portfolio } from './components/Portfolio'
import { About } from './components/About'
import { Services } from './components/Services'
import { Awards } from './components/Awards'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ overflow: 'visible' }}>
      <main className="relative" role="main" style={{ overflow: 'visible' }}>
        <section id="hero" aria-label="Hero section">
          <Hero />
        </section>
        <section id="features" aria-label="Features section">
          <Portfolio />
        </section>
        <section id="how-it-works" aria-label="How it works section">
          <About />
        </section>
        <section id="benefits" aria-label="Benefits section">
          <Services />
        </section>
        <section id="stats" aria-label="Statistics section">
          <Awards />
        </section>
        <section id="contact" aria-label="Contact section">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  )
}