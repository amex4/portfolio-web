import { m } from 'framer-motion';
import { ButtonLink } from '../components/Button';
import { ArrowRight, Download, Mail } from '../components/Icons';
import { hero, profile } from '../data/content';
import { HeroTicker } from './HeroTicker';

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden pt-16">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, var(--accent-soft), transparent)' }}
      />

      <div className="container-page relative flex min-h-[calc(88svh-4rem)] flex-col justify-center py-20 sm:py-28">
        <m.p className="eyebrow mb-6 flex flex-wrap items-center gap-x-2 gap-y-1" {...fade(0)}>
          <span aria-hidden="true" className="bg-up pulse-dot size-1.5 rounded-full" />
          <span className="text-fg">{profile.name}</span>
          <span aria-hidden="true" className="text-fg-subtle">
            ·
          </span>
          {hero.eyebrow}
        </m.p>

        {/* Headline and lede are not animated in: they're the LCP candidates and should paint immediately. */}
        <h1
          id="hero-title"
          className="max-w-4xl text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.98] font-semibold tracking-[-0.035em] text-balance"
        >
          {hero.headline[0]} <span className="text-accent-text">{hero.headline[1]}</span>
        </h1>

        <p className="text-fg-muted mt-7 max-w-2xl text-lg text-pretty sm:text-xl">{hero.sub}</p>

        <m.div className="mt-10 flex flex-wrap gap-3" {...fade(0.15)}>
          <ButtonLink href="#work" icon={<ArrowRight />}>
            View work
          </ButtonLink>
          <ButtonLink
            href={`${import.meta.env.BASE_URL}${profile.resumeUrl.replace(/^\//, '')}`}
            variant="ghost"
            download
            icon={<Download />}
          >
            Download resume
          </ButtonLink>
          <ButtonLink href="#contact" variant="ghost" icon={<Mail />}>
            Contact
          </ButtonLink>
        </m.div>
      </div>

      <HeroTicker />
    </section>
  );
}
