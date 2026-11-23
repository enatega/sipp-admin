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
        { label: tLegend('totalOrders'), color: '#0EA5E9' },
        { label: tLegend('inProgressOrders'), color: '#F97316' },
        { label: tLegend('pendingOrders'), color: '#10B981' },
        { label: tLegend('completedOrders'), color: '#8B5CF6' },
        { label: tLegend('totalEarnings'), color: '#F59E0B' },
        { label: tLegend('totalCommission'), color: '#EC4899' },
      ]}
      seriesColors={{
        totalOrders: {
          line: '#0EA5E9',
          fill: 'rgba(14,165,233,0.12)',
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
          line: '#8B5CF6',
          fill: 'rgba(139,92,246,0.12)',
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
