import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';
import { about } from '../data/content';

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="container-page py-24 sm:py-32">
      <SectionHeading id="about-title" index="01" eyebrow="About" title={about.heading} />
      <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
        <div className="text-fg-muted space-y-5 text-lg leading-relaxed text-pretty">
          {about.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <p>{p}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <dl className="panel divide-line divide-y backdrop-blur-sm">
            {about.facts.map((f) => (
              <div key={f.label} className="flex flex-col gap-1 px-5 py-4">
                <dt className="text-fg-subtle font-mono text-xs tracking-wider uppercase">
                  {f.label}
                </dt>
                <dd className="text-fg">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
