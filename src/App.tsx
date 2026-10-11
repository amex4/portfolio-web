import { domAnimation, LazyMotion, MotionConfig } from 'framer-motion';
import { Footer } from './components/Footer';
import { Nav } from './components/Nav';
import { useTheme } from './hooks/useTheme';
import { About } from './sections/About';
import { Contact } from './sections/Contact';
import { Demo } from './sections/Demo';
import { Education } from './sections/Education';
import { Experience } from './sections/Experience';
import { Hero } from './sections/Hero';
import { Impact } from './sections/Impact';
import { Projects } from './sections/Projects';
import { Skills } from './sections/Skills';

export default function App() {
  const { theme, toggle } = useTheme();

  return (
    // LazyMotion + `m` components keep Framer's footprint to the features we use.
    // reducedMotion="user" disables transform/layout animation for prefers-reduced-motion.
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav theme={theme} onToggleTheme={toggle} />
        <main id="main">
          <Hero />
          <About />
          <Experience />
          <Projects />
          <Demo />
          <Skills />
          <Impact />
          <Education />
          <Contact />
        </main>
        <Footer />
      </MotionConfig>
    </LazyMotion>
  );
}
