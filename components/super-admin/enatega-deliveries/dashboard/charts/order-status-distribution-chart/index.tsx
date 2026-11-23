import { useTranslations } from 'next-intl';
import { EnategaDeliveriesDashboardPieChartItem } from '@/types/api/super-admin/enatega-deliveries/dashboard.api';
import { DistributionPieChartCard } from '@/components/shared/charts/DistributionChart';

interface OrderStatusDistributionChartProps {
  data?: EnategaDeliveriesDashboardPieChartItem[];
  isLoading: boolean;
}

const PIE_COLORS: Record<string, string> = {
  'Order Placed': '#2563EB',
  Accepted: '#0891B2',
  Preparing: '#9333EA',
  Ready: '#CA8A04',
  'Rider Assigned': '#0D9488',
  'Picked by Rider': '#DB2777',
  'Out for Delivery': '#EA580C',
  Arrived: '#4F46E5',
  Delivered: '#16A34A',
  Cancelled: '#DC2626',
  Rejected: '#7C2D12',
  Failed: '#475569',
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
