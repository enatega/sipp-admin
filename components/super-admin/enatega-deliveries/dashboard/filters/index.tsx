'use client';

import { useTranslations } from 'next-intl';
import { Heading } from '@/components/shared/Heading';
import { DateRangeFilter } from '@/components/shared/filters/DateRangeFilter';
import { useQueryParams } from '@/hooks/use-query-params';
import { format } from 'date-fns';

export const EnategaDeliveriesDashboardFilters = () => {
  const t = useTranslations('lumiFood.dashboard.filters');
  const { getParam, setParams } = useQueryParams();

  const tabs = [
    {
      label: t('daily'),
      value: 'today',
    },
    {
      label: t('weekly'),
      value: 'this_week',
    },
    {
      label: t('monthly'),
      value: 'this_month',
    },
    {
      label: t('yearly'),
      value: 'all',
    },
    {
      label: t('custom'),
      value: 'custom',
    },
  ];

  const active = getParam('period') || 'all';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Heading title={t('title')} />
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex items-center gap-2 bg-accent/50 p-2 rounded-lg w-fit min-w-min border">
            {tabs.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  if (item.value === 'custom') {
                    const today = format(new Date(), 'yyyy-MM-dd');
                    // API requires `startDate` when `period=custom`. Initialize with today
                    // so switching to "Custom" never results in a broken request.
                    setParams({
                      period: 'custom',
                      startDate: getParam('startDate') || today,
                      endDate: getParam('endDate') || today,
                      page: '1',
                    });
                    return;
                  }
                  // Ensure custom-only params never leak into other periods.
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
