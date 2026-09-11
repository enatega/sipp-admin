import { PaymentMethodStat } from '@/types';
import { useTranslations } from 'next-intl';
import { DistributionPieChartCard } from '@/components/shared/charts/DistributionChart';

interface IPaymentMethodDistributionChart {
  data: PaymentMethodStat[];
  isLoading: boolean;
}

export default function PaymentMethodDistributionChart({
  data,
  isLoading,
}: IPaymentMethodDistributionChart) {
  const t = useTranslations('lumiFood.earningsReports.charts.paymentMethod');
  const tTooltip = useTranslations(
    'lumiFood.earningsReports.charts.paymentMethod.tooltip',
  );

  return (
    <DistributionPieChartCard
      title={t('title')}
      description={t('description')}
      data={data}
      isLoading={isLoading}
      labelKey="name"
      valueKey="value"
      colorMap={{
        Cash: '#14B8A6',
        Wallet: '#0EA5E9',
        Card: '#F97316',
      }}
      tooltipFormatter={(data) => [
        `${tTooltip('type')}: ${data?.name}`,
        `${tTooltip('totalOrders')}: ${data?.value.toLocaleString()}`,
        `${tTooltip('percentage')}: ${data?.percentage}`,
      ]}
    />
  );
}
