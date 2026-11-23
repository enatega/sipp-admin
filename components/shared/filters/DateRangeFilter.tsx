'use client';

import { useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';
import { useQueryParams } from '@/hooks/use-query-params';
import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import { normalizeDateRange } from '@/lib/normalizeDateRange';

interface Props {
  startDateParamKey?: string;
  endDateParamKey?: string;
  className?: string;
  normalizeReversedRange?: boolean;
}

export function DateRangeFilter({
  startDateParamKey = 'startDate',
  endDateParamKey = 'endDate',
  className,
  normalizeReversedRange = false,
}: Props) {
  const t = useTranslations('common.filters');
  const { getParam, setParams } = useQueryParams();

  const startDate = getParam(startDateParamKey);
  const endDate = getParam(endDateParamKey);
  const displayDates = normalizeReversedRange
    ? normalizeDateRange(startDate, endDate)
    : { dateFrom: startDate, dateTo: endDate };

  return (
    <DateRangePicker
      placeholder={t('dateRangePlaceholder')}
      className={className}
      date={
        displayDates.dateFrom && displayDates.dateTo
          ? { from: parseISO(displayDates.dateFrom), to: parseISO(displayDates.dateTo) }
          : undefined
      }
      onDateChange={(range) => {
        setParams({
          [startDateParamKey]: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
          [endDateParamKey]: range?.to ? format(range.to, 'yyyy-MM-dd') : null,
          page: '1',
        });
      }}
    />
  );
}
