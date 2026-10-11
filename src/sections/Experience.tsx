import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';
import { experience } from '../data/content';

export function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="container-page py-24 sm:py-32"
    >
      <SectionHeading
        id="experience-title"
        index="02"
        eyebrow="Experience"
        title="From testing UIs to building the ones traders rely on."
      />
      <ol className="relative">
        {/* Timeline rail */}
        <span
          aria-hidden="true"
          className="from-accent via-line-strong absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b to-transparent md:left-[calc(200px+7px)]"
        />
        {experience.map((role, i) => {
          const current = role.end === 'Present';
          return (
            <Reveal
              as="li"
              key={role.company}
              delay={i * 0.05}
              className="relative pb-14 last:pb-0"
            >
              <div className="grid gap-3 pl-9 md:grid-cols-[200px_1fr] md:gap-10 md:pl-0">
                <div className="text-fg-subtle font-mono text-sm md:pt-0.5 md:text-right md:pr-6">
                  <time dateTime={role.startISO}>{role.start}</time>
                  {' – '}
                  {role.endISO ? <time dateTime={role.endISO}>{role.end}</time> : role.end}
                  <span className="mt-1 block text-xs">{role.location}</span>
                </div>

                <span
                  aria-hidden="true"
                  className={`absolute top-1.5 left-0 grid size-[15px] place-items-center rounded-full border md:left-[200px] ${
                    current ? 'border-accent bg-accent-soft' : 'border-line-strong bg-bg'
                  }`}
                >
                  <span
                    className={`size-[5px] rounded-full ${current ? 'bg-accent pulse-dot' : 'bg-fg-subtle'}`}
                  />
                </span>

                <article className="md:pl-6">
                  <h3 className="text-xl font-semibold tracking-tight">
                    {role.company}
                    {current && (
                      <span className="bg-accent-soft text-accent-text ml-3 rounded-full px-2 py-0.5 align-middle font-mono text-[10px] tracking-wider uppercase">
                        Current
                      </span>
                    )}
                  </h3>
                  <p className="text-fg-muted mt-0.5">{role.title}</p>
                  <p className="text-fg-subtle mt-3 text-sm">{role.summary}</p>
                  <ul className="mt-4 space-y-2.5">
                    {role.highlights.map((h) => (
                      <li key={h} className="text-fg-muted flex gap-3 leading-relaxed">
                        <span
                          aria-hidden="true"
                          className="text-accent-text mt-[0.2em] font-mono text-xs"
                        >
                          ▸
                        </span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}
