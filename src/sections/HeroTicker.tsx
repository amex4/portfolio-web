import { memo, useEffect, useState } from 'react';
import { hero } from '../data/content';
import { useInView } from '../hooks/useInView';

/**
 * Decorative, lightweight ticker tape. Deliberately independent of the demo feed so the
 * demo chunk stays lazy. Values update every 1.5s (only while visible); the scroll is pure CSS.
 */
const SEED = [
  ['NOVA', 2847.5],
  ['ORBT', 1236.2],
  ['HLIX', 612.35],
  ['QNTM', 1789.9],
  ['APEX', 948.15],
  ['ZNTH', 431.6],
  ['LUMA', 322.8],
  ['VRTX', 2104.45],
] as const;

interface Item {
  s: string;
  p: number;
  pct: number;
}

const initial: Item[] = SEED.map(([s, p]) => ({ s, p, pct: (Math.random() - 0.45) * 2 }));

const Tape = memo(function Tape({ items, hidden }: { items: Item[]; hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={hidden || undefined}>
      {items.map((it) => (
        <li key={it.s} className="flex items-baseline gap-2.5 font-mono text-xs whitespace-nowrap">
          <span className="text-fg font-medium">{it.s}</span>
          <span className="tabular text-fg-muted">{it.p.toFixed(2)}</span>
          <span className={`tabular ${it.pct >= 0 ? 'text-up' : 'text-down'}`}>
            {it.pct >= 0 ? '▲' : '▼'} {Math.abs(it.pct).toFixed(2)}%
          </span>
        </li>
      ))}
    </ul>
  );
});

export function HeroTicker() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [items, setItems] = useState(initial);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      setItems((prev) =>
        prev.map((it) => {
          const d = (Math.random() - 0.5) * 0.004;
          return { ...it, p: it.p * (1 + d), pct: it.pct + d * 100 };
        }),
      );
    }, 1500);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <div
      ref={ref}
      className="marquee-wrap border-line bg-bg/60 relative border-y backdrop-blur-sm"
      role="region"
      aria-label={`${hero.tickerNote} (decorative, not real market data)`}
    >
      <div className="flex items-center">
        <span className="border-line bg-bg-elev text-accent-text relative z-10 shrink-0 border-r px-4 py-3 font-mono text-[10px] tracking-widest uppercase">
          {hero.tickerNote}
        </span>
        <div className="flex overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
          <div className="marquee flex w-max">
            <Tape items={items} />
            <Tape items={items} hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
