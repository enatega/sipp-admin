'use client';

import { useTranslations } from 'next-intl';
import {
  useGetEarningReport,
  useGetEarningView,
} from '@/hooks/api/super-admin/enatega-deliveries/earning-report';
import { StatsCardCarousel } from '@/components/shared/carousel/StatsCardCarousel';
import OrderTrendChart from '@/components/super-admin/enatega-deliveries/earnings-report/charts/order-trend-chart';
import { EarningViewTable } from '@/components/super-admin/enatega-deliveries/earnings-report/earning-view-table/table';
import { buildStatsData } from '@/components/super-admin/enatega-deliveries/earnings-report/stats-card-data/data';
import { EnategaDeliveriesEarningsReportFilters } from '@/components/super-admin/enatega-deliveries/earnings-report/filters';

const EarningReports = () => {
  const tStats = useTranslations('lumiFood.earningsReports.statsCards');
  const { data, isLoading } = useGetEarningReport();
  const {
    data: tableData,
    isLoading: isTableLoading,
    isError,
    error,
  } = useGetEarningView();

  const statsData = buildStatsData(data?.cards, {
    totalEarnings: tStats('totalEarnings'),
    totalOrders: tStats('totalOrders'),
    totalCommission: tStats('totalCommission'),
    totalWithdrawals: tStats('totalWithdrawals'),
    totalSales: tStats('totalSales'),
  });

  return (
    <div className="space-y-6">
      <EnategaDeliveriesEarningsReportFilters />
      <StatsCardCarousel statsData={statsData ?? []} isLoading={isLoading} />
      <OrderTrendChart
        meta={data?.graph?.meta}
        series={data?.graph?.series}
        isLoading={isLoading}
      />
      <EarningViewTable
        earningData={tableData?.data ?? []}
        isLoading={isTableLoading}
        isError={isError}
        error={error}
        pagination={tableData?.pagination ?? { total: 0, limit: 10, page: 1 }}
      />
    </div>
  );
};

export default EarningReports;
