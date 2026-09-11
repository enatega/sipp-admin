'use client';

import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ListFilterPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import SearchUrl from '@/components/shared/SearchUrl';
import { ClearFiltersButton } from '@/components/shared/filters/ClearFiltersButton';
import AdvanceFiltersDialog from './AdvanceFilter';

const Filters = () => {
  const t = useTranslations('driverManagement.driversTable.filters');
  const { getParam, setParams } = useQueryParams();
  const [isAdvanceFilterOpen, setAdvanceFilterOpen] = useState<boolean>(false);

  const startDate = getParam('start_date');
  const endDate = getParam('end_date');
  const currentZoneId = getParam('zoneId');
  const currentStatus = getParam('status');
  const currentRating = getParam('rating');
  const currentVehicle = getParam('vehicleType');

  const advanceFilterCount = useMemo(() => {
    let count = 0;
    if (currentZoneId) count++;
    if (currentStatus) count++;
    if (currentRating) count++;
    if (currentVehicle) count++;
    return count;
  }, [currentZoneId, currentStatus, currentRating, currentVehicle]);

  const hasAdvanceFilters = advanceFilterCount > 0;

  const onClose = () => {
    setAdvanceFilterOpen(false);
  };

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="w-[320px]">
        <SearchUrl placeholder={t('searchPlaceholder')} inputClassName="h-11" />
      </div>

      <DateRangePicker
        placeholder={t('filterByDateRange')}
        className="shadow-sm"
        date={
          startDate && endDate
            ? { from: parseISO(startDate), to: parseISO(endDate) }
            : undefined
        }
        onDateChange={(range) => {
          setParams({
            start_date: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
            end_date: range?.to ? format(range.to, 'yyyy-MM-dd') : null,
            page: '1',
          });
        }}
      />

      <AppButton
        variant="secondary"
        onClick={() => setAdvanceFilterOpen(true)}
        className="text-primary h-11 relative"
      >
        <ListFilterPlus size={16} className="mr-2" />
        {t('advanceFilters')}
        {hasAdvanceFilters && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {advanceFilterCount}
          </span>
        )}
      </AppButton>

      <ClearFiltersButton
        paramKeys={[
          'search',
          'start_date',
          'end_date',
          'zoneId',
          'status',
          'rating',
          'vehicleType',
        ]}
      />
      <AdvanceFiltersDialog open={isAdvanceFilterOpen} onClose={onClose} />
    </div>
  );
};

export default Filters;
