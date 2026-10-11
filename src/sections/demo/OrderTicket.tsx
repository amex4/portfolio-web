import { memo, useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { fmtPrice, fmtTime } from './format';
import { useFeed, useQuote } from './hooks';

type Side = 'buy' | 'sell';
type OrderType = 'market' | 'limit';

interface Order {
  id: number;
  symbol: string;
  side: Side;
  type: OrderType;
  qty: number;
  limit?: number;
  status: 'Filled' | 'Working';
  fillPrice?: number;
  time: number;
}

const MAX_QTY = 10_000;
const MAX_ORDERS = 6;

/** Isolated live-price readout: ticks re-render only this, never the form. */
const LivePrice = memo(function LivePrice({ symbol }: { symbol: string }) {
  const q = useQuote(symbol);
  return <span className="tabular text-fg text-sm">LTP {fmtPrice(q.price)}</span>;
});

const Estimate = memo(function Estimate({
  symbol,
  qty,
  limit,
}: {
  symbol: string;
  qty: number;
  limit: number | null;
}) {
  const q = useQuote(symbol);
  const px = limit ?? q.price;
  const value = Number.isFinite(qty) && qty > 0 ? qty * px : 0;
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-fg-subtle">Est. value</span>
      <span className="tabular text-fg">₹{fmtPrice(value)}</span>
    </div>
  );
});

interface OrderTicketProps {
  symbol: string;
}

