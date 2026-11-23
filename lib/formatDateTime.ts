import { parseAppDate } from './date';

const DEFAULT_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

export function formatDateTime(
  value?: string | Date | null,
  fallback = 'N/A',
): string {
  if (!value) return fallback;

  const date = parseAppDate(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return DEFAULT_DATE_TIME_FORMATTER.format(date).replace(',', '');
}
