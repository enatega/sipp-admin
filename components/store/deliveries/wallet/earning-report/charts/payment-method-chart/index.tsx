'use client';

import { DistributionPieChartCard } from '@/components/shared/charts/DistributionChart';
import { StorePaymentMethodStat } from '@/types';
import { useTranslations } from 'next-intl';

interface IStorePaymentMethodDistributionChart {
  data: StorePaymentMethodStat[];
  isLoading: boolean;
}

export default function PaymentMethodDistributionChart({
  data,
  isLoading,
}: IStorePaymentMethodDistributionChart) {
  const t = useTranslations('storeWalletEarningReports.charts.paymentMethod');
  const tTooltip = useTranslations('storeWalletEarningReports.charts.paymentMethod.tooltip');

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
      tooltipFormatter={(item) => [
        `${tTooltip('type')}: ${item.name as string}`,
        `${tTooltip('totalOrders')}: ${(item.value as number).toLocaleString()}`,
        `${tTooltip('percentage')}: ${item.percentage as number}%`,
      ]}
    />
  );
}
