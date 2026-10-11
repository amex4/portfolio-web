import { useReducedMotion } from 'framer-motion';
import { useCountUp } from '../hooks/useCountUp';
import { useInView } from '../hooks/useInView';
import { metrics, type Metric } from '../data/content';

function Counter({ metric, start, instant }: { metric: Metric; start: boolean; instant: boolean }) {
  const value = useCountUp(metric.value, start, instant);
  const final = `${metric.prefix ?? ''}${metric.value}${metric.suffix}`;
  return (
    <div className="bg-bg flex flex-col p-6 sm:p-8">
      <dt className="order-2 mt-3">
        <span className="text-fg block font-medium">{metric.label}</span>
        <span className="text-fg-subtle mt-1 block text-sm leading-relaxed">{metric.detail}</span>
      </dt>
      <dd className="order-1 font-mono text-5xl font-medium tracking-tight tabular-nums sm:text-6xl">
        {/* Screen readers get the final value, not every animation frame. */}
        <span className="sr-only">{final}</span>
        <span aria-hidden="true">
          <span className="text-fg-subtle">{metric.prefix}</span>
          {value}
          <span className="text-accent-text">{metric.suffix}</span>
        </span>
      </dd>
    </div>
  );
}

export function Impact() {
  const [ref, inView] = useInView<HTMLDListElement>({ rootMargin: '0px 0px -15% 0px', once: true });
  const reduce = useReducedMotion() ?? false;

  return (
    <section aria-labelledby="impact-title" className="border-line relative border-y">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="container-page relative py-16 sm:py-20">
        <h2 id="impact-title" className="eyebrow mb-8">
          Impact, by the numbers
        </h2>
        <dl
          ref={ref}
          className="bg-line border-line grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-4"
        >
          {metrics.map((m) => (
            <Counter key={m.label} metric={m} start={inView} instant={reduce} />
          ))}
        </dl>
      </div>
    </section>
  );
}
