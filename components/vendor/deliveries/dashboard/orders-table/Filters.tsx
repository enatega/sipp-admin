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
import { VendorOrderStatus } from '../types';

const statusOptions: VendorOrderStatus[] = [
  'pending',
  'in_progress',
  'ongoing',
  'in_transit',
  'delivered',
  'completed',
  'cancelled',
];

const zoneOptions = [
  { value: 'Downtown', translationKey: 'downtown' },
  { value: 'Midtown', translationKey: 'midtown' },
  { value: 'Uptown', translationKey: 'uptown' },
  { value: 'Suburb North', translationKey: 'suburbNorth' },
  { value: 'Suburb South', translationKey: 'suburbSouth' },
] as const;

interface FiltersProps {
  onFilterChange?: () => void;
}

const Filters = ({ onFilterChange }: FiltersProps) => {
  const t = useTranslations('vendorDeliveriesDashboard.ordersTable.filters');
  const tStatuses = useTranslations('vendorDeliveriesDashboard.ordersTable.statuses');
  const tZones = useTranslations('vendorDeliveriesDashboard.ordersTable.filters.zones');
  const { getParam, setParams } = useQueryParams();

  // Local state for search input
  const [searchTerm, setSearchTerm] = useState<string>(getParam('search') || '');

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
  const currentZone = getParam('zone');

  const clearFilters = () => {
    setSearchTerm('');
    setParams({
      search: null,
      startDate: null,
      endDate: null,
      status: null,
      zone: null,
      page: '1',
    });
    onFilterChange?.();
  };

  const showClearButton =
    getParam('search') ||
    getParam('startDate') ||
    getParam('endDate') ||
    getParam('status') ||
    getParam('zone');

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
        options={statusOptions.map((status) => ({
          value: status,
          key: tStatuses(status),
        }))}
        selected={
          currentStatus
            ? currentStatus
                .split(',')
                .filter(Boolean)
            : []
        }
        onChange={(newStatuses) => {
          setParams({
            status: newStatuses.length > 0 ? newStatuses.join(',') : null,
            page: '1',
          });
          onFilterChange?.();
        }}
        placeholder={t('statusPlaceholder')}
        className="shadow-sm w-full sm:w-auto"
      />

      <MultiSelect
        options={zoneOptions.map((zone) => ({
          value: zone.value,
          key: tZones(zone.translationKey),
        }))}
        selected={currentZone ? currentZone.split(',') : []}
        onChange={(newZones) => {
          setParams({
            zone: newZones.length > 0 ? newZones.join(',') : null,
            page: '1',
          });
          onFilterChange?.();
        }}
        placeholder={t('zonePlaceholder')}
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

export default Filters;
