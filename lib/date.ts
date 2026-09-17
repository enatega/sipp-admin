export function isToday(date: Date) {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function isYesterday(date: Date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

export function formatDateGroup(date: Date) {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
}

export function formatTime(dateInput: Date | string | number | undefined): string {
  if (!dateInput) return '';
  const then = parseAppDate(dateInput);
  if (Number.isNaN(then.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - then.getTime();

  if (diffMs < 60000) return 'just now';

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function parseAppDate(dateInput: Date | string | number): Date {
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'number') return new Date(dateInput);
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(dateInput)
    ? dateInput
    : `${dateInput}Z`;
  return new Date(normalized);
}
