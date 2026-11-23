'use client';

import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';
import { DateRangeFilter } from '@/components/shared/filters/DateRangeFilter';
import { useQueryParams } from '@/hooks/use-query-params';
import { format } from 'date-fns';

const StoreDashboardFilters = () => {
  const t = useTranslations('storeDeliveriesDashboard.filters');
  const { getParam, setParams } = useQueryParams();

  const tabs = [
    {
      label: t('allTab'),
      value: 'all',
    },
    {
      label: t('dailyTab'),
      value: 'today',
    },
    {
      label: t('weeklyTab'),
      value: 'this_week',
    },
    {
      label: t('monthlyTab'),
      value: 'this_month',
    },
    {
      label: 'Custom',
      value: 'custom',
    },
  ];

  const active = getParam('period') || 'all';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Heading title={t('dashboardTitle')} />
        <div className="flex items-center gap-2 flex-wrap justify-end">
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

export default StoreDashboardFilters;
