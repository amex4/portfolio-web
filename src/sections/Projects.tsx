import { AnimatePresence, m } from 'framer-motion';
import { useId, useState } from 'react';
import { Plus } from '../components/Icons';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';
import { projects, type Project } from '../data/content';

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <Reveal
      as="article"
      delay={index * 0.06}
      className="panel group relative flex flex-col p-6 transition-colors hover:border-line-strong sm:p-8"
    >
      <p className="text-fg-subtle font-mono text-xs">
        <span className="text-accent-text">{String(index + 1).padStart(2, '0')}</span> ·{' '}
        {project.kicker}
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-balance">{project.title}</h3>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="text-fg-subtle mb-2 font-mono text-xs tracking-wider uppercase">
            Problem
          </h4>
          <p className="text-fg-muted leading-relaxed">{project.problem}</p>
        </div>
        <div>
          <h4 className="text-fg-subtle mb-2 font-mono text-xs tracking-wider uppercase">Impact</h4>
          <p className="text-fg leading-relaxed">{project.impact}</p>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id={panelId}
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-line mt-6 border-t pt-6">
              <h4 className="text-fg-subtle mb-3 font-mono text-xs tracking-wider uppercase">
                What I built
              </h4>
              <ul className="space-y-2.5">
                {project.built.map((b) => (
                  <li key={b} className="text-fg-muted flex gap-3 leading-relaxed">
                    <span
                      aria-hidden="true"
                      className="text-accent-text mt-[0.2em] font-mono text-xs"
                    >
                      ▸
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <ul className="flex flex-wrap gap-2" aria-label="Technologies">
          {project.tech.map((t) => (
            <li
              key={t}
              className="border-line text-fg-muted rounded-full border px-2.5 py-1 font-mono text-xs"
            >
              {t}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          {project.anchor && (
            <a
              href={project.anchor.href}
              className="text-accent-text min-h-11 content-center px-2 text-sm font-semibold underline-offset-4 hover:underline"
            >
              {project.anchor.label} →
            </a>
          )}
          {project.links?.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="text-accent-text min-h-11 content-center px-2 text-sm font-semibold underline-offset-4 hover:underline"
            >
              {l.label} ↗
            </a>
          ))}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={panelId}
            className="border-line-strong hover:bg-surface-strong inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors"
          >
            {open ? 'Less' : 'Case study'}
            <Plus
              width={16}
              height={16}
              className={`transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
            />
            <span className="sr-only"> for {project.title}</span>
          </button>
        </div>
      </div>
    </Reveal>
  );
}

export function Projects() {
  return (
    <section id="work" aria-labelledby="work-title" className="container-page py-24 sm:py-32">
      <SectionHeading
        id="work-title"
        index="03"
        eyebrow="Featured work"
        title="Case studies"
        lede="Client work is confidential, so these describe the problem, the approach, and the outcome, not the internals."
      />
      <div className="grid gap-5">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} />
        ))}
      </div>
    </section>
  );
}
