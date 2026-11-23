'use client';

import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { DateRangeFilter } from '@/components/shared/filters/DateRangeFilter';
import { useQueryParams } from '@/hooks/use-query-params';

type Period = 'all' | 'today' | 'this_week' | 'this_month' | 'custom';

const periods: Period[] = ['all', 'today', 'this_week', 'this_month', 'custom'];

export function EarningReportPageFilters() {
  const tFilters = useTranslations('storeWalletEarningReports.table.filters');
  const { getParam, setParams } = useQueryParams();

  const activePeriod = getParam('period') || 'all';

  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      <div className="flex items-center gap-2 bg-accent/50 p-2 rounded-lg w-fit min-w-min border">
        {periods.map((period) => {
          const labelKey =
            period === 'this_week'
              ? 'thisWeek'
              : period === 'this_month'
                ? 'thisMonth'
                : period;

          return (
            <button
              key={period}
              onClick={() => {
                if (period === 'custom') {
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
                  period,
                  startDate: null,
                  endDate: null,
                  page: '1',
                });
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activePeriod === period
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tFilters(`periodOptions.${labelKey}`)}
            </button>
          );
        })}
      </div>

      {activePeriod === 'custom' ? (
        <DateRangeFilter className="min-w-[260px]" />
      ) : null}
    </div>
  );
}
