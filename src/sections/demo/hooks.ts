import { createContext, useCallback, useContext, useSyncExternalStore } from 'react';
import type { MarketFeed, Quote, Stats, Status } from './feed';

export const FeedContext = createContext<MarketFeed | null>(null);

export function useFeed(): MarketFeed {
  const feed = useContext(FeedContext);
  if (!feed) throw new Error('useFeed must be used inside <FeedContext.Provider>');
  return feed;
}

/** Subscribes to one symbol only; the component re-renders only when that symbol's quote is republished. */
export function useQuote(symbol: string): Quote {
  const feed = useFeed();
  const subscribe = useCallback(
    (cb: () => void) => feed.subscribeQuote(symbol, cb),
    [feed, symbol],
  );
  const get = useCallback(() => feed.getQuote(symbol), [feed, symbol]);
  return useSyncExternalStore(subscribe, get);
}

export function useStatus(): Status {
  const feed = useFeed();
  return useSyncExternalStore(feed.subscribeStatus, feed.getStatus);
}

export function useStats(): Stats {
  const feed = useFeed();
  return useSyncExternalStore(feed.subscribeStats, feed.getStats);
}
