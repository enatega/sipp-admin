'use client';

import { useTranslations } from 'next-intl';
import { ClearFiltersButton } from '@/components/shared/filters/ClearFiltersButton';
import { DateRangeFilter } from '@/components/shared/filters/DateRangeFilter';
import SearchUrl from '@/components/shared/SearchUrl';

export function Filters() {
  const t = useTranslations('withdrawalRequests.filters');

  return (
    <div className="flex items-center gap-2 flex-wrap mb-2">
      <SearchUrl
        containerClass="max-w-sm w-full"
        paramKey="search"
        placeholder={t('searchPlaceholder')}
      />
      <DateRangeFilter
        startDateParamKey="startDate"
        endDateParamKey="endDate"
      />
      <ClearFiltersButton paramKeys={['startDate', 'endDate', 'search']} />
    </div>
  );
}
