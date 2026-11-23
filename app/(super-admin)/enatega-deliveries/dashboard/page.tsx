'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { returnErrorMessage } from '@/lib/toast-error';
import { useGetEnategaDeliveriesDashboardStats } from '@/hooks/api/super-admin/enatega-deliveries/dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCardCarousel } from '@/components/shared/carousel/StatsCardCarousel';
import DisplayError from '@/components/shared/DisplayError';
import { EnategaDeliveriesDashboardFilters } from '@/components/super-admin/enatega-deliveries/dashboard/filters';
import { getEnategaDeliveriesDashboardStatsData } from '@/components/super-admin/enatega-deliveries/dashboard/stats-cards/data';
import { RecentOrdersTable } from '@/components/super-admin/enatega-deliveries/dashboard/tables/recent-orders-tabe';
import { TopPerformerTables } from '@/components/super-admin/enatega-deliveries/dashboard/tables/top-performer-tables';

// Lazy load chart components for better performance
const OrderStatusDistributionChart = dynamic(
  () =>
    import(
      '@/components/super-admin/enatega-deliveries/dashboard/charts/order-status-distribution-chart'
    ),
  {
    loading: () => (
      <div className="h-64 bg-accent rounded animate-pulse" />
    ),
    ssr: false,
  }
);

const OrderTrendChart = dynamic(
  () =>
    import(
      '@/components/super-admin/enatega-deliveries/dashboard/charts/order-trend-chart'
    ),
  {
    loading: () => (
      <div className="h-64 bg-accent rounded animate-pulse" />
    ),
    ssr: false,
  }
);

const EnategaDeliveriesDashboard = () => {
  const t = useTranslations('lumiFood.dashboard.errors');
  const tStatsCards = useTranslations('lumiFood.dashboard.statsCards');
  const { data, isLoading, isError, error } = useGetEnategaDeliveriesDashboardStats();
  const errorMessage = isError ? returnErrorMessage(error) : undefined;

  return (
    <div className="space-y-6">
      <EnategaDeliveriesDashboardFilters />
      {isError && (
        <DisplayError
          title={t('loadFailedTitle')}
          message={errorMessage}
          variant="error"
        />
      )}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <StatsCardCarousel
          statsData={getEnategaDeliveriesDashboardStatsData(data?.cards, tStatsCards)}
        />
      )}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
        <div className="w-full">
          <OrderTrendChart graph={data?.graph} isLoading={isLoading} />
        </div>
        <div className="w-full">
          <OrderStatusDistributionChart
            data={data?.pieChart}
            isLoading={isLoading}
          />
        </div>
      </div>
      <RecentOrdersTable
        data={data?.recentOrders}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
      />
      <TopPerformerTables
        topVendors={data?.topVendors}
        topStores={data?.topStores}
        topZones={data?.topZones}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default EnategaDeliveriesDashboard;
