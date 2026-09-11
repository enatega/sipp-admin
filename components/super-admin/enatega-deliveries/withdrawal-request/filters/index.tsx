'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppButton } from '@/components/shared/AppButton';
import { ClearFiltersButton } from '@/components/shared/filters/ClearFiltersButton';
import { DateRangeFilter } from '@/components/shared/filters/DateRangeFilter';
import SearchUrl from '@/components/shared/SearchUrl';
import AdvanceFiltersDialog from './AdvanceFilter';

export function Filters() {
  const t = useTranslations('withdrawalRequests.filters');
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 mb-2">
      <SearchUrl
        inputClassName="h-11 rounded-[6px]"
        containerClass="max-w-sm w-full"
        paramKey="search"
        placeholder={t('deliveriesSearchPlaceholder')}
      />
      <DateRangeFilter
        startDateParamKey="startDate"
        endDateParamKey="endDate"
      />
      <AppButton
        onClick={() => setOpen(true)}
        leftIcon={<SlidersHorizontal size={16} />}
        variant="secondary"
      >
        {t('advanceFilters')}
      </AppButton>
      <AdvanceFiltersDialog open={open} onClose={() => setOpen(false)} />
      <ClearFiltersButton
        paramKeys={[
          'startDate',
          'endDate',
          'search',
          'requestStatus',
          'vendorId',
          'storeType',
          'shopType',
          'paymentMethod',
          'zoneId',
        ]}
      />
    </div>
  );
}
