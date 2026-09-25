'use client';

import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useGetAllSimpleStores } from '@/hooks/api/super-admin/enatega-deliveries/stores';
import { useQueryParams } from '@/hooks/use-query-params';
import { DateRangeFilter } from '@/components/shared/filters/DateRangeFilter';
import { AppSearchableSelect } from '@/components/shared/form/AppSearchableSelect';
import { Heading } from '@/components/shared/Heading';

export const EnategaDeliveriesEarningsReportFilters = () => {
  const tPage = useTranslations('lumiFood.earningsReports.page');
  const t = useTranslations('lumiFood.dashboard.filters');
  const tReporting = useTranslations('reporting.filters');
  const { getParam, setParams } = useQueryParams();
  const {
    data: stores,
    isLoading,
    isError,
  } = useGetAllSimpleStores({
    refetchOnWindowFocus: false,
  });

  const storeOptions = (stores ?? [])
    .map((store) => ({ key: store.storename, value: store.id }))
    .sort((first, second) => first.key.localeCompare(second.key));

  const tabs = [
    { label: t('daily'), value: 'today' },
    { label: t('weekly'), value: 'this_week' },
    { label: t('monthly'), value: 'this_month' },
    { label: t('yearly'), value: 'all' },
    { label: t('custom'), value: 'custom' },
  ];

  const active = getParam('period') || 'all';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Heading title={tPage('title')} />
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <AppSearchableSelect
            name="storeId"
            placeholder={tReporting('allRestaurants')}
            searchPlaceholder={tReporting('searchRestaurants')}
            emptyText={tReporting('noRestaurantsFound')}
            options={storeOptions}
            value={getParam('storeId') || ''}
            onValueChange={(value) =>
              setParams({ storeId: value || null, page: '1' })
            }
            loading={isLoading}
            error={isError ? tReporting('restaurantLoadError') : undefined}
            loadingText={tReporting('loadingRestaurants')}
            containerClassName="min-w-[220px]"
          />
          <div className="flex items-center gap-2 bg-accent/50 p-2 rounded-lg w-fit min-w-min border">
            {tabs.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  if (item.value === 'custom') {
                    const today = format(new Date(), 'yyyy-MM-dd');
                    setParams({
                      period: 'custom',
                      startDate: getParam('startDate') || today,
                      endDate: getParam('endDate') || today,
                      page: '1',
                    });
                    return;
                  }

                  setParams({
                    period: item.value,
                    startDate: null,
                    endDate: null,
                    page: '1',
                  });
                }}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  active === item.value
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {active === 'custom' ? (
            <DateRangeFilter className="min-w-[260px]" />
          ) : null}
        </div>
      </div>
    </div>
  );
};
