'use client';

import { useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import { AppButton } from '@/components/shared/AppButton';
import { FilterX } from 'lucide-react';

const TYPE_OPTIONS = [
  { key: 'all', value: 'all' },
  { key: 'referral', value: 'referral' },
  { key: 'loyalty', value: 'loyalty' },
];

const HistoryFilters = () => {
  const t = useTranslations('deliveriesCustomerLoyaltyAndReferrals.referralAndLoyaltyHistory');
  const { getParam, setParams } = useQueryParams();

  const typeFilter = getParam('historyType') || 'all';
  const startDate = getParam('startDate');
  const endDate = getParam('endDate');

  const handleTypeChange = (value: string) => {
    setParams({
      historyType: value === 'all' ? null : value,
      page: '1',
    });
  };

  const handleDateChange = (range: { from?: Date; to?: Date } | undefined) => {
    setParams({
      startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
      endDate: range?.to ? format(range.to, 'yyyy-MM-dd') : null,
      page: '1',
    });
  };

  const clearFilters = () => {
    setParams({
      historyType: null,
      startDate: null,
      endDate: null,
      page: '1',
    });
  };

  const showClearButton = getParam('historyType') || startDate || endDate;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <AppSelect
        name="historyType"
        placeholder={t('filters.typePlaceholder')}
        options={TYPE_OPTIONS.map((opt) => ({
          key: t(`filters.types.${opt.key}`),
          value: opt.value,
        }))}
        value={typeFilter}
        onValueChange={handleTypeChange}
        containerClassName="w-[180px]"
      />

      <DateRangePicker
        placeholder={t('filters.dateRangePlaceholder')}
        className="shadow-sm"
        date={
          startDate && endDate
            ? { from: parseISO(startDate), to: parseISO(endDate) }
            : undefined
        }
        onDateChange={handleDateChange}
      />
      {showClearButton && (
        <AppButton
          variant="secondary"
          onClick={clearFilters}
          className="text-primary/70"
        >
          <FilterX size={16} className="mr-2" />
          {t('filters.clear')}
        </AppButton>
      )}
    </div>
  );
};

export { HistoryFilters };
