const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeDateRange(
  dateFrom?: string | null,
  dateTo?: string | null,
) {
  if (
    dateFrom &&
    dateTo &&
    DATE_ONLY.test(dateFrom) &&
    DATE_ONLY.test(dateTo) &&
    dateFrom > dateTo
  ) {
    return { dateFrom: dateTo, dateTo: dateFrom, swapped: true };
  }

  return { dateFrom, dateTo, swapped: false };
}
