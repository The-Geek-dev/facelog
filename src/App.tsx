import { Hero } from './components/Hero'
import { Portfolio } from './components/Portfolio'
import { About } from './components/About'
import { Services } from './components/Services'
import { Awards } from './components/Awards'
import { StudentRegistration } from './components/Student Registration'  
import { LiveDemo } from './components/LiveDemo'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="relative" role="main">
        <section id="hero">
          <Hero />
        </section>
        <section id="features">
          <Portfolio />
        </section>
        <section id="how-it-works">
          <About />
        </section>
        <section id="benefits">
          <Services />
        </section>
        <section id="stats">
          <Awards />
        </section>
        <section id="register">           {/* ← ADD THIS SECTION */}
          <StudentRegistration />
        </section>
        <section id="demo">
          <LiveDemo />
        </section>
        <section id="contact">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  )
}
