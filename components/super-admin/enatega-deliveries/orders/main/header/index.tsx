'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FilterX, SlidersHorizontal } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import type { OrdersItem as Order } from '@/types/api/super-admin/enatega-deliveries/orders.api';
import { useCurrency } from '@/hooks/use-currency';
import { useQueryParams } from '@/hooks/use-query-params';
import { AppButton } from '@/components/shared/AppButton';
import { DownloadButtons } from '@/components/shared/DownloadButtons';
import { fetchAllReport } from '@/lib/fetch-all-report';
import { useDeliveriesAdminModeScope } from '@/hooks/use-deliveries-admin-mode-scope';
import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import { Heading } from '@/components/shared/Heading';
import { SearchInput } from '@/components/shared/SearchInput';
import TooltipText from '@/components/shared/TooltipText';
import AdvanceFiltersDialog from './AdvanceFiltersDialog';

interface IOrdersHeaderProps {
  data: Order[];
  hideStore?: boolean;
}

export function OrdersHeader({ data, hideStore }: IOrdersHeaderProps) {
  const t = useTranslations('orders');
  const tTable = useTranslations('orders.table');
  const tFilters = useTranslations('orders.filters');
  const tFields = useTranslations('orders.filters.advanced.fields');
  const { getParam, setParams, getAllParams } = useQueryParams();
  const allParams = getAllParams() as Record<string, string>;
  const currency = useCurrency();
  const modeScope = useDeliveriesAdminModeScope();
  // Local state for search input
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

  const {
    start_date: currentStartDate,
    end_date: currentEndDate,
    order_type: currentOrderType,
    status: currentStatus,
    store: currentStore,
    vendor: currentVendor,
    zoneCity: currentZone,
    paymentMethod: currentPaymentMethod,
  } = allParams;

  const advancedFiltersMap = {
    [tFields('orderType')]: currentOrderType,
    [tFields('orderStatus')]: currentStatus,
    [tFields('store')]: currentStore,
    [tFields('vendor')]: currentVendor,
    [tFields('zoneCity')]: currentZone,
    [tFields('paymentMethod')]: currentPaymentMethod,
  };

  const activeAdvanceFiltersList = Object.entries(advancedFiltersMap)
    .filter(([, value]) => !!value)
    .map(([key, value]) => `${key}: ${value}`);

  const activeAdvanceFiltersCount = activeAdvanceFiltersList.length;

  const tooltipContent =
    activeAdvanceFiltersList.length > 0
      ? `${tFilters('activeFilters')}\n${activeAdvanceFiltersList.join('\n')}`
      : '';

  const hasAnyFilters =
    activeAdvanceFiltersCount > 0 ||
    currentStartDate ||
    currentEndDate ||
    (allParams.search && allParams.search !== '');

  const clearAllFilters = () => {
    setSearchTerm('');

    const filtersToClear = [
      'search',
      'start_date',
      'end_date',
      'order_type',
      'status',
      'store',
      'vendor',
      'zoneCity',
      'paymentMethod',
    ];

    setParams({
      page: '1',
      ...Object.fromEntries(filtersToClear.map((key) => [key, null])),
    });
  };

  const orderDownloadColumns = [
    { header: tTable('orderId'), dataKey: 'orderId' },
    {
      header: tTable('customerName'),
      dataKey: 'customerName',
      formatter: (item: Order) => item.customerName ?? '',
    },
    { header: tTable('vendor'), dataKey: 'vendorName' },
    { header: tTable('store'), dataKey: 'storeName' },
    {
      header: tTable('amount'),
      dataKey: 'amount',
      formatter: (item: Order) => `${currency.currencyCode} ${item?.amount}`,
    },
    // Zone and rider assignment columns removed (not required)
    { header: tTable('status'), dataKey: 'status' },
    {
      header: tTable('dateTime'),
      dataKey: 'dateTime',
      formatter: (item: Order) =>
        moment(item?.dateTime).format('DD MMM YYYY, hh:mm A') || '',
    },
  ];

  return (
    <div className="space-y-6 mb-4">
      <div className="flex flex-col gap-6">
        {/* Top row */}
        <div className="flex items-center justify-between mb-1 flex-wrap">
          <Heading title={t('title')} />
        </div>

        {/* Second row: Filters and Export buttons */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 w-full">
          {/* Left side: Filter group */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 w-full lg:w-auto">
            <SearchInput
              placeholder={tFilters('searchPlaceholder')}
              containerClass="w-full sm:w-[300px] lg:w-[350px]"
              inputClassName="h-11"
              text={searchTerm}
              onChangeText={(text) => setSearchTerm(text)}
            />

            <DateRangePicker
              placeholder={tFilters('filterByDateRange')}
              className="w-full sm:w-auto shadow-sm"
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
                  start_date: range?.from
                    ? format(range.from, 'yyyy-MM-dd')
                    : null,
                  end_date: range?.to ? format(range.to, 'yyyy-MM-dd') : null,
                  page: '1',
                });
              }}
            />

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <TooltipText
                content={tooltipContent}
                disabled={activeAdvanceFiltersCount === 0}
              >
                <div className="relative w-full sm:w-auto">
                  <AppButton
                    variant={
                      activeAdvanceFiltersCount > 0 ? 'primary' : 'secondary'
                    }
                    className="h-11 shadow-sm w-full sm:w-auto relative"
                    onClick={() => setIsAdvanceFiltersOpen(true)}
                  >
                    <SlidersHorizontal size={16} className="mr-2" />
                    {tFilters('advanceFiltersButton')}
                    {activeAdvanceFiltersCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
                        {activeAdvanceFiltersCount}
                      </span>
                    )}
                  </AppButton>
                </div>
              </TooltipText>

              {hasAnyFilters && (
                <AppButton
                  variant="secondary"
                  className="h-11 shadow-sm text-primary/70 border border-sidebar-border w-full sm:w-auto whitespace-nowrap h-11!"
                  onClick={clearAllFilters}
                >
                  <FilterX size={16} className="mr-2" />
                  {tFilters('clearFiltersButton')}
                </AppButton>
              )}
            </div>
          </div>

          {/* Right side: Export buttons */}
          <div className="flex items-center gap-2 w-full lg:w-fit justify-start lg:justify-end shrink-0">
            <DownloadButtons<Order>
              fileName="orders_report"
              data={data}
              columns={orderDownloadColumns}
              fetchAll={() => fetchAllReport<Order>('/apps/deliveries/super-admin/orders', { params: { modeScope, vendorId: getParam('vendorId') || undefined, start_date: getParam('start_date') || undefined, end_date: getParam('end_date') || undefined } })}
            />
          </div>
        </div>
      </div>

      <AdvanceFiltersDialog
        open={isAdvanceFiltersOpen}
        onClose={() => setIsAdvanceFiltersOpen(false)}
        hideStore={hideStore}
      />
    </div>
  );
}
