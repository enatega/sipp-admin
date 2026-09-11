'use client';

import { FilterX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { DateRangeFilter } from '@/components/shared/filters/DateRangeFilter';
import { AppSelect } from '@/components/shared/form/AppSelect';
import SearchUrl from '@/components/shared/SearchUrl';

export function Filters() {
  const t = useTranslations('lumiFood.discountsOffers.filters');
  const { setParams, getParam } = useQueryParams();
  const currentDiscountType = getParam('couponType');
  const isFilterActive = (val: string | null) => val && val !== 'all';

  const couponTypeOptions = [
    { key: t('couponTypeAll'), value: 'ALL' },
    { key: t('couponTypePercentage'), value: 'PERCENTAGE' },
    { key: t('couponTypeFixed'), value: 'FIXED' },
  ];
  const hasAdvanceFilters = isFilterActive(getParam('category'));

  const hasAnyFilter =
    getParam('search') ||
    getParam('startDate') ||
    getParam('endDate') ||
    getParam('couponType') ||
    hasAdvanceFilters;

  const clearAllFilters = () => {
    setParams({
      search: null,
      startDate: null,
      endDate: null,
      couponType: null,
      page: '1',
    });
  };

  return (
    <div className="flex items-center gap-2 mb-2">
      <SearchUrl
        containerClass="max-w-sm w-full"
        paramKey="search"
        placeholder={t('searchPlaceholder')}
      />
      <DateRangeFilter
        startDateParamKey="startDate"
        endDateParamKey="endDate"
      />

      <AppSelect
        key={currentDiscountType || 'empty-value'}
        name="couponType"
        placeholder={t('couponTypePlaceholder')}
        options={couponTypeOptions}
        value={currentDiscountType || ''}
        onValueChange={(value) => {
          setParams({ couponType: value || null, page: '1' });
        }}
        emptyText={t('noCouponTypes')}
      />

      {hasAnyFilter && (
        <AppButton
          variant="secondary"
          onClick={clearAllFilters}
          className="text-primary/70"
        >
          <FilterX size={16} className="mr-2 h-11!" />
          {t('clear')}
        </AppButton>
      )}
    </div>
  );
}
