/**
 * Simulated market-data "socket". No network: prices are a random walk.
 *
 * Performance design:
 * - Raw ticks arrive at ~20Hz and mutate plain objects (no allocation per tick beyond candles).
 * - React-facing quotes are immutable snapshots published on a throttle (QUOTE_FLUSH_MS),
 *   and only for symbols that actually changed. Each subscriber listens to ONE symbol,
 *   so a tick on NOVA never re-renders the ORBT row.
 * - The chart subscribes to raw ticks and redraws on canvas at most once per frame,
 *   bypassing React entirely.
 */

export type Status = 'connecting' | 'live' | 'reconnecting' | 'offline';
export type Direction = 1 | -1 | 0;

export interface Candle {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
}

export interface Quote {
  symbol: string;
  price: number;
  open: number;
  change: number;
  changePct: number;
  dir: Direction;
  /** Monotonic version; changes every published update. */
  v: number;
}

export interface Stats {
  ticksPerSec: number;
  latencyMs: number;
}

export interface SymbolDef {
  symbol: string;
  name: string;
  base: number;
  /** Per-tick volatility (fraction of price). */
  vol: number;
}

export const SYMBOLS: readonly SymbolDef[] = [
  { symbol: 'NOVA', name: 'Nova Energy', base: 2847.5, vol: 0.0009 },
  { symbol: 'ORBT', name: 'Orbit Telecom', base: 1236.2, vol: 0.0011 },
  { symbol: 'HLIX', name: 'Helix Pharma', base: 612.35, vol: 0.0014 },
  { symbol: 'QNTM', name: 'Quantum Infotech', base: 1789.9, vol: 0.001 },
  { symbol: 'APEX', name: 'Apex Finance', base: 948.15, vol: 0.0012 },
  { symbol: 'ZNTH', name: 'Zenith Motors', base: 431.6, vol: 0.0016 },
];

export const CANDLE_MS = 2000;
const MAX_CANDLES = 160;
const TICK_MS = 50;
const QUOTE_FLUSH_MS = 250;
const TICK_SIZE = 0.05;

const roundTick = (p: number) => Math.round(p / TICK_SIZE) * TICK_SIZE;

