import { memo } from 'react';
import { SYMBOLS } from './feed';
import { fmtPct, fmtPrice } from './format';
import { useQuote } from './hooks';

interface RowProps {
  symbol: string;
  name: string;
  selected: boolean;
  onSelect: (symbol: string) => void;
}

/**
 * Each row owns its own subscription. A tick on one symbol re-renders exactly one row;
 * memo() stops parent renders (e.g. selecting another symbol) from cascading.
 */
const WatchlistRow = memo(function WatchlistRow({ symbol, name, selected, onSelect }: RowProps) {
  const q = useQuote(symbol);
  const up = q.change >= 0;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(symbol)}
        aria-pressed={selected}
        className={`grid w-full grid-cols-[1fr_auto] items-center gap-x-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
          selected ? 'bg-surface-strong ring-line-strong ring-1' : 'hover:bg-surface'
        }`}
      >
        <span className="min-w-0">
          <span className="flex items-center gap-2 font-mono text-sm font-medium">
            {selected && <span aria-hidden="true" className="bg-accent size-1.5 rounded-full" />}
            {symbol}
          </span>
          <span className="text-fg-subtle block truncate text-xs">{name}</span>
        </span>
        <span className="text-right">
          {/* key={q.v} restarts the flash animation on each published update. */}
          <span
            key={q.v}
            className={`tabular block rounded px-1 text-sm ${
              q.dir === 1 ? 'flash-up' : q.dir === -1 ? 'flash-down' : ''
            }`}
          >
            {fmtPrice(q.price)}
          </span>
          <span className={`tabular block text-xs ${up ? 'text-up' : 'text-down'}`}>
            {fmtPct(q.changePct)}
          </span>
        </span>
      </button>
    </li>
  );
});

interface WatchlistProps {
  selected: string;
  onSelect: (symbol: string) => void;
}

export const Watchlist = memo(function Watchlist({ selected, onSelect }: WatchlistProps) {
  return (
    <div className="flex min-h-0 flex-col">
      <h3 className="text-fg-subtle px-3 pt-3 pb-2 font-mono text-xs tracking-wider uppercase">
        Watchlist
      </h3>
      <ul
        className="grid grid-cols-1 gap-0.5 px-1.5 pb-1.5 sm:grid-cols-2 lg:grid-cols-1"
        aria-label="Simulated symbols"
      >
        {SYMBOLS.map((s) => (
          <WatchlistRow
            key={s.symbol}
            symbol={s.symbol}
            name={s.name}
            selected={s.symbol === selected}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </div>
  );
});
