import { Reveal } from './Reveal';

interface SectionHeadingProps {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  lede?: string;
}

/** Numbered section header. `id` is used for aria-labelledby on the parent section. */
export function SectionHeading({ id, index, eyebrow, title, lede }: SectionHeadingProps) {
  return (
    <Reveal className="mb-10 max-w-2xl sm:mb-14">
      <p className="eyebrow mb-3">
        <span className="text-fg-subtle">{index}</span> / {eyebrow}
      </p>
      <h2 id={id} className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {lede && <p className="text-fg-muted mt-4 text-lg text-pretty">{lede}</p>}
    </Reveal>
  );
}
