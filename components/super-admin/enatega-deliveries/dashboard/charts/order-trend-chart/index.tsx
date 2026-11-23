import { useTranslations } from 'next-intl';
import { EnategaDeliveriesDashboardGraph } from '@/types/api/super-admin/enatega-deliveries/dashboard.api';
import { LineChartCard } from '@/components/shared/charts/LineChart';

interface OrderTrendChartProps {
  graph?: EnategaDeliveriesDashboardGraph;
  isLoading: boolean;
}

export default function OrderTrendChart({
  graph,
  isLoading,
}: OrderTrendChartProps) {
  const t = useTranslations('lumiFood.dashboard.charts.orderTrend');

  return (
    <LineChartCard
      series={graph?.series}
      meta={graph?.meta}
      isLoading={isLoading}
      title={t('title')}
      description={t('description')}
      legendItems={[
        { label: t('totalOrders'), color: '#0EA5E9' },
        { label: t('inProgressOrders'), color: '#F97316' },
        { label: t('pendingOrders'), color: '#10B981' },
        { label: t('completedOrders'), color: '#8B5CF6' },
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
      }}
    />
  );
}
