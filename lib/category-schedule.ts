import type { Category, CategoryAvailabilityDay } from '@/types';

/** Display order Monday → Sunday; values follow Date#getDay (0 = Sunday). */
export const CATEGORY_SCHEDULE_WEEK = [1, 2, 3, 4, 5, 6, 0] as const;
export const CATEGORY_SCHEDULE_WEEKDAYS = [1, 2, 3, 4, 5] as const;
export const CATEGORY_SCHEDULE_WEEKEND = [6, 0] as const;

const toHHMM = (value?: string | null) => value?.slice(0, 5) ?? '';

const weekOrder = (day: number) => CATEGORY_SCHEDULE_WEEK.indexOf(day as never);

export const sortAvailabilityDays = (days: CategoryAvailabilityDay[]) =>
  [...days].sort((a, b) => weekOrder(a.day) - weekOrder(b.day));

/**
 * Saved per-day windows when present; otherwise the legacy every-day window expanded to all
 * seven days. Legacy imports often carry 00:00–00:00 placeholders that were never active, so
 * equal or missing legacy times start the form empty instead of showing 12:00 AM – 12:00 AM.
 */
export function availabilityDaysFromCategory(
  category: Pick<Category, 'availabilityDays' | 'availableFrom' | 'availableTo'>,
): CategoryAvailabilityDay[] {
  if (category.availabilityDays?.length) {
    return sortAvailabilityDays(
      category.availabilityDays.map(({ day, from, to }) => ({
        day,
        from: toHHMM(from),
        to: toHHMM(to),
      })),
    );
  }
  const from = toHHMM(category.availableFrom);
  const to = toHHMM(category.availableTo);
  if (!from || !to || from === to) return [];
  return CATEGORY_SCHEDULE_WEEK.map((day) => ({ day, from, to }));
}
