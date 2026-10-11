import { memo, useEffect, useState } from 'react';
import type { Status } from './feed';
import { useFeed, useStats, useStatus } from './hooks';

const STATUS_UI: Record<Status, { label: string; dot: string; text: string }> = {
  live: { label: 'Live', dot: 'bg-up pulse-dot', text: 'text-up' },
  connecting: { label: 'Connecting…', dot: 'bg-accent pulse-dot', text: 'text-accent-text' },
  reconnecting: { label: 'Reconnecting…', dot: 'bg-accent pulse-dot', text: 'text-accent-text' },
  offline: { label: 'Offline', dot: 'bg-down', text: 'text-down' },
};

/** Measured frame rate, sampled once per second. Proves the 60fps claim live. */
function useFps() {
  const [fps, setFps] = useState(0);
  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      frames++;
      if (now - last >= 1000) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return fps;
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <span className="flex items-baseline gap-1.5">
    <span className="text-fg-subtle">{label}</span>
    <span className="tabular text-fg">{value}</span>
  </span>
);

const Telemetry = memo(function Telemetry() {
  const stats = useStats();
  const fps = useFps();
  return (
    <div className="hidden items-center gap-4 font-mono text-xs sm:flex">
      <Metric label="ticks/s" value={String(stats.ticksPerSec).padStart(3, ' ')} />
      <Metric label="latency" value={stats.latencyMs ? `${stats.latencyMs}ms` : '—'} />
      <Metric label="fps" value={fps ? String(fps) : '—'} />
    </div>
  );
});

export const StatusBar = memo(function StatusBar() {
  const feed = useFeed();
  const status = useStatus();
  const ui = STATUS_UI[status];
  const connected = status === 'live' || status === 'connecting';

  return (
    <div className="border-line flex flex-wrap items-center justify-between gap-3 border-b px-3 py-2.5 sm:px-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex items-center gap-2 font-mono text-xs font-medium ${ui.text}`}
          role="status"
          aria-live="polite"
        >
          <span aria-hidden="true" className={`size-2 rounded-full ${ui.dot}`} />
          {ui.label}
        </span>
        <span className="text-fg-subtle hidden font-mono text-xs md:inline">
          wss://sim.local/market
        </span>
      </div>
      <Telemetry />
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => feed.simulateDrop()}
          disabled={status !== 'live'}
          className="border-line text-fg-muted hover:text-fg hover:bg-surface-strong min-h-9 rounded-md border px-2.5 font-mono text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          Drop connection
        </button>
        <button
          type="button"
          onClick={() => (connected ? feed.disconnect() : feed.connect())}
          disabled={status === 'reconnecting'}
          className="border-line text-fg-muted hover:text-fg hover:bg-surface-strong min-h-9 rounded-md border px-2.5 font-mono text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  );
});
