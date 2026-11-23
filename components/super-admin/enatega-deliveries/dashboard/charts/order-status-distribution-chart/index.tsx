import { useTranslations } from 'next-intl';
import { EnategaDeliveriesDashboardPieChartItem } from '@/types/api/super-admin/enatega-deliveries/dashboard.api';
import { DistributionPieChartCard } from '@/components/shared/charts/DistributionChart';

interface OrderStatusDistributionChartProps {
  data?: EnategaDeliveriesDashboardPieChartItem[];
  isLoading: boolean;
}

const PIE_COLORS: Record<string, string> = {
  'Order Placed': '#F7E300',
  Accepted: '#111111',
  Preparing: '#DFCC00',
  Ready: '#CA8A04',
  'Rider Assigned': '#0D9488',
  'Picked by Rider': '#78716C',
  'Out for Delivery': '#EA580C',
  Arrived: '#5C5C66',
  Delivered: '#16A34A',
  Cancelled: '#DC2626',
  Rejected: '#7C2D12',
  Failed: '#A8A29E',
};

export default function OrderStatusDistributionChart({
  data,
  isLoading,
}: OrderStatusDistributionChartProps) {
  const t = useTranslations('lumiFood.dashboard.charts.orderStatus');

  return (
    <DistributionPieChartCard
      title={t('title')}
      description={t('description')}
      data={data}
      isLoading={isLoading}
      labelKey="name"
      valueKey="percentage"
      colorMap={PIE_COLORS}
      tooltipFormatter={(item) => [
        `${t('statusLabel')}: ${item.name}`,
        `${t('totalOrdersLabel')}: ${item.value.toLocaleString()}`,
        `${t('totalRevenueLabel')}: ${item.revenue.toLocaleString()}`,
      ]}
    />
  );
}
