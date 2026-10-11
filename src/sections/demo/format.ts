// Formatters are created once; Intl constructors are expensive to call per tick.
const price = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const signed = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'exceptZero',
});
const time = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export const fmtPrice = (n: number) => price.format(n);
export const fmtSigned = (n: number) => signed.format(n);
export const fmtPct = (n: number) => `${signed.format(n)}%`;
export const fmtTime = (t: number) => time.format(t);
