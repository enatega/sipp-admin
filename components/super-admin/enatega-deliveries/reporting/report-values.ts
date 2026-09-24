import type { AdminReportRow } from '@/types/api/super-admin/enatega-deliveries/reporting/reporting.api';

export function getReportValue(row: AdminReportRow, paths: readonly string[]) {
  for (const path of paths) {
    const value = path.split('.').reduce<unknown>((current, part) => {
      if (!current || typeof current !== 'object') return undefined;
      return (current as Record<string, unknown>)[part];
    }, row);
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return null;
}

export function humanize(value: unknown) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function reportMessageKey(value: string) {
  const words = value
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/);
  return words
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`,
    )
    .join('');
}
