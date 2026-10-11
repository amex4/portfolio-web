import { useCallback, useEffect, useRef, useState } from 'react';
import { CandleChart } from './CandleChart';
import { MarketFeed, SYMBOLS } from './feed';
import { fmtPct, fmtPrice, fmtSigned } from './format';
import { FeedContext, useQuote } from './hooks';
import { OrderTicket } from './OrderTicket';
import { StatusBar } from './StatusBar';
import { Watchlist } from './Watchlist';

function ChartHeader({ symbol }: { symbol: string }) {
  const q = useQuote(symbol);
  const name = SYMBOLS.find((s) => s.symbol === symbol)?.name;
  const up = q.change >= 0;
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-3 pt-3 sm:px-4">
      <h3 className="font-mono text-base font-semibold">
        {symbol} <span className="text-fg-subtle text-xs font-normal">{name}</span>
      </h3>
      <span className="tabular text-xl font-medium">{fmtPrice(q.price)}</span>
      <span className={`tabular text-sm ${up ? 'text-up' : 'text-down'}`}>
        {fmtSigned(q.change)} ({fmtPct(q.changePct)})
      </span>
      <span className="text-fg-subtle ml-auto font-mono text-xs">2s candles</span>
    </div>
  );
}

/**
 * Default export so it can be React.lazy()'d. Owns one MarketFeed instance
 * and pauses it when off-screen or when the tab is hidden.
 */
export default function MarketDemo() {
  const [feed] = useState(() => new MarketFeed());
  const [symbol, setSymbol] = useState(SYMBOLS[0].symbol);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feed.connect();
    let visible = true;
    let onScreen = true;
    const apply = () => feed.setPaused(!(visible && onScreen));

    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      apply();
    });
    if (rootRef.current) io.observe(rootRef.current);

    const onVis = () => {
      visible = document.visibilityState === 'visible';
      apply();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      feed.destroy();
    };
  }, [feed]);

  // Stable reference so memoized watchlist rows don't re-render on selection elsewhere.
  const onSelect = useCallback((s: string) => setSymbol(s), []);

  return (
    <FeedContext.Provider value={feed}>
      <div
        ref={rootRef}
        className="border-line-strong bg-bg-elev/80 overflow-hidden rounded-2xl border shadow-[0_30px_80px_-40px_rgb(0_0_0/0.6)] backdrop-blur"
      >
        <StatusBar />
        <div className="grid lg:grid-cols-[220px_1fr_300px]">
          <div className="border-line order-2 border-t lg:order-1 lg:border-t-0 lg:border-r">
            <Watchlist selected={symbol} onSelect={onSelect} />
          </div>
          <div className="order-1 flex min-w-0 flex-col lg:order-2">
            <ChartHeader symbol={symbol} />
            <div className="h-[280px] px-1 pt-2 pb-1 sm:h-[360px] lg:h-full lg:min-h-[420px]">
              <CandleChart symbol={symbol} />
            </div>
          </div>
          <div className="border-line order-3 border-t lg:border-t-0 lg:border-l">
            <OrderTicket symbol={symbol} />
          </div>
        </div>
      </div>
    </FeedContext.Provider>
  );
}
