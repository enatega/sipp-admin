import { parseAppDate } from './date';

export const ADMIN_TIME_ZONE = 'America/Costa_Rica';

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
};
const formatters = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  const existing = formatters.get(timeZone);
  if (existing) return existing;
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', { ...DATE_TIME_OPTIONS, timeZone });
    formatters.set(timeZone, formatter);
    return formatter;
  } catch {
    return getFormatter('UTC');
  }
}

/** Consistent timestamp rendering for delivery-admin order surfaces. */
export function formatAdminDateTime(
  value?: string | Date | null,
  fallback = 'N/A',
  timeZone = ADMIN_TIME_ZONE,
): string {
  if (!value) return fallback;

  const date = parseAppDate(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return getFormatter(timeZone).format(date).replace(',', '');
}

const wallClockFormatters = new Map<string, Intl.DateTimeFormat>();

function zonedParts(date: Date, timeZone: string) {
  let formatter = wallClockFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    wallClockFormatters.set(timeZone, formatter);
  }
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, Number(part.value)]),
  );
  return {
    year: parts.year,
    month: parts.month - 1,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

/**
 * The wall-clock time of `date` in `timeZone`, as a local Date. Date pickers
 * work in browser-local fields, so they edit this value instead of `date`.
 */
export function toZonedWallClock(date: Date, timeZone: string): Date {
  const p = zonedParts(date, timeZone);
  return new Date(p.year, p.month, p.day, p.hour, p.minute, p.second);
}

/** The instant whose wall clock in `timeZone` matches `wall`'s local fields. */
export function fromZonedWallClock(wall: Date, timeZone: string): Date {
  const target = Date.UTC(
    wall.getFullYear(),
    wall.getMonth(),
    wall.getDate(),
    wall.getHours(),
    wall.getMinutes(),
    wall.getSeconds(),
  );
  const offsetAt = (instant: number) => {
    const p = zonedParts(new Date(instant), timeZone);
    return Date.UTC(p.year, p.month, p.day, p.hour, p.minute, p.second) - instant;
  };
  // A second pass settles instants next to a DST change.
  let instant = target - offsetAt(target);
  instant = target - offsetAt(instant);
  return new Date(instant);
}

const SHORT_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
};

/** "26 Oct 2026 12:00 pm" in the platform time zone, without seconds. */
export function formatAdminDateTimeShort(
  value?: string | Date | null,
  fallback = 'N/A',
  timeZone = ADMIN_TIME_ZONE,
): string {
  if (!value) return fallback;
  const date = parseAppDate(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat('en-GB', { ...SHORT_DATE_TIME_OPTIONS, timeZone })
    .format(date)
    .replace(',', '');
}
