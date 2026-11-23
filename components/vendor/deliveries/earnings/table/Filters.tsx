'use client';

import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ListFilterPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { ClearFiltersButton } from '@/components/shared/filters/ClearFiltersButton';
import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import { SearchInput } from '@/components/shared/SearchInput';
import AdvanceFiltersDialog from './AdvanceFilters';

interface FiltersProps {
  onFilterChange?: () => void;
}

const Filters = ({ onFilterChange }: FiltersProps) => {
  const t = useTranslations('vendorEarnings.table.filters');
  const { getParam, setParams } = useQueryParams();
  const currentZoneId = getParam('zoneId');
  // Local state for search input
  const [searchTerm, setSearchTerm] = useState<string>(
    getParam('search') || '',
  );
  const [isAdvanceFilterOpen, setAdvanceFilterOpen] = useState<boolean>(false);
  const advanceFilterCount = useMemo(() => {
    let count = 0;
    if (currentZoneId) count++;

    return count;
  }, [currentZoneId]);

  const onClose = () => {
    setAdvanceFilterOpen(false);
  };

  const hasAdvanceFilters = advanceFilterCount > 0;
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (getParam('search') || '')) {
        setParams({ search: searchTerm || null, page: '1' });
        onFilterChange?.();
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, setParams, getParam, onFilterChange]);

  const currentStartDate = getParam('startDate');
  const currentEndDate = getParam('endDate');

  return (
    <div className="flex gap-2 items-center">
      <div className="w-full sm:w-[320px]">
        <SearchInput
          inputClassName="h-10 sm:h-11"
          placeholder={t('searchPlaceholder')}
          text={searchTerm}
          onChangeText={(text) => {
            setSearchTerm(text);
          }}
        />
      </div>

      <DateRangePicker
        placeholder={t('dateRangePlaceholder')}
        className="shadow-sm w-full sm:w-auto"
        date={
          currentStartDate && currentEndDate
            ? { from: parseISO(currentStartDate), to: parseISO(currentEndDate) }
            : undefined
        }
        onDateChange={(range) => {
          setParams({
            startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
            endDate: range?.to ? format(range.to, 'yyyy-MM-dd') : null,
            page: '1',
          });
          onFilterChange?.();
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
          'startDate',
          'endDate',
          'zoneId',
          'status',
          'storeId',
        ]}
      />
      <AdvanceFiltersDialog open={isAdvanceFilterOpen} onClose={onClose} />
    </div>
  );
};

export default Filters;
