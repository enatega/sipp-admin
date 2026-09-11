import { useTranslations } from 'next-intl';
import { EnategaDeliveriesDashboardPieChartItem } from '@/types/api/super-admin/enatega-deliveries/dashboard.api';
import { DistributionPieChartCard } from '@/components/shared/charts/DistributionChart';

interface OrderStatusDistributionChartProps {
  data?: EnategaDeliveriesDashboardPieChartItem[];
  isLoading: boolean;
}

const PIE_COLORS: Record<string, string> = {
  'Order Placed': '#0EA5E9',
  'Rider Assigned': '#14B8A6',
  'Picked By Rider': '#F97316',
  'Out For Delivery': '#EAB308',
  Delivered: '#10B981',
  Cancelled: '#EF4444',
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
