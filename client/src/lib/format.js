export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(String(value).replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(num)) return String(value);
  return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatPercent(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(String(value).replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(num)) return String(value);
  const rounded = Math.round(num * 100) / 100;
  return `${rounded}%`;
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(String(value).replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(num)) return String(value);
  return num.toLocaleString('en-US');
}

export function filterStats(rows) {
  return rows.filter(([, raw]) => Boolean(raw)).map(([label, raw, formatFn]) => [label, formatFn(raw)]);
}

export function formatMonthYear(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
