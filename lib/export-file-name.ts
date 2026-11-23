type ExportFilters = Record<string, string | number | null | undefined>;

const safePart = (value: string) =>
  value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 36);

export function buildExportFileName(
  report: string,
  filters: ExportFilters,
  exportedAt = new Date(),
): string {
  const selected = Object.entries(filters)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(([key, value]) => `${safePart(key)}-${safePart(String(value))}`)
    .filter((part) => !part.endsWith('-'));
  const context = selected.length ? selected.join('_') : 'all';
  const timestamp = exportedAt.toISOString().replace(/[-:.]/g, '');
  return `${safePart(report)}_${context.slice(0, 140)}_${timestamp}`;
}
