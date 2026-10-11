import { lazy, Suspense } from 'react';
import { Reveal } from '../components/Reveal';
import { SectionHeading } from '../components/SectionHeading';
import { useInView } from '../hooks/useInView';

// Separate chunk: only fetched when the section approaches the viewport.
const MarketDemo = lazy(() => import('./demo/MarketDemo'));

function DemoSkeleton() {
  return (
    <div
      className="border-line-strong bg-bg-elev/60 grid h-[640px] place-items-center rounded-2xl border lg:h-[480px]"
      aria-busy="true"
    >
      <span className="text-fg-subtle font-mono text-xs">Loading simulator…</span>
    </div>
  );
}

const notes = [
  [
    'Per-symbol subscriptions',
    'useSyncExternalStore on one symbol each; a tick re-renders one row, not the list.',
  ],
  [
    'Throttled publishing',
    '20Hz raw ticks, quotes batched to 4Hz for React. The chart reads the raw stream.',
  ],
  ['Canvas, rAF-coalesced', 'The chart draws off the React tree, at most once per frame.'],
  ['Pauses itself', 'Streaming stops when the demo scrolls off-screen or the tab is hidden.'],
] as const;

export function Demo() {
  const [ref, near] = useInView<HTMLDivElement>({ rootMargin: '600px 0px', once: true });

  return (
    <section id="demo" aria-labelledby="demo-title" className="container-page py-24 sm:py-32">
      <SectionHeading
        id="demo-title"
        index="04"
        eyebrow="Live demo"
        title="A trading screen, simulated."
        lede="Streaming ticks, a live candlestick chart, a watchlist, and an order ticket. Every price here is random and generated in your browser. Nothing touches a real market or network."
      />

      <Reveal>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="bg-accent-soft text-accent-text rounded-full px-3 py-1 font-mono text-xs font-medium">
            ⚠ Simulation · not real market data
          </span>
          <span className="text-fg-subtle text-xs">
            Try: switch symbols, place a limit order, or drop the connection.
          </span>
        </div>
        <div ref={ref}>
          {near ? (
            <Suspense fallback={<DemoSkeleton />}>
              <MarketDemo />
            </Suspense>
          ) : (
            <DemoSkeleton />
          )}
        </div>
      </Reveal>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {notes.map(([title, body], i) => (
          <Reveal as="li" key={title} delay={i * 0.05} className="border-line border-l-2 pl-4">
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-fg-muted mt-1 text-sm leading-relaxed">{body}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
