'use client';

import { useMemo } from 'react';
import { StatsCardCarousel } from '@/components/shared/carousel/StatsCardCarousel';
import { EarningsPerZoneChart } from '@/components/shared/charts/EarningsPerZoneChart';
import { Heading } from '@/components/shared/Heading';
import PaymentMethodDistributionChart from '@/components/store/deliveries/wallet/earning-report/charts/payment-method-chart';
import TotalEarningAndCommissionLineChart from '@/components/store/deliveries/wallet/earning-report/charts/total-earning-commission-chart';
import { EarningViewTable } from '@/components/store/deliveries/wallet/earning-report/earning-view-table';
import { EarningReportPageFilters } from '@/components/store/deliveries/wallet/earning-report/PageFilters';
import { buildStoreStatsData } from '@/components/store/deliveries/wallet/earning-report/top-stats-card/data';
import {
  useGetStoreEarningDashboard,
  useGetStoreEarningView,
} from '@/hooks/api/store/deliveries/wallet/earning-report';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

const StoreEarningReports = () => {
  const t = useTranslations('storeWalletEarningReports');
  const tStats = useTranslations('storeWalletEarningReports.stats');
  const { storeId } = useParams<{ storeId: string }>();

  const { data, isLoading } = useGetStoreEarningDashboard(storeId);
  const {
    data: tableData,
    isLoading: isTableLoading,
    isError,
    error,
  } = useGetStoreEarningView(storeId);

  const statsData = buildStoreStatsData(data?.cards, {
    netEarnings: tStats('netEarnings'),
    commissionAndVat: tStats('commissionAndVat'),
    pendingWithdrawals: tStats('pendingWithdrawals'),
  });

  const fallbackPagination = useMemo(
    () => ({
      total: 0,
      limit: 10,
      page: 1,
      hasNext: false,
      hasPrevious: false,
    }),
    [],
  );

  const zoneChartData = (data?.zoneWiseEarnings ?? []).map((z) => ({
    zoneId: z.name,
    zoneTitle: z.name,
    orderCount: z.orders,
    revenue: z.revenue,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Heading title={t('title')} />
        <EarningReportPageFilters />
      </div>
      <StatsCardCarousel statsData={statsData} isLoading={isLoading} />
      <TotalEarningAndCommissionLineChart graph={data?.graph} isLoading={isLoading} />
      <div className="grid lg:grid-cols-[3fr_1fr] grid-cols-1 gap-4">
        <EarningsPerZoneChart data={zoneChartData} isLoading={isLoading} />
        <PaymentMethodDistributionChart
          data={data?.paymentMethod ?? []}
          isLoading={isLoading}
        />
      </div>
      <EarningViewTable
        earningData={tableData?.data ?? []}
        isLoading={isTableLoading}
        isError={isError}
        error={error}
        pagination={tableData?.pagination ?? fallbackPagination}
      />
    </div>
  );
};

export default StoreEarningReports;
