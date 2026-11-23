'use client';

import { LineChartCard } from '@/components/shared/charts/LineChart';
import { StoreEarningGraph } from '@/types';
import { useTranslations } from 'next-intl';

interface ITotalEarningAndCommissionLineChart {
  graph?: StoreEarningGraph;
  isLoading: boolean;
}

export default function TotalEarningAndCommissionLineChart({
  graph,
  isLoading,
}: ITotalEarningAndCommissionLineChart) {
  const t = useTranslations('storeWalletEarningReports.charts.totalEarningCommission');
  const tLegend = useTranslations('storeWalletEarningReports.charts.totalEarningCommission.legend');

  return (
    <LineChartCard
      series={graph?.series ?? []}
      meta={graph?.meta}
      isLoading={isLoading}
      title={t('title')}
      description={t('description')}
      legendItems={[
        { label: tLegend('totalEarnings'), color: '#111111' },
        { label: tLegend('totalCommission'), color: '#F97316' },
      ]}
      seriesColors={{
        totalEarnings: {
          line: '#111111',
          fill: 'rgba(247,227,0,0.22)',
        },
        totalCommission: {
          line: '#F97316',
          fill: 'rgba(249,115,22,0.12)',
        },
      }}
    />
  );
}
