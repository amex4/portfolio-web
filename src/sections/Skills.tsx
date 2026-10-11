import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';
import { skills } from '../data/content';

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="container-page py-24 sm:py-32">
      <SectionHeading
        id="skills-title"
        index="05"
        eyebrow="Skills"
        title="The toolkit, grouped by what it's for."
      />
      <div className="bg-line grid gap-px overflow-hidden rounded-2xl border border-line sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((g, i) => (
          <Reveal key={g.title} delay={(i % 3) * 0.05} className="bg-bg p-6 sm:p-7">
            <h3 className="flex items-baseline justify-between gap-3 font-semibold">
              {g.title}
              <span className="text-fg-subtle font-mono text-xs font-normal">
                {String(g.items.length).padStart(2, '0')}
              </span>
            </h3>
            <p className="text-fg-subtle mt-1 text-sm">{g.blurb}</p>
            <ul className="mt-5 flex flex-wrap gap-x-1.5 gap-y-2">
              {g.items.map((item) => (
                <li
                  key={item}
                  className="bg-surface-strong text-fg-muted hover:text-fg rounded-md px-2 py-1 text-sm transition-colors"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
