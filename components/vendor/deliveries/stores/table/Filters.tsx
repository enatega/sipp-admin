'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FilterX, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import { SearchInput } from '@/components/shared/SearchInput';
import AdvanceFiltersDialog from './AdvanceFiltersDialog';

const Filters = () => {
  const t = useTranslations('vendorDeliveriesStores.filters');
  const { getParam, setParams } = useQueryParams();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAdvanceFiltersOpen, setIsAdvanceFiltersOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (getParam('search') || '')) {
        setParams({ search: searchTerm || null, page: '1' });
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, setParams, getParam]);

  const currentStartDate = getParam('startDate');
  const currentEndDate = getParam('endDate');

  const hasAdvanceFilters =
    getParam('shopTypeId') ||
    getParam('zoneId') ||
    getParam('minRating');

  const hasAnyFilter =
    getParam('search') ||
    getParam('startDate') ||
    getParam('endDate') ||
    hasAdvanceFilters;

  const clearAllFilters = () => {
    setSearchTerm('');
    setParams({
      search: null,
      startDate: null,
      endDate: null,
      shopTypeId: null,
      zoneId: null,
      minRating: null,
      page: '1',
    });
  };

  const advanceFilterCount = [
    getParam('shopTypeId'),
    getParam('zoneId'),
    getParam('minRating'),
  ].filter(Boolean).length;

  return (
    <>
      <div className="flex gap-2 flex-wrap items-center">
        <div className="w-[320px]">
          <SearchInput
            inputClassName="h-11"
            placeholder={t('searchPlaceholder')}
            text={searchTerm}
            onChangeText={(text) => {
              setSearchTerm(text);
            }}
          />
        </div>

        <DateRangePicker
          placeholder={t('filterByDateRange')}
          className="shadow-sm"
          date={
            currentStartDate && currentEndDate
              ? {
                  from: parseISO(currentStartDate),
                  to: parseISO(currentEndDate),
                }
              : undefined
          }
          onDateChange={(range) => {
            setParams({
              startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
              endDate: range?.to ? format(range.to, 'yyyy-MM-dd') : null,
              page: '1',
            });
          }}
        />

        <AppButton
          variant={hasAdvanceFilters ? 'primary' : 'secondary'}
          onClick={() => setIsAdvanceFiltersOpen(true)}
          className="relative"
        >
          <SlidersHorizontal size={16} className="mr-2" />
          {t('advanceFilters')}
          {advanceFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {advanceFilterCount}
            </span>
          )}
        </AppButton>

        {hasAnyFilter && (
          <AppButton
            variant="secondary"
            onClick={clearAllFilters}
            className="text-primary/70"
          >
            <FilterX size={16} className="mr-2 h-11!" />
            {t('clearAll')}
          </AppButton>
        )}
      </div>

      <AdvanceFiltersDialog
        open={isAdvanceFiltersOpen}
        onClose={() => setIsAdvanceFiltersOpen(false)}
      />
    </>
  );
};

export default Filters;
