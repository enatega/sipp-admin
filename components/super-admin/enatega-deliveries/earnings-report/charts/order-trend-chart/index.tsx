import { GraphMeta, GraphSeries } from '@/types';
import { useTranslations } from 'next-intl';
import { LineChartCard } from '@/components/shared/charts/LineChart';

interface OrderTrendChartProps {
  meta?: GraphMeta;
  series?: GraphSeries[];
  isLoading: boolean;
}

export default function OrderTrendChart({
  meta,
  series,
  isLoading,
}: OrderTrendChartProps) {
  const t = useTranslations('lumiFood.earningsReports.charts.orderTrend');
  const tLegend = useTranslations('lumiFood.earningsReports.charts.orderTrend.legend');

  return (
    <LineChartCard
      series={series}
      meta={meta}
      isLoading={isLoading}
      title={t('title')}
      description={t('description')}
      legendItems={[
        { label: tLegend('totalOrders'), color: '#111111' },
        { label: tLegend('inProgressOrders'), color: '#F97316' },
        { label: tLegend('pendingOrders'), color: '#10B981' },
        { label: tLegend('completedOrders'), color: '#DFCC00' },
        { label: tLegend('totalEarnings'), color: '#F59E0B' },
        { label: tLegend('totalCommission'), color: '#EC4899' },
      ]}
      seriesColors={{
        totalOrders: {
          line: '#111111',
          fill: 'rgba(247,227,0,0.22)',
        },
        inProgressOrders: {
          line: '#F97316',
          fill: 'rgba(249,115,22,0.12)',
        },
        pendingOrders: {
          line: '#10B981',
          fill: 'rgba(16,185,129,0.12)',
        },
        completedOrders: {
          line: '#DFCC00',
          fill: 'rgba(223,204,0,0.12)',
        },
        totalEarnings: {
          line: '#F59E0B',
          fill: 'rgba(245,158,11,0.12)',
        },
        totalCommission: {
          line: '#EC4899',
          fill: 'rgba(236,72,153,0.12)',
        },
      }}
    />
  );
}
