'use client';

import { useTranslations } from 'next-intl';
import { returnErrorMessage } from '@/lib/toast-error';
import { useVendorDashboard } from '@/hooks/api/vendor/deliveries/dashboard';
import DisplayError from '@/components/shared/DisplayError';
import {
  VendorCategorySales,
  VendorDashboardCards,
  VendorGraph,
  VendorPeakHour,
  VendorRecentOrder,
} from '@/types';
import CategorySalesChart from './charts/CategorySales';
import OrderOverview from './charts/OrderOverview';
import PeakHoursChart from './charts/PeakHoursChart';
import VendorDashboardFilters from './filters';
import VendorOrdersTable from './orders-table';
import VendorDashboardStatsCards from './stats-cards';

const EMPTY_CARDS: VendorDashboardCards = {
  totalSales: { value: 0, change: 0 },
  totalOrders: { value: 0, change: 0 },
  completedOrders: { value: 0, change: 0 },
  totalStore: { value: 0, change: 0 },
};

const EMPTY_CATEGORY_SALES: VendorCategorySales = {
  totalSales: 0,
  totalRevenue: 0,
  chart: [],
};

const EMPTY_GRAPH: VendorGraph = {
  meta: { granularity: 'year' },
  series: [],
};

const VendorDashboard = () => {
  const t = useTranslations('vendorDeliveriesDashboard.errors');
  const { data, isLoading, isError, error } = useVendorDashboard();
  
  const errorMessage = isError ? returnErrorMessage(error) : undefined;
  const cardsData = data?.cards ?? EMPTY_CARDS;
  const peakHours: VendorPeakHour[] = data?.peakHours ?? [];
  const categorySales = data?.categorySales ?? EMPTY_CATEGORY_SALES;
  const graphData = data?.graph ?? EMPTY_GRAPH;
  const recentOrders: VendorRecentOrder[] = data?.recentOrders ?? [];

  if (isError) {
    return (
      <div className="space-y-6">
        <VendorDashboardFilters />
        <DisplayError
          title={t('fetchFailedTitle')}
          message={errorMessage}
          variant="error"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <VendorDashboardFilters />
      <VendorDashboardStatsCards data={cardsData} isLoading={isLoading} />
      <OrderOverview
        series={graphData.series}
        meta={graphData.meta}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <PeakHoursChart
          data={peakHours}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
        />
        <CategorySalesChart
          data={categorySales}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
        />
      </div>

      <VendorOrdersTable
        data={recentOrders}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default VendorDashboard;
