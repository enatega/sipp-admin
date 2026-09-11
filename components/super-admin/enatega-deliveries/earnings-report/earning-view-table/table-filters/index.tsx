'use client';

import { ClearFiltersButton } from '@/components/shared/filters/ClearFiltersButton';
import { DateRangeFilter } from '@/components/shared/filters/DateRangeFilter';
import { useTranslations } from 'next-intl';
import SearchUrl from '@/components/shared/SearchUrl';

export function EarningReportsFilters() {
  const t = useTranslations('lumiFood.earningsReports.table.filters');

  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      <SearchUrl
        placeholder={t('searchPlaceholder')}
        paramKey="search"
        inputClassName="h-11 w-[320px] "
      />
      <DateRangeFilter
        startDateParamKey="startDate"
        endDateParamKey="endDate"
      />
      <ClearFiltersButton
        paramKeys={['search', 'startDate', 'endDate', 'status', 'active_status']}
      />
    </div>
  );
}
