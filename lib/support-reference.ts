/** A stable, compact display reference; API calls continue to use the full UUID. */
export function supportReference(
  kind: 'ticket' | 'customer',
  id?: string | null,
): string {
  if (!id) return '—';

  const prefix = kind === 'ticket' ? 'TKT' : 'CUS';
  return `${prefix}-${id.replaceAll('-', '').slice(0, 16).toUpperCase()}`;
}
