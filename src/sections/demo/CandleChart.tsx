import { memo, useEffect, useRef } from 'react';
import { CANDLE_MS, type Candle } from './feed';
import { fmtPrice, fmtTime } from './format';
import { useFeed } from './hooks';

interface CandleChartProps {
  symbol: string;
}

interface Palette {
  up: string;
  down: string;
  grid: string;
  text: string;
  accent: string;
  accentFg: string;
  bg: string;
  line: string;
}

const AXIS_W = 68;
const AXIS_H = 22;
const PAD_TOP = 12;

function readPalette(el: Element): Palette {
  const cs = getComputedStyle(el);
  const v = (name: string) => cs.getPropertyValue(name).trim();
  return {
    up: v('--up'),
    down: v('--down'),
    grid: v('--line'),
    text: v('--fg-subtle'),
    accent: v('--accent'),
    accentFg: v('--accent-fg'),
    bg: v('--bg-elev'),
    line: v('--line-strong'),
  };
}

/** "Nice" price step for ~n gridlines. */
function niceStep(range: number, n: number) {
  const raw = range / n;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  return (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
}

/**
 * Canvas candlestick chart. React renders this component once per symbol change;
 * every tick after that is drawn imperatively, coalesced to one draw per animation frame.
 */
export const CandleChart = memo(function CandleChart({ symbol }: CandleChartProps) {
  const feed = useFeed();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let palette = readPalette(canvas);
    let width = 0;
    let height = 0;
    let frame = 0;
    let hoverX: number | null = null;

    const draw = () => {
      frame = 0;
      if (width === 0 || height === 0) return;
      const candles = feed.getCandles(symbol);
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const plotW = width - AXIS_W;
      const plotH = height - AXIS_H - PAD_TOP;
      // Candle width adapts to container: fewer, fatter candles on mobile.
      const slot = Math.max(5, Math.min(11, plotW / 90));
      const count = Math.min(candles.length, Math.floor(plotW / slot));
      const visible = candles.slice(candles.length - count);
      if (visible.length === 0) return;

      let hi = -Infinity;
      let lo = Infinity;
      for (const c of visible) {
        if (c.h > hi) hi = c.h;
        if (c.l < lo) lo = c.l;
      }
      const padding = (hi - lo) * 0.08 || hi * 0.001;
      hi += padding;
      lo -= padding;
      const y = (p: number) => PAD_TOP + ((hi - p) / (hi - lo)) * plotH;
      const x0 = plotW - visible.length * slot;

      // Grid + price labels
      ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 1;
      const step = niceStep(hi - lo, 5);
      ctx.strokeStyle = palette.grid;
      ctx.fillStyle = palette.text;
      ctx.beginPath();
      for (let p = Math.ceil(lo / step) * step; p <= hi; p += step) {
        const yy = Math.round(y(p)) + 0.5;
        ctx.moveTo(0, yy);
        ctx.lineTo(plotW, yy);
        ctx.fillText(fmtPrice(p), plotW + 8, yy);
      }
      // Time labels every ~20 candles
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'center';
      const every = Math.max(1, Math.round(120 / slot));
      visible.forEach((c, i) => {
        if ((c.t / CANDLE_MS) % every !== 0) return;
        const xx = Math.round(x0 + i * slot + slot / 2) + 0.5;
        ctx.moveTo(xx, PAD_TOP);
        ctx.lineTo(xx, PAD_TOP + plotH);
        if (xx > 30 && xx < plotW - 30) ctx.fillText(fmtTime(c.t), xx, height - 6);
      });
      ctx.stroke();
      ctx.textAlign = 'start';

      // Candles: batch by color to minimise state changes.
      const bodyW = Math.max(1, Math.floor(slot * 0.62));
      const drawSet = (up: boolean) => {
        ctx.fillStyle = up ? palette.up : palette.down;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.beginPath();
        visible.forEach((c: Candle, i) => {
          if (c.c >= c.o !== up) return;
          const cx = Math.round(x0 + i * slot + slot / 2) + 0.5;
          ctx.moveTo(cx, Math.round(y(c.h)));
          ctx.lineTo(cx, Math.round(y(c.l)));
        });
        ctx.stroke();
        visible.forEach((c: Candle, i) => {
          if (c.c >= c.o !== up) return;
          const left = Math.round(x0 + i * slot + (slot - bodyW) / 2);
          const top = Math.round(y(Math.max(c.o, c.c)));
          const h = Math.max(1, Math.round(y(Math.min(c.o, c.c))) - top);
          ctx.fillRect(left, top, bodyW, h);
        });
      };
      drawSet(true);
      drawSet(false);

      // Last-price line + tag
      const last = visible[visible.length - 1];
      const ly = Math.round(y(last.c)) + 0.5;
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = palette.accent;
      ctx.beginPath();
      ctx.moveTo(0, ly);
      ctx.lineTo(plotW, ly);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = palette.accent;
      ctx.fillRect(plotW + 2, ly - 10, AXIS_W - 4, 20);
      ctx.fillStyle = palette.accentFg;
      ctx.textBaseline = 'middle';
      ctx.fillText(fmtPrice(last.c), plotW + 8, ly);

      // Crosshair + OHLC readout on hover
      if (hoverX !== null && hoverX < plotW) {
        const i = Math.floor((hoverX - x0) / slot);
        const c = visible[i];
        if (c) {
          const cx = Math.round(x0 + i * slot + slot / 2) + 0.5;
          ctx.strokeStyle = palette.line;
          ctx.beginPath();
          ctx.moveTo(cx, PAD_TOP);
          ctx.lineTo(cx, PAD_TOP + plotH);
          ctx.stroke();
          const text = `${fmtTime(c.t)}  O ${fmtPrice(c.o)}  H ${fmtPrice(c.h)}  L ${fmtPrice(c.l)}  C ${fmtPrice(c.c)}`;
          const tw = ctx.measureText(text).width + 16;
          ctx.fillStyle = palette.bg;
          ctx.fillRect(8, PAD_TOP, tw, 22);
          ctx.strokeRect(8.5, PAD_TOP + 0.5, tw - 1, 21);
          ctx.fillStyle = c.c >= c.o ? palette.up : palette.down;
          ctx.fillText(text, 16, PAD_TOP + 11);
        }
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      schedule();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Re-read colors when the theme flips.
    const mo = new MutationObserver(() => {
      palette = readPalette(canvas);
      schedule();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const unsubscribe = feed.subscribeTicks((changed) => {
      if (changed.has(symbol)) schedule();
    });

    const onMove = (e: PointerEvent) => {
      hoverX = e.clientX - canvas.getBoundingClientRect().left;
      schedule();
    };
    const onLeave = () => {
      hoverX = null;
      schedule();
    };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    resize();

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      mo.disconnect();
      unsubscribe();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [feed, symbol]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Simulated live candlestick chart for ${symbol}, 2-second candles. Hover to inspect open, high, low, and close.`}
      className="block h-full w-full touch-pan-y"
    />
  );
});
