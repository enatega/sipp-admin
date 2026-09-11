'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FilterX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { MultiSelect } from '@/components/shared/form/AppMultiSelect';
import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import { SearchInput } from '@/components/shared/SearchInput';
import { VendorWithdrawalStatus } from '../types';

const statusOptions: VendorWithdrawalStatus[] = [
  'all',
  'pending',
  'approved',
  'rejected',
];

interface FiltersProps {
  onFilterChange?: () => void;
}

const WithdrawalRequestFilters = ({ onFilterChange }: FiltersProps) => {
  const t = useTranslations('vendorWithdrawalRequest.table');
  const tStatuses = useTranslations('vendorWithdrawalRequest.table.statuses');
  const statusDisplayNames: Record<VendorWithdrawalStatus, string> = {
    all: tStatuses('all'),
    pending: tStatuses('pending'),
    approved: tStatuses('approved'),
    rejected: tStatuses('rejected'),
  };
  const { getParam, setParams } = useQueryParams();

  // Local state for search input
  const [searchTerm, setSearchTerm] = useState<string>(
    getParam('search') || '',
  );

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
  const currentStatus = getParam('status');

  const clearFilters = () => {
    setSearchTerm('');
    setParams({
      search: null,
      startDate: null,
      endDate: null,
      status: null,
      page: '1',
    });
    onFilterChange?.();
  };

  const showClearButton =
    getParam('search') ||
    getParam('startDate') ||
    getParam('endDate') ||
    getParam('status');

  return (
    <div className="flex gap-2 flex-wrap items-center">
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

      <MultiSelect
        options={statusOptions.map((s) => statusDisplayNames[s])}
        selected={
          currentStatus
            ? currentStatus
                .split(',')
                .map((s) => statusDisplayNames[s as VendorWithdrawalStatus])
            : []
        }
        onChange={(newStatuses) => {
          const mappedStatuses = newStatuses
            .map((displayName) => {
              const entry = Object.entries(statusDisplayNames).find(
                ([, v]) => v === displayName,
              );
              return entry?.[0];
            })
            .filter(Boolean) as VendorWithdrawalStatus[];
          setParams({
            status: mappedStatuses.length > 0 ? mappedStatuses.join(',') : null,
            page: '1',
          });
          onFilterChange?.();
        }}
        placeholder={t('statusPlaceholder')}
        className="shadow-sm w-full sm:w-auto"
      />

      {showClearButton && (
        <AppButton
          variant="secondary"
          onClick={clearFilters}
          className="text-primary/70 w-full sm:w-auto"
        >
          <FilterX size={16} className="mr-2 !h-10 sm:!h-11" />
          {t('clear')}
        </AppButton>
      )}
    </div>
  );
};

export default WithdrawalRequestFilters;
