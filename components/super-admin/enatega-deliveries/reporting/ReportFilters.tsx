'use client';

import SearchUrl from '@/components/shared/SearchUrl';
import { ClearFiltersButton } from '@/components/shared/filters/ClearFiltersButton';
import { DateRangeFilter } from '@/components/shared/filters/DateRangeFilter';
import { ZoneSelectFilter } from '@/components/shared/filters/ZoneSelectFilter';
import { AppSelect } from '@/components/shared/form/AppSelect';
import { AppSearchableSelect } from '@/components/shared/form/AppSearchableSelect';
import { useGetAllSimpleStores } from '@/hooks/api/super-admin/enatega-deliveries/stores';
import { useQueryParams } from '@/hooks/use-query-params';
import { useTranslations } from 'next-intl';

const PAYMENT_OPTIONS = [
  { key: 'Cash', value: 'cash' },
  { key: 'Card', value: 'card' },
  { key: 'Wallet', value: 'wallet' },
];

const ORDER_STATUS_OPTIONS = [
  { key: 'Pending', value: 'pending' },
  { key: 'Scheduled', value: 'scheduled' },
  { key: 'Accepted', value: 'accepted' },
  { key: 'Preparing', value: 'preparing' },
  { key: 'Ready', value: 'ready' },
  { key: 'Rider assigned', value: 'rider_assigned' },
  { key: 'Picked up', value: 'picked_up' },
  { key: 'Out for delivery', value: 'out_for_delivery' },
  { key: 'Arrived', value: 'arrived' },
  { key: 'Delivered', value: 'delivered' },
  { key: 'Rejected', value: 'rejected' },
  { key: 'Failed', value: 'failed' },
  { key: 'Cancelled', value: 'cancelled' },
];

const FILTER_KEYS = [
  'search',
  'dateFrom',
  'dateTo',
  'zoneId',
  'storeId',
  'paymentMethod',
  'orderStatus',
];

export function ReportFilters() {
  const t = useTranslations('reporting.filters');
  const { getParam, setParams } = useQueryParams();
  const { data: stores, isLoading, isError } = useGetAllSimpleStores({
    refetchOnWindowFocus: false,
  });

  const storeOptions = (stores ?? []).map((store) => ({
    key: store.storename,
    value: store.id,
  })).sort((first, second) => first.key.localeCompare(second.key));

  return (
    <section
      aria-label={t('ariaLabel')}
      className="rounded-xl border bg-white p-4 shadow-xs"
    >
      <div className="flex flex-wrap items-end gap-3">
        <SearchUrl
          placeholder={t('search')}
          containerClass="min-w-[220px] flex-1"
          inputClassName="h-11"
        />
        <DateRangeFilter
          startDateParamKey="dateFrom"
          endDateParamKey="dateTo"
          className="min-w-[250px]"
        />
        <ZoneSelectFilter
          paramKey="zoneId"
          placeholder={t('allCities')}
        />
        <AppSearchableSelect
          name="storeId"
          placeholder={t('allRestaurants')}
          searchPlaceholder={t('searchRestaurants')}
          emptyText={t('noRestaurantsFound')}
          options={storeOptions}
          value={getParam('storeId') || ''}
          onValueChange={(value) =>
            setParams({ storeId: value || null, page: '1' })
          }
          loading={isLoading}
          error={isError ? t('restaurantLoadError') : undefined}
          loadingText={t('loadingRestaurants')}
          containerClassName="min-w-[220px]"
        />
        <AppSelect
          name="paymentMethod"
          placeholder={t('allPaymentMethods')}
          options={PAYMENT_OPTIONS.map((option) => ({
            ...option,
            key: t(`payment.${option.value}`),
          }))}
          value={getParam('paymentMethod') || ''}
          onValueChange={(value) =>
            setParams({ paymentMethod: value || null, page: '1' })
          }
          containerClassName="min-w-[170px]"
          className="h-11 rounded-md"
        />
        <AppSelect
          name="orderStatus"
          placeholder={t('allOrderStatuses')}
          options={ORDER_STATUS_OPTIONS.map((option) => ({
            ...option,
            key: t(`status.${option.value}`),
          }))}
          value={getParam('orderStatus') || ''}
          onValueChange={(value) =>
            setParams({ orderStatus: value || null, page: '1' })
          }
          containerClassName="min-w-[170px]"
          className="h-11 rounded-md"
        />
        <ClearFiltersButton paramKeys={FILTER_KEYS} />
      </div>
    </section>
  );
}