export const OrderTicket = memo(function OrderTicket({ symbol }: OrderTicketProps) {
  const feed = useFeed();
  const uid = useId();
  const [side, setSide] = useState<Side>('buy');
  const [type, setType] = useState<OrderType>('market');
  const [qty, setQty] = useState('10');
  const [limit, setLimit] = useState('');
  const [errors, setErrors] = useState<{ qty?: string; limit?: string }>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [notice, setNotice] = useState('');
  const nextId = useRef(1);

  // Reset the limit field when switching symbols so a stale price can't be submitted.
  useEffect(() => {
    setLimit('');
    setErrors({});
  }, [symbol]);

  // Working limit orders fill when the simulated price crosses them.
  // Checked on the throttled flush, and state only updates when something actually fills.
  const hasWorking = orders.some((o) => o.status === 'Working');
  useEffect(() => {
    if (!hasWorking) return;
    return feed.subscribeFlush(() => {
      setOrders((prev) => {
        let changed = false;
        const next = prev.map((o) => {
          if (o.status !== 'Working' || o.limit === undefined) return o;
          const p = feed.getQuote(o.symbol).price;
          const crossed = o.side === 'buy' ? p <= o.limit : p >= o.limit;
          if (!crossed) return o;
          changed = true;
          return { ...o, status: 'Filled' as const, fillPrice: o.limit, time: Date.now() };
        });
        return changed ? next : prev;
      });
    });
  }, [feed, hasWorking]);

  const fillLtp = useCallback(() => {
    setLimit(feed.getQuote(symbol).price.toFixed(2));
    setErrors((e) => ({ ...e, limit: undefined }));
  }, [feed, symbol]);

  const validate = () => {
    const next: typeof errors = {};
    const q = Number(qty);
    if (!qty.trim()) next.qty = 'Enter a quantity.';
    else if (!Number.isInteger(q) || q < 1)
      next.qty = 'Quantity must be a whole number of at least 1.';
    else if (q > MAX_QTY) next.qty = `Maximum ${MAX_QTY.toLocaleString('en-IN')} per order.`;

    if (type === 'limit') {
      const ltp = feed.getQuote(symbol).price;
      const l = Number(limit);
      if (!limit.trim()) next.limit = 'Enter a limit price.';
      else if (!Number.isFinite(l) || l <= 0) next.limit = 'Limit price must be greater than 0.';
      else if (Math.abs(l - ltp) / ltp > 0.1)
        next.limit = 'Limit must be within 10% of the last price.';
    }
    return next;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (found.qty || found.limit) return;

    const ltp = feed.getQuote(symbol).price;
    const l = type === 'limit' ? Number(limit) : undefined;
    const fillsNow = type === 'market' || (side === 'buy' ? ltp <= l! : ltp >= l!);
    const order: Order = {
      id: nextId.current++,
      symbol,
      side,
      type,
      qty: Number(qty),
      limit: l,
      status: fillsNow ? 'Filled' : 'Working',
      fillPrice: fillsNow ? (type === 'market' ? ltp : l) : undefined,
      time: Date.now(),
    };
    setOrders((prev) => [order, ...prev].slice(0, MAX_ORDERS));
    setNotice(
      `${side === 'buy' ? 'Buy' : 'Sell'} ${order.qty} ${symbol} ${
        fillsNow ? `filled at ${fmtPrice(order.fillPrice!)}` : `working at ${fmtPrice(l!)}`
      } (simulated).`,
    );
  };

  const isBuy = side === 'buy';
  const limitNum = type === 'limit' && limit.trim() && Number(limit) > 0 ? Number(limit) : null;
  const fieldCls =
    'bg-bg border-line-strong text-fg tabular w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:border-accent aria-[invalid=true]:border-down';

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-fg-subtle font-mono text-xs tracking-wider uppercase">
          Order ticket · <span className="text-fg">{symbol}</span>
        </h3>
        <LivePrice symbol={symbol} />
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-3.5">
        <fieldset>
          <legend className="sr-only">Side</legend>
          <div className="bg-bg border-line grid grid-cols-2 gap-1 rounded-lg border p-1">
            {(['buy', 'sell'] as const).map((s) => (
              <label
                key={s}
                className={`cursor-pointer rounded-md py-2 text-center text-sm font-semibold capitalize transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)] ${
                  side === s
                    ? s === 'buy'
                      ? 'bg-up text-bg'
                      : 'bg-down text-bg'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                <input
                  type="radio"
                  name={`${uid}-side`}
                  value={s}
                  checked={side === s}
                  onChange={() => setSide(s)}
                  className="sr-only"
                />
                {s}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex gap-4 text-sm">
          <legend className="sr-only">Order type</legend>
          {(['market', 'limit'] as const).map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-2 capitalize">
              <input
                type="radio"
                name={`${uid}-type`}
                value={t}
                checked={type === t}
                onChange={() => {
                  setType(t);
                  setErrors({});
                }}
                className="accent-[var(--accent)]"
              />
              {t}
            </label>
          ))}
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${uid}-qty`} className="text-fg-muted mb-1 block text-xs">
              Quantity
            </label>
            <input
              id={`${uid}-qty`}
              inputMode="numeric"
              autoComplete="off"
              value={qty}
              onChange={(e) => setQty(e.target.value.replace(/[^\d]/g, ''))}
              aria-invalid={!!errors.qty}
              aria-describedby={errors.qty ? `${uid}-qty-err` : undefined}
              className={fieldCls}
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor={`${uid}-limit`} className="text-fg-muted block text-xs">
                Limit price
              </label>
              {type === 'limit' && (
                <button
                  type="button"
                  onClick={fillLtp}
                  className="text-accent-text text-xs underline-offset-2 hover:underline"
                >
                  Use LTP
                </button>
              )}
            </div>
            <input
              id={`${uid}-limit`}
              inputMode="decimal"
              autoComplete="off"
              disabled={type === 'market'}
              placeholder={type === 'market' ? 'Market' : '0.00'}
              value={type === 'market' ? '' : limit}
              onChange={(e) => setLimit(e.target.value.replace(/[^\d.]/g, ''))}
              aria-invalid={!!errors.limit}
              aria-describedby={errors.limit ? `${uid}-limit-err` : undefined}
              className={`${fieldCls} disabled:opacity-50`}
            />
          </div>
        </div>
        {(errors.qty || errors.limit) && (
          <div className="text-down -mt-1 space-y-1 text-xs">
            {errors.qty && <p id={`${uid}-qty-err`}>{errors.qty}</p>}
            {errors.limit && <p id={`${uid}-limit-err`}>{errors.limit}</p>}
          </div>
        )}

        <Estimate symbol={symbol} qty={Number(qty)} limit={limitNum} />

        <button
          type="submit"
          className={`min-h-11 rounded-lg text-sm font-semibold transition-[filter,transform] hover:brightness-110 active:scale-[0.99] ${
            isBuy ? 'bg-up text-bg' : 'bg-down text-bg'
          }`}
        >
          {isBuy ? 'Buy' : 'Sell'} {symbol}
        </button>
        <p className="sr-only" role="status" aria-live="polite">
          {notice}
        </p>
      </form>

      <div>
        <h4 className="text-fg-subtle mb-2 font-mono text-xs tracking-wider uppercase">
          Orders (simulated)
        </h4>
        {orders.length === 0 ? (
          <p className="text-fg-subtle text-xs">
            No orders yet. Nothing here touches a real market.
          </p>
        ) : (
          <ul className="divide-line divide-y text-xs">
            {orders.map((o) => (
              <li key={o.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 py-1.5">
                <span
                  className={`rounded px-1.5 py-0.5 font-mono font-semibold uppercase ${
                    o.side === 'buy' ? 'bg-up-soft text-up' : 'bg-down-soft text-down'
                  }`}
                >
                  {o.side}
                </span>
                <span className="tabular text-fg-muted truncate">
                  {o.qty} {o.symbol} @{' '}
                  {o.fillPrice ? fmtPrice(o.fillPrice) : `${fmtPrice(o.limit!)} lmt`}
                </span>
                <span className="tabular text-right">
                  <span className={o.status === 'Filled' ? 'text-fg' : 'text-accent-text'}>
                    {o.status}
                  </span>{' '}
                  <span className="text-fg-subtle">{fmtTime(o.time)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});
