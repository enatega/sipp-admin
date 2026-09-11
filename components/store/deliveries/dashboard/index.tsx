'use client';

import { useTranslations } from 'next-intl';
import { returnErrorMessage } from '@/lib/toast-error';
import { useStoreDashboard } from '@/hooks/api/store/deliveries/dashboard';
import DisplayError from '@/components/shared/DisplayError';
import {
  StoreCustomerGrowth,
  StoreDashboardCards,
  StoreGraph,
  StorePeakHour,
  StoreRecentOrder,
} from '@/types';
import StoreDeliveryStatusChart from './charts/DeliveryStatusChart';
import StoreRevenueChart from './charts/RevenueChart';
import StoreZonePerformanceChart from './charts/ZonePerformanceChart';
import StoreDashboardFilters from './filters';
import StoreOrdersTable from './orders-table';
import StoreDashboardStatsCards from './stats-cards';

const EMPTY_CARDS: StoreDashboardCards = {
  totalSales: { value: 0, change: 0 },
  totalOrders: { value: 0, change: 0 },
  storeRating: { value: 0, change: 0 },
  cancelledOrders: { value: 0, change: 0 },
};

const EMPTY_CUSTOMER_GROWTH: StoreCustomerGrowth = {
  totalSales: 0,
  totalRevenue: 0,
  chart: [],
};

const EMPTY_GRAPH: StoreGraph = {
  meta: { granularity: 'year' },
  series: [],
};

const StoreDashboard = () => {
  const tErrors = useTranslations('storeDeliveriesDashboard.errors');
  const { data, isLoading, isError, error } = useStoreDashboard();
  const errorMessage = isError ? returnErrorMessage(error) : undefined;
  const cardsData = data?.cards ?? EMPTY_CARDS;
  const peakHours: StorePeakHour[] = data?.peakHours ?? [];
  const customerGrowth = data?.customerGrowth ?? EMPTY_CUSTOMER_GROWTH;
  const graphData = data?.graph ?? EMPTY_GRAPH;
  const recentOrders: StoreRecentOrder[] = data?.recentOrders ?? [];

  if (isError) {
    return (
      <div className="space-y-6">
        <StoreDashboardFilters />
        <DisplayError
          title={tErrors('fetchFailedTitle')}
          message={errorMessage || tErrors('fetchFailedMessage')}
          variant="error"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StoreDashboardFilters />
      <StoreDashboardStatsCards data={cardsData} isLoading={isLoading} />
      <StoreRevenueChart
        series={graphData.series}
        meta={graphData.meta}
        isLoading={isLoading}
      />
      <div className="grid lg:grid-cols-[3fr_1fr] gap-6">
        <StoreZonePerformanceChart
          data={peakHours}
          isLoading={isLoading}
        />
        <StoreDeliveryStatusChart
          data={customerGrowth}
          isLoading={isLoading}
        />
      </div>
      <StoreOrdersTable data={recentOrders} isLoading={isLoading} />
    </div>
  );
};

export default StoreDashboard;
