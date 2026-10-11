import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';
import { education } from '../data/content';

export function Education() {
  return (
    <section
      id="education"
      aria-labelledby="education-title"
      className="container-page py-24 sm:py-32"
    >
      <SectionHeading
        id="education-title"
        index="06"
        eyebrow="Education"
        title="Where it started."
      />
      <Reveal className="panel flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">{education.school}</h3>
          <p className="text-fg-muted mt-1">{education.degree}</p>
        </div>
        <p className="text-fg-subtle font-mono text-sm sm:text-right">
          <time dateTime={education.start}>{education.start}</time> –{' '}
          <time dateTime={education.end}>{education.end}</time>
          <span className="block">{education.location}</span>
        </p>
      </Reveal>
    </section>
  );
}
