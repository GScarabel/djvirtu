import { Hero } from '../components/sections/Hero';
import { About } from '../components/sections/About';
import { Gallery } from '../components/sections/Gallery';
import { Videos } from '../components/sections/Videos';
import { Events } from '../components/sections/Events';
import { Contact } from '../components/sections/Contact';
import { Navbar } from '../components/ui/Navbar';
import { Footer } from '../components/ui/Footer';
import { ParticleBackground } from '../components/ui/ParticleBackground';

export function Home() {
  return (
    <div className="relative">
            <ParticleBackground />
      <Navbar />
      <main className="relative">
        <Hero />
        <About />
        <Gallery />
        <Videos />
        <Events />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
