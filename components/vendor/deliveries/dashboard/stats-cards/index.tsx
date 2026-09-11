'use client';

import { VendorDashboardCards } from '@/types';
import { DollarSign, Package, Truck, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/hooks/use-currency';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/shared/StatCard';

const VendorDashboardStatsCards = ({
  data,
  isLoading,
}: {
  data: VendorDashboardCards;
  isLoading: boolean;
}) => {
  const t = useTranslations('vendorDeliveriesDashboard.statsCards');
  const { currencySymbol } = useCurrency();

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Skeleton className="h-28" key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        title={t('totalOrdersTitle')}
        value={`${Number(data?.totalOrders?.value) ?? 0}`}
        isPositive={Number(data?.totalOrders?.change) >= 0}
        icon={Package}
        change={Number(data?.totalOrders?.change)}
      />
      <StatCard
        title={t('completedOrdersTitle')}
        value={`${Number(data?.completedOrders?.value) ?? 0}`}
        isPositive={Number(data?.completedOrders?.change) >= 0}
        icon={Truck}
        change={Number(data?.completedOrders?.change)}
      />
      <StatCard
        title={t('totalSalesTitle')}
        value={`${currencySymbol} ${(Number(data?.totalSales?.value) ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        isPositive={Number(data?.totalSales?.change) >= 0}
        icon={DollarSign}
        change={Number(data?.totalSales?.change)}
      />
      <StatCard
        title={t('totalStoresTitle')}
        value={`${Number(data?.totalStore?.value) ?? 0}`}
        isPositive={Number(data?.totalStore?.change) >= 0}
        icon={Users}
        change={Number(data?.totalStore?.change)}
      />
    </div>
  );
};

export default VendorDashboardStatsCards;
