export function formatDate(value) {
  if (!value) return 'No expiration';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
}

export function truncate(value, limit = 58) {
  if (!value || value.length <= limit) return value;
  return `${value.slice(0, limit - 1)}…`;
}

export function formatNumber(value = 0) {
  return new Intl.NumberFormat().format(value);
}