/** Box–Muller standard normal. */
function gaussian() {
  let u = 0;
  while (u === 0) u = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

interface SymbolState {
  def: SymbolDef;
  price: number;
  open: number;
  /** Slow-moving drift so series trend a little instead of pure noise. */
  drift: number;
  candles: Candle[];
  quote: Quote;
}

type Listener = () => void;

export class MarketFeed {
  private symbols = new Map<string, SymbolState>();
  private quoteListeners = new Map<string, Set<Listener>>();
  private tickListeners = new Set<(symbols: ReadonlySet<string>) => void>();
  private flushListeners = new Set<Listener>();
  private statusListeners = new Set<Listener>();
  private statsListeners = new Set<Listener>();

  private status: Status = 'offline';
  private stats: Stats = { ticksPerSec: 0, latencyMs: 0 };
  private paused = false;

  private tickTimer: ReturnType<typeof setInterval> | undefined;
  private statsTimer: ReturnType<typeof setInterval> | undefined;
  private pendingTimer: ReturnType<typeof setTimeout> | undefined;

  private dirty = new Set<string>();
  private lastFlush = 0;
  private ticksThisSecond = 0;
  private version = 0;

  constructor() {
    const now = Date.now();
    for (const def of SYMBOLS) this.symbols.set(def.symbol, this.seed(def, now));
  }

  // ---------- lifecycle ----------

  connect() {
    if (this.status === 'live' || this.status === 'connecting') return;
    this.clearPending();
    this.setStatus('connecting');
    this.pendingTimer = setTimeout(() => {
      this.setStatus('live');
      this.syncTimers();
    }, 650);
  }

  disconnect() {
    this.clearPending();
    this.setStatus('offline');
    this.syncTimers();
  }

  /** Simulates a dropped socket followed by an automatic reconnect. */
  simulateDrop() {
    if (this.status !== 'live') return;
    this.setStatus('reconnecting');
    this.syncTimers();
    this.pendingTimer = setTimeout(() => {
      this.pendingTimer = undefined;
      this.setStatus('offline');
      this.connect();
    }, 1600);
  }

  /** Pause streaming while the demo is off-screen or the tab is hidden (saves CPU/battery). */
  setPaused(paused: boolean) {
    this.paused = paused;
    this.syncTimers();
  }

  destroy() {
    this.clearPending();
    this.stopTimers();
    this.quoteListeners.clear();
    this.tickListeners.clear();
    this.flushListeners.clear();
    this.statusListeners.clear();
    this.statsListeners.clear();
  }

  // ---------- reads ----------

  getStatus = () => this.status;
  getStats = () => this.stats;
  getQuote = (symbol: string): Quote => this.state(symbol).quote;
  getCandles = (symbol: string): readonly Candle[] => this.state(symbol).candles;

  // ---------- subscriptions (useSyncExternalStore-compatible) ----------

  subscribeQuote(symbol: string, cb: Listener) {
    let set = this.quoteListeners.get(symbol);
    if (!set) this.quoteListeners.set(symbol, (set = new Set()));
    set.add(cb);
    return () => {
      set.delete(cb);
    };
  }

  subscribeTicks(cb: (symbols: ReadonlySet<string>) => void) {
    this.tickListeners.add(cb);
    return () => {
      this.tickListeners.delete(cb);
    };
  }

  /** Fires after each throttled quote flush. */
  subscribeFlush(cb: Listener) {
    this.flushListeners.add(cb);
    return () => {
      this.flushListeners.delete(cb);
    };
  }

  subscribeStatus = (cb: Listener) => {
    this.statusListeners.add(cb);
    return () => {
      this.statusListeners.delete(cb);
    };
  };

  subscribeStats = (cb: Listener) => {
    this.statsListeners.add(cb);
    return () => {
      this.statsListeners.delete(cb);
    };
  };

  // ---------- internals ----------

  private state(symbol: string) {
    const s = this.symbols.get(symbol);
    if (!s) throw new Error(`Unknown symbol ${symbol}`);
    return s;
  }

  private seed(def: SymbolDef, now: number): SymbolState {
    // Walk backwards-in-time history so the chart opens with context.
    const candles: Candle[] = [];
    let price = def.base * (0.97 + Math.random() * 0.03);
    const start = Math.floor(now / CANDLE_MS) * CANDLE_MS - (MAX_CANDLES - 1) * CANDLE_MS;
    for (let i = 0; i < MAX_CANDLES - 1; i++) {
      const o = price;
      let h = o;
      let l = o;
      for (let k = 0; k < 12; k++) {
        price = roundTick(price * (1 + gaussian() * def.vol * 1.6 + 0.00006));
        h = Math.max(h, price);
        l = Math.min(l, price);
      }
      candles.push({ t: start + i * CANDLE_MS, o, h, l, c: price });
    }
    const t = start + (MAX_CANDLES - 1) * CANDLE_MS;
    candles.push({ t, o: price, h: price, l: price, c: price });

    const open = candles[0].o;
    return {
      def,
      price,
      open,
      drift: 0,
      candles,
      quote: this.makeQuote(def.symbol, price, open, 0),
    };
  }

  private makeQuote(symbol: string, price: number, open: number, dir: Direction): Quote {
    const change = price - open;
    return {
      symbol,
      price,
      open,
      change,
      changePct: (change / open) * 100,
      dir,
      v: ++this.version,
    };
  }

  private step = () => {
    const now = Date.now();
    const changed = new Set<string>();

    for (const s of this.symbols.values()) {
      // Not every symbol trades every tick; bursts feel more like a real feed.
      if (Math.random() > 0.55) continue;
      s.drift = s.drift * 0.98 + gaussian() * s.def.vol * 0.08;
      const next = roundTick(s.price * (1 + s.drift + gaussian() * s.def.vol));
      if (next === s.price || next <= 0) continue;
      s.price = next;
      this.updateCandle(s, now);
      changed.add(s.def.symbol);
      this.dirty.add(s.def.symbol);
      this.ticksThisSecond++;
    }

    if (changed.size) this.tickListeners.forEach((cb) => cb(changed));
    if (now - this.lastFlush >= QUOTE_FLUSH_MS) this.flush(now);
  };

  private updateCandle(s: SymbolState, now: number) {
    const last = s.candles[s.candles.length - 1];
    if (now - last.t >= CANDLE_MS) {
      // Align to the wall-clock bucket so a pause doesn't cause a burst of catch-up candles.
      const t = Math.floor(now / CANDLE_MS) * CANDLE_MS;
      const o = last.c;
      s.candles.push({ t, o, h: Math.max(o, s.price), l: Math.min(o, s.price), c: s.price });
      if (s.candles.length > MAX_CANDLES) s.candles.shift();
    } else {
      last.c = s.price;
      if (s.price > last.h) last.h = s.price;
      if (s.price < last.l) last.l = s.price;
    }
  }

  private flush(now: number) {
    this.lastFlush = now;
    if (this.dirty.size === 0) return;
    for (const symbol of this.dirty) {
      const s = this.state(symbol);
      const prev = s.quote.price;
      const dir: Direction = s.price > prev ? 1 : s.price < prev ? -1 : 0;
      s.quote = this.makeQuote(symbol, s.price, s.open, dir);
      this.quoteListeners.get(symbol)?.forEach((cb) => cb());
    }
    this.dirty.clear();
    this.flushListeners.forEach((cb) => cb());
  }

  private publishStats = () => {
    this.stats = {
      ticksPerSec: this.ticksThisSecond,
      latencyMs: Math.round(8 + Math.random() * 14),
    };
    this.ticksThisSecond = 0;
    this.statsListeners.forEach((cb) => cb());
  };

  private setStatus(status: Status) {
    if (this.status === status) return;
    this.status = status;
    if (status !== 'live') {
      this.stats = { ticksPerSec: 0, latencyMs: 0 };
      this.statsListeners.forEach((cb) => cb());
    }
    this.statusListeners.forEach((cb) => cb());
  }

  private syncTimers() {
    const shouldRun = this.status === 'live' && !this.paused;
    if (shouldRun && !this.tickTimer) {
      this.tickTimer = setInterval(this.step, TICK_MS);
      this.statsTimer = setInterval(this.publishStats, 1000);
    } else if (!shouldRun) {
      this.stopTimers();
    }
  }

  private stopTimers() {
    clearInterval(this.tickTimer);
    clearInterval(this.statsTimer);
    this.tickTimer = undefined;
    this.statsTimer = undefined;
  }

  private clearPending() {
    clearTimeout(this.pendingTimer);
    this.pendingTimer = undefined;
  }
}
