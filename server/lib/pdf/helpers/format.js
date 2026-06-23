export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(String(value).replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(num)) return esc(String(value));
  return `$${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatPercent(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(String(value).replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(num)) return esc(String(value));
  const rounded = Math.round(num * 100) / 100;
  return `${rounded}%`;
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(String(value).replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(num)) return esc(String(value));
  return num.toLocaleString('en-US');
}

export function formatMonthYear(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return esc(isoDate);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function escOrDash(str) {
  const v = esc(str);
  return v === '' ? '—' : v;
}

export function normalizeUrl(input) {
  if (!input) return '';
  const trimmed = String(input).trim();
  if (!trimmed) return '';
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
