'use client';

import { useTranslations } from 'next-intl';
import { ClearFiltersButton } from '@/components/shared/filters/ClearFiltersButton';
import { DateRangeFilter } from '@/components/shared/filters/DateRangeFilter';
import { ZoneSelectFilter } from '@/components/shared/filters/ZoneSelectFilter';
import SearchUrl from '@/components/shared/SearchUrl';

export function Filters() {
  const t = useTranslations('lumiFood.vendors.filters');

  return (
    <div className="flex items-center flex-wrap gap-2">
      <div className="w-[320px]">
        <SearchUrl
          inputClassName="h-11 rounded-[6px]"
          placeholder={t('searchPlaceholder')}
          paramKey="search"
        />
      </div>

      <DateRangeFilter
        startDateParamKey="startDate"
        endDateParamKey="endDate"
      />
      <ZoneSelectFilter
        paramKey="zoneId"
        placeholder={t('selectZonePlaceHolder')}
      />
      <ClearFiltersButton
        paramKeys={['search', 'startDate', 'endDate', 'zoneId']}
      />
    </div>
  );
}
