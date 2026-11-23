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
        { label: t('totalOrders'), color: '#111111' },
        { label: t('inProgressOrders'), color: '#F97316' },
        { label: t('pendingOrders'), color: '#10B981' },
        { label: t('completedOrders'), color: '#DFCC00' },
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
      }}
    />
  );
}
